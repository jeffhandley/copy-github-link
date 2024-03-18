import defaultOptions from './defaultOptions.js';
import isGitHub from './isGitHub.js';
import getGitHubLinks from './getGitHubLinks.js';

let currentOptions = {...defaultOptions};

function loadOptionsFromStorage() {
    chrome.storage.sync.get(defaultOptions, loadedOptions => currentOptions = {
        ...currentOptions,
        ...loadedOptions
    });
}

chrome.storage.onChanged.addListener(loadOptionsFromStorage);
loadOptionsFromStorage();

const optionsLink = document.getElementById('options-link');
const linkTarget = document.getElementById('link-target');
const links = document.getElementById('links');

optionsLink.addEventListener('click', (event) => {
    chrome.runtime.openOptionsPage();
    event.preventDefault();
});

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!isGitHub(tab)) return;

    const {id, url, title} = tab;

    const linkTargetAnchor = document.createElement("A");
    linkTarget.innerText = url;

    while (links.firstChild) links.removeChild(links.firstChild);

    const linkFormats = getGitHubLinks(currentOptions, {url, title});
    if (!linkFormats || !linkFormats.length) return;

    let linkList, pendingGroupTitle;

    const newGroup = () => {
        if (linkList && linkList.lastChild) {
            links.appendChild(linkList);
        }

        linkList = document.createElement('ul');
        linkList.className = 'copy-github-link-list';
    }

    newGroup();

    linkFormats.forEach(({ text, group, urlOverride }) => {
        if (group) {
            newGroup();

            if (text) {
                pendingGroupTitle = document.createElement('div');
                pendingGroupTitle.className = 'copy-github-link-group';
                pendingGroupTitle.innerText = text;
            }
            else {
                pendingGroupTitle = null;
            }
        }
        else if (text) {
            if (pendingGroupTitle) {
                links.appendChild(pendingGroupTitle);
                pendingGroupTitle = null;
            }

            const linkUrl = urlOverride || url;

            const anchor = document.createElement("A");
            anchor.innerText = text;
            anchor.href = linkUrl;
            anchor.title = `Click to copy this link to the clipboard.\n\nText:\n${text}\n\nURL:\n${linkUrl}`;

            anchor.onclick = event => {
                chrome.tabs.sendMessage(id, { type: "copyLink", url: linkUrl, text });

                anchor.className = 'copy-github-link-clicked';
                window.setTimeout(() => anchor.className = null, 250);
                window.setTimeout(() => window.close(), 300);

                event.preventDefault();
            };

            const listItem = document.createElement("LI");
            listItem.appendChild(anchor);
            linkList.appendChild(listItem);
        }
    });

    links.appendChild(linkList);
});
