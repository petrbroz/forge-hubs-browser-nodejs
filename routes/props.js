const express = require('express');
const { authRefreshMiddleware } = require('../services/forge/auth.js');
const { createIndex, getIndexStatus, getIndexFields, createQuery, getQueryStatus, getQueryResults } = require('../services/forge/props.js');

let router = express.Router();

router.use(authRefreshMiddleware);

router.get('/:project_id', async function (req, res, next) {
    const { project_id } = req.params;
    const { version_urn } = req.query;
    console.assert(version_urn);
    try {
        const index = await createIndex(project_id, version_urn, req.internalOAuthToken.access_token);
        res.json(index);
    } catch (err) {
        next(err);
    }
});

router.get('/:project_id/:index_id', async function (req, res, next) {
    const { project_id, index_id } = req.params;
    try {
        const index = await getIndexStatus(project_id, index_id, req.internalOAuthToken.access_token);
        res.json(index);
    } catch (err) {
        next(err);
    }
});

router.get('/:project_id/:index_id/fields', async function (req, res, next) {
    const { project_id, index_id } = req.params;
    try {
        const fields = await getIndexFields(project_id, index_id, req.internalOAuthToken.access_token);
        res.json(fields);
    } catch (err) {
        next(err);
    }
});

router.post('/:project_id/:index_id/queries', async function (req, res, next) {
    const { project_id, index_id } = req.params;
    try {
        const query = await createQuery(project_id, index_id, req.body, req.internalOAuthToken.access_token);
        res.json(query);
    } catch (err) {
        next(err);
    }
});

router.get('/:project_id/:index_id/queries/:query_id', async function (req, res, next) {
    const { project_id, index_id, query_id } = req.params;
    try {
        const query = await getQueryStatus(project_id, index_id, query_id, req.internalOAuthToken.access_token);
        res.json(query);
    } catch (err) {
        next(err);
    }
});

router.get('/:project_id/:index_id/queries/:query_id/results', async function (req, res, next) {
    const { project_id, index_id, query_id } = req.params;
    try {
        const results = await getQueryResults(project_id, index_id, query_id, req.internalOAuthToken.access_token);
        res.json(results);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
