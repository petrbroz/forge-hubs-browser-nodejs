import { ModelPropsFilter } from './lib/model-props-filter.js';

export async function initFilter(container, projectId, versionUrn, onResultsReady) {
    container.innerHTML = 'Loading ...';
    const resp = await fetch(`/api/props/${projectId}?version_urn=${versionUrn}`);
    if (!resp.ok) {
        alert('Could not retrieve index information. See console for more details.');
        console.error(resp);
    }
    const index = await resp.json();
    if (index.state === 'FINISHED') {
        container.innerHTML = `
            <div id="query"></div><br>
            <button id="load">Load</button>
        `;
        const fields = await fetch(`/api/props/${projectId}/${index.indexId}/fields`).then(resp => resp.json());
        const modelPropsFilter = new ModelPropsFilter(document.getElementById('query'), { fields });
        document.getElementById('load').onclick = function () {
            const query = modelPropsFilter.getQuery();
            executeQuery(projectId, index.indexId, query, onResultsReady);
        };
    } else {
        container.innerHTML = `Index is currently in state ${index.state}. Try again later...`;
    }
}

async function executeQuery(projectId, indexId, query, onResultsReady) {
    console.log('Creating query', query);
    let status = await fetch(`/api/props/${projectId}/${indexId}/queries`, {
        method: 'POST',
        body: JSON.stringify(query),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(resp => resp.json());
    const queryId = status.queryId;
    status = await fetch(`/api/props/${projectId}/${indexId}/queries/${queryId}`).then(resp => resp.json());
    while (status.state === 'PROCESSING') {
        console.log('Waiting for query to be processed...');
        await new Promise((resolve) => setTimeout(resolve, 5000));
        status = await fetch(`/api/props/${projectId}/${indexId}/queries/${queryId}`).then(resp => resp.json());
    }
    if (status.state === 'FINISHED') {
        const results = await fetch(`/api/props/${projectId}/${indexId}/queries/${queryId}/results`).then(resp => resp.json());
        console.log('Query results', results);
        onResultsReady(results);
    } else {
        console.error('Query failed', status.errors);
    }
}
