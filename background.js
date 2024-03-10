chrome.action.disable();
chrome.action.setIcon({ path: 'copy-github-link-disabled-128.png' });

async function getCurrentTab() {
    let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    return tab;
}

function setActionState(tabId, enabled, { org, repo, number }) {
    if (enabled) {
        chrome.action.enable(tabId);
        chrome.action.setIcon({ path: 'copy-github-link-128.png' });
        chrome.action.setTitle({ title: `${org}/${repo}#${number}` });
    }
    else {
        chrome.action.disable(tabId);
        chrome.action.setIcon({ path: 'copy-github-link-disabled-128.png' });
        chrome.action.setTitle({ title: 'Copy GitHub Link' });
    }
}

function checkTab(tab) {
    if (tab && tab.id && tab.url) {
        const { origin, pathname } = new URL(tab.url);
        const [, org, repo, pullOrIssues, number] = pathname.split('/');

        let enabled = origin === 'https://github.com' && !!org;
        setActionState(tab.id, enabled, { org, repo, number });
    }
}

getCurrentTab().then(checkTab);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        checkTab(tab);
    }
});

chrome.tabs.onActivated.addListener((result) => {
    chrome.tabs.get(result.tabId, checkTab);
});
