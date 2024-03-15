const rootMenuId = 'Root Menu: copy-github-link';

chrome.action.disable();
updateIcon(false);

function updateIcon(enabled) {
    chrome.action.setIcon({
        path: {
            "32": `images/icon-32-${(enabled ? 'enabled' : 'disabled')}.png`,
            "64": `images/icon-64-${(enabled ? 'enabled' : 'disabled')}.png`,
            "128": `images/icon-128-${(enabled ? 'enabled' : 'disabled')}.png`
        }
    })
}

async function getCurrentTab() {
    let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    return tab;
}

function setActionState(tabId, enabled, { org, repo, number }) {
    if (enabled) {
        chrome.action.enable(tabId);
    }
    else {
        chrome.action.disable(tabId);
    }

    updateIcon(enabled);
}

async function checkTab(tab) {
    const window = await chrome.windows.getLastFocused();

    chrome.contextMenus.removeAll();

    if (tab && tab.id && tab.url) {
        const { origin, pathname } = new URL(tab.url);
        const [, org, repo, pullOrIssues, number] = pathname.split('/');

        const enabled = origin === 'https://github.com' && !!org;
        setActionState(tab.id, enabled, { org, repo, number });

        const rootMenu = chrome.contextMenus.create({
            id: rootMenuId,
            documentUrlPatterns: [ 'https://github.com/*' ],
            title: 'Copy GitHub Link',
            enabled
        });

        if (enabled) {
            chrome.tabs.sendMessage(tab.id, { type: 'getLinks' }, links => {
                if (!chrome.runtime.lastError && links && links.length > 0) {
                    links.filter(l => !l.disabled).forEach(({ text, separator }, index) => {
                        chrome.contextMenus.create({
                            parentId: rootMenuId,
                            id: text || `separator_${index}`,
                            title: text,
                            type: separator ? 'separator' : 'normal'
                        });
                    });
                }
            });
        }
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

chrome.contextMenus.onClicked.addListener(menuClick => {
    const { menuItemId, parentMenuItemId } = menuClick;

    if (parentMenuItemId === rootMenuId) {
        getCurrentTab().then(({id, url}) => {
            chrome.tabs.sendMessage(id, { type: "copyLink", url, text: menuItemId });
        });
    }
});
