const express = require('express');
const { getAuthorizationUrl, generateTokens, getUserProfile } = require('../services/forge.js');
const { authRefreshMiddleware } = require('../helpers.js');

let router = express.Router();

router.get('/login', function (req, res) {
    res.redirect(getAuthorizationUrl());
});

router.get('/logout', function (req, res) {
    req.session = null;
    res.redirect('/');
});

router.get('/callback', async function (req, res) {
    try {
        const { internal, public } = await generateTokens(req.query.code);
        req.session.public_token = public.access_token;
        req.session.internal_token = internal.access_token;
        req.session.refresh_token = public.refresh_token;
        req.session.expires_at = Date.now() + internal.expires_in * 1000;
        res.redirect('/');
    } catch (err) {
        next(err);
    }
});

router.get('/token', authRefreshMiddleware, function (req, res) {
    res.json(req.publicOAuthToken);
});

router.get('/profile', authRefreshMiddleware, async function (req, res, next) {
    try {
        const profile = await getUserProfile(req.internalOAuthToken);
        res.json({ name: `${profile.firstName} ${profile.lastName}` });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
