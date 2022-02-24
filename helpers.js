const { refreshTokens } = require('./services/forge.js');

async function authRefreshMiddleware(req, res, next) {
    const { refresh_token, expires_at } = req.session;
    if (!refresh_token) {
        res.status(401).end();
        return;
    }
    if (expires_at < Date.now()) {
        const { internal, public } = await refreshTokens(refresh_token);
        req.session.public_token = public.access_token;
        req.session.internal_token = internal.access_token;
        req.session.refresh_token = public.refresh_token;
        req.session.expires_at = Date.now() + internal.expires_in * 1000;
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
}

module.exports = {
    authRefreshMiddleware
};
