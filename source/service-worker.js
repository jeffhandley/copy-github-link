import addLinksToPage from './addLinksToPage.js';
import defaultLinkFormats from './defaultLinkFormats.js';
import getGitHubLinks from './getGitHubLinks.js';
import isGitHub from './isGitHub.js';

getCurrentTab().then(tab => setActionState(isGitHub(tab)));

async function getCurrentTab() {
    let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    return tab;
}

function setActionState(enabled) {
    if (enabled) {
        chrome.action.enable();
    }
    else {
        chrome.action.disable();
    }

    chrome.action.setIcon({
        path: {
            "32": `images/icon-32-${(enabled ? 'enabled' : 'disabled')}.png`,
            "64": `images/icon-64-${(enabled ? 'enabled' : 'disabled')}.png`,
            "128": `images/icon-128-${(enabled ? 'enabled' : 'disabled')}.png`
        }
    })
}

async function tabLoaded(tab) {
    if (isGitHub(tab)) {
        setActionState(true);

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: getGitHubLinks,
            args: [defaultLinkFormats, tab]
        }).then(([{result: links}]) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: addLinksToPage,
                args: [links]
            });
        });
    }
    else {
        setActionState(false);
    }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        tabLoaded(tab);
    }
});

chrome.tabs.onActivated.addListener((result) => {
    chrome.tabs.get(result.tabId, tab => {
        setActionState(isGitHub(tab));
    });
});
