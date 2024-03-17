import addLinksToPage from './addLinksToPage.js';
import defaultLinkFormats from './defaultLinkFormats.js';
import getGitHubLinks from './getGitHubLinks.js';
import isGitHub from './isGitHub.js';

const defaultOptions = {
  disableAppHeaderButton: false,
  disablePullRequestIssueButton: false,
  linkFormats: defaultLinkFormats
};

let currentOptions = defaultOptions;

function loadOptionsFromStorage() {
    chrome.storage.sync.get(defaultOptions, loadedOptions => {
        currentOptions = {
            ...currentOptions,
            ...loadedOptions
        };

        console.log('currentOptions', currentOptions);

        getCurrentTab().then(tabLoaded);
    });
}

chrome.storage.onChanged.addListener(loadOptionsFromStorage);
loadOptionsFromStorage();

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
    if (changeInfo.status === 'complete') {
        tabLoaded(tab);
    }
});

chrome.tabs.onActivated.addListener((result) => {
    chrome.tabs.get(result.tabId, tabLoaded);
});
