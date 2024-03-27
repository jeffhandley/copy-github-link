import addLinksToPage from './addLinksToPage.js';
import defaultOptions from './defaultOptions.js';
import getGitHubLinks from './getGitHubLinks.js';
import isGitHub from './isGitHub.js';

let currentOptions = {...defaultOptions};

chrome.storage.onChanged.addListener(loadOptionsFromStorage);
loadOptionsFromStorage();

getCurrentTab().then(tab => setActionState(isGitHub(tab)));

function loadOptionsFromStorage() {
    chrome.storage.sync.get(defaultOptions, loadedOptions => {
        currentOptions = {
            ...currentOptions,
            ...loadedOptions
        };

        // Refresh the current options into the active tab
        getCurrentTab().then(tabLoaded);
    });
}

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
    });
}

async function tabLoaded(tab) {
    if (isGitHub(tab)) {
        setActionState(true);

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: getGitHubLinks,
            args: [currentOptions, tab]
        }).then(([{result: links}]) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: addLinksToPage,
                args: [currentOptions, links]
            });
        });
    }
    else {
        setActionState(false);
    }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' || changeInfo.url || changeInfo.title) {
        tabLoaded(tab);
    }
});

chrome.tabs.onActivated.addListener((result) => {
    chrome.tabs.get(result.tabId, tabLoaded);
});
