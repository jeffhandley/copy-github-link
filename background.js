let iconPath = 'icons/copy-github-link-128-light-disabled.png';

chrome.action.disable();
chrome.action.setIcon({ path: iconPath });

chrome.runtime.onMessage.addListener(({ type, darkMode }) => {
    if (type === "darkMode") {
        setIconDarkMode(darkMode);
    }
});

async function getCurrentTab() {
    let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    return tab;
}

function setIconDarkMode(darkMode) {
    if (darkMode) {
        iconPath = iconPath.replace('-light', '-dark');
    }
    else {
        iconPath = iconPath.replace('-dark', '-light');
    }

    chrome.action.setIcon({ path: iconPath });
}

function setActionState(tabId, enabled, { org, repo, number }) {
    if (enabled) {
        chrome.action.enable(tabId);
        iconPath = iconPath.replace('-disabled', '-enabled');
    }
    else {
        chrome.action.disable(tabId);
        iconPath = iconPath.replace('-enabled', '-disabled');
    }

    chrome.action.setIcon({ path: iconPath });
}

async function checkTab(tab) {
    const window = await chrome.windows.getLastFocused();

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
