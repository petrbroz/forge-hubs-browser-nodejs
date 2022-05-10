const axios = require('axios').default;

const ApiHost = 'https://developer.api.autodesk.com';

async function createIndex(projectId, versionUrn, accessToken) {
    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };
    const url = `${ApiHost}/construction/index/v2/projects/${projectId.replace('b.', '')}/indexes:batch-status`;
    const body = { versions: [{ versionUrn }] };
    const resp = await axios.post(url, body, { headers });
    return resp.data.indexes[0];
}

async function getIndexStatus(projectId, indexId, accessToken) {
    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };
    const url = `${ApiHost}/construction/index/v2/projects/${projectId.replace('b.', '')}/indexes/${indexId}`;
    const resp = await axios.get(url, { headers });
    return resp.data;
}

async function getIndexFields(projectId, indexId, accessToken) {
    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };
    const url = `${ApiHost}/construction/index/v2/projects/${projectId.replace('b.', '')}/indexes/${indexId}/fields`;
    const resp = await axios.get(url, { headers });
    const data = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
    const lines = data.split('\n').filter(line => line.trim().length > 0);
    return lines.map(line => JSON.parse(line));
}

async function createQuery(projectId, indexId, query, accessToken) {
    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };
    const url = `${ApiHost}/construction/index/v2/projects/${projectId.replace('b.', '')}/indexes/${indexId}/queries`;
    const body = {
        query,
        columns: {
            's.lmvId': true
        }
    };
    const resp = await axios.post(url, body, { headers });
    return resp.data;
}

async function getQueryStatus(projectId, indexId, queryId, accessToken) {
    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };
    const url = `${ApiHost}/construction/index/v2/projects/${projectId.replace('b.', '')}/indexes/${indexId}/queries/${queryId}`;
    const resp = await axios.get(url, { headers });
    return resp.data;
}

async function getQueryResults(projectId, indexId, queryId, accessToken) {
    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };
    const url = `${ApiHost}/construction/index/v2/projects/${projectId.replace('b.', '')}/indexes/${indexId}/queries/${queryId}/properties`;
    const resp = await axios.get(url, { headers });
    const data = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
    const lines = data.split('\n').filter(line => line.trim().length > 0);
    return lines.map(line => JSON.parse(line));
}

module.exports = {
    createIndex,
    getIndexStatus,
    getIndexFields,
    createQuery,
    getQueryStatus,
    getQueryResults
};
