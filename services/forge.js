const { AuthenticationClient, DataManagementClient } = require('simpler-forge-apis');

const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET, FORGE_CALLBACK_URL } = process.env;
if (!FORGE_CLIENT_ID || !FORGE_CLIENT_SECRET || !FORGE_CALLBACK_URL) {
    console.warn('Missing some of the environment variables.');
    process.exit(1);
}
const INTERNAL_TOKEN_SCOPES = ['data:read', 'viewables:read'];
const PUBLIC_TOKEN_SCOPES = ['viewables:read'];

let authenticationClient = new AuthenticationClient(FORGE_CLIENT_ID, FORGE_CLIENT_SECRET);

async function authCallbackMiddleware(req, res, next) {
    try {
        const internalToken = await authenticationClient.getToken(req.query.code, FORGE_CALLBACK_URL);
        const publicToken = await authenticationClient.refreshToken(internalToken.refresh_token, PUBLIC_TOKEN_SCOPES);
        req.session.internal_token = internalToken.access_token;
        req.session.public_token = publicToken.access_token;
        req.session.refresh_token = publicToken.refresh_token;
        req.session.expires_at = Date.now() + internalToken.expires_in * 1000;
        next();
    } catch (err) {
        next(err);
    }
}

async function authRefreshMiddleware(req, res, next) {
    const { refresh_token, expires_at } = req.session;
    if (!refresh_token) {
        res.status(401).end();
        return;
    }

    try {
        if (expires_at < Date.now()) {
            const internalToken = await authenticationClient.refreshToken(refresh_token, INTERNAL_TOKEN_SCOPES);
            const publicToken = await authenticationClient.refreshToken(refresh_token, PUBLIC_TOKEN_SCOPES);
            req.session.internal_token = internalToken.access_token;
            req.session.public_token = publicToken.access_token;
            req.session.refresh_token = publicToken.refresh_token;
            req.session.expires_at = Date.now() + internalToken.expires_in * 1000;
        }
        req.internalOAuthToken = {
            access_token: req.session.internal_token,
            expires_in: Math.round((req.session.expires_at - Date.now()) / 1000)
        };
        req.publicOAuthToken = {
            access_token: req.session.public_token,
            expires_in: Math.round((req.session.expires_at - Date.now()) / 1000)
        };
        next();
    } catch (err) {
        next(err);
    }
}

function getAuthorizationUrl() {
    return authenticationClient.getAuthorizationUrl(INTERNAL_TOKEN_SCOPES, FORGE_CALLBACK_URL);
}

async function getUserProfile(token) {
    return authenticationClient.getUserProfile(token);
}

async function getHubs(token) {
    return new DataManagementClient(token).listHubs();
}

async function getProjects(hubId, token) {
    return new DataManagementClient(token).listProjects(hubId);
}

async function getProjectContents(hubId, projectId, folderId, token) {
    if (!folderId) {
        return new DataManagementClient(token).listProjecFolders(hubId, projectId);
    } else {
        return new DataManagementClient(token).listFolderContents(projectId, folderId);
    }
}

async function getItemVersions(projectId, itemId, token) {
    return new DataManagementClient(token).listItemVersions(projectId, itemId);
}

module.exports = {
    getAuthorizationUrl,
    authCallbackMiddleware,
    authRefreshMiddleware,
    getUserProfile,
    getHubs,
    getProjects,
    getProjectContents,
    getItemVersions
};
