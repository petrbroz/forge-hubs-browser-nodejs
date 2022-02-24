const { AuthClientThreeLegged, UserProfileApi, HubsApi, ProjectsApi, FoldersApi, ItemsApi } = require('forge-apis');
const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET, FORGE_CALLBACK_URL } = require('../config.js');

const internalAuthClient = new AuthClientThreeLegged(FORGE_CLIENT_ID, FORGE_CLIENT_SECRET, FORGE_CALLBACK_URL, ['data:read']);
const publicAuthClient = new AuthClientThreeLegged(FORGE_CLIENT_ID, FORGE_CLIENT_SECRET, FORGE_CALLBACK_URL, ['viewables:read']);

function getAuthorizationUrl() {
    return internalAuthClient.generateAuthUrl();
}

async function generateTokens(code) {
    const internalCredentials = await internalAuthClient.getToken(code);
    const publicCredentials = await publicAuthClient.refreshToken(internalCredentials);
    return {
        internal: internalCredentials,
        public: publicCredentials
    };    
}

async function refreshTokens(refresh) {
    const internalCredentials = await internalAuthClient.refreshToken({ refresh_token: refresh });
    const publicCredentials = await publicAuthClient.refreshToken(internalCredentials);
    return {
        internal: internalCredentials,
        public: publicCredentials
    };
}

async function getUserProfile(token) {
    const resp = await new UserProfileApi().getUserProfile(internalAuthClient, token);
    return resp.body;
}

async function getHubs(token) {
    const resp = await new HubsApi().getHubs(null, internalAuthClient, token);
    return resp.body.data;
}

async function getProjects(hubId, token) {
    const resp = await new ProjectsApi().getHubProjects(hubId, null, internalAuthClient, token);
    return resp.body.data;
}

async function getProjectContents(hubId, projectId, folderId, token) {
    if (!folderId) {
        const resp = await new ProjectsApi().getProjectTopFolders(hubId, projectId, internalAuthClient, token);
        return resp.body.data;
    } else {
        const resp = await new FoldersApi().getFolderContents(projectId, folderId, null, internalAuthClient, token);
        return resp.body.data;
    }
}

async function getItemVersions(projectId, itemId, token) {
    const resp = await new ItemsApi().getItemVersions(projectId, itemId, null, internalAuthClient, token);
    return resp.body.data;
}

module.exports = {
    getAuthorizationUrl,
    generateTokens,
    refreshTokens,
    getUserProfile,
    getHubs,
    getProjects,
    getProjectContents,
    getItemVersions
};
