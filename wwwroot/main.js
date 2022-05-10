import { initTree } from './sidebar.js';
import { initViewer, loadModel, unloadModel } from './viewer.js';
import { initFilter } from './filter.js';

const login = document.getElementById('login');
try {
    const resp = await fetch('/api/auth/profile');
    if (resp.ok) {
        const user = await resp.json();
        login.innerText = `Logout (${user.name})`;
        login.onclick = () => window.location.replace('/api/auth/logout');
        const viewer = await initViewer(document.getElementById('preview'));
        initTree('#tree', function (projectId, versionUrn) {
            unloadModel(viewer);
            initFilter(document.getElementById('filter'), projectId, versionUrn, function (results) {
                const urn = window.btoa(versionUrn).replace(/=/g, '').replace('/', '_');
                const dbids = results.map(result => result.lmvId);
                loadModel(viewer, urn, dbids);
            });
        });
    } else {
        login.innerText = 'Login';
        login.onclick = () => window.location.replace('/api/auth/login');
    }
    login.style.visibility = 'visible';
} catch (err) {
    alert('Could not initialize the application. See console for more details.');
    console.error(err);
}
