const rootMenuId = 'Root Menu: copy-github-link';
let iconPath = 'icons/copy-github-link-128-light-disabled.png';

chrome.action.disable();
chrome.action.setIcon({ path: iconPath });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'setDarkMode':
            return setIconDarkMode(message.darkMode);
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
