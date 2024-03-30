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
const linksElement = document.getElementById('links');

optionsLink.addEventListener('click', (event) => {
    chrome.runtime.openOptionsPage();
    event.preventDefault();
});

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!isGitHub(tab)) return;

    const {id, url, title} = tab;

    const linkTargetAnchor = document.createElement('a');
    linkTarget.innerText = url;

    while (linksElement.firstChild) linksElement.removeChild(linksElement.firstChild);

    const links = getGitHubLinks(currentOptions, {url, title});
    if (!links || !links.length) return;

    const popupId = 'toolbar';
    const popupLinks = [...links]
        .filter(l => !l.enabledPopups || l.enabledPopups.includes(popupId))
        .filter(l => !l.disabledPopups || !l.disabledPopups.includes(popupId));

    let linkList, pendingGroupTitle;

    const newGroup = () => {
        if (linkList && linkList.lastChild) {
            linksElement.appendChild(linkList);
        }

        linkList = document.createElement('ul');
        linkList.className = 'copy-github-link-list';
    }

    newGroup();

    const [defaultLink] = popupLinks.filter(l => !l.group).sort((a, b) => (a.isDefault ? -1 : (b.isDefault ? 1 : 0)));

    popupLinks.forEach(({ text, group, urlOverride }) => {
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
                linksElement.appendChild(pendingGroupTitle);
                pendingGroupTitle = null;
            }

            const linkUrl = urlOverride || url;
            const isDefault = text === defaultLink.text && urlOverride === defaultLink.urlOverride;

            const anchor = document.createElement('a');
            anchor.innerText = text;
            anchor.href = linkUrl;
            anchor.title = `Click to copy this link to the clipboard.${(isDefault ? ' This is the default format.' : '')}\n\nText:\n${text}\n\nURL:\n${linkUrl}`

            anchor.onclick = event => {
                chrome.tabs.sendMessage(id, { type: 'copyLink', url: linkUrl, text });

                anchor.className = 'copy-github-link-clicked';
                window.setTimeout(() => anchor.className = null, 250);
                window.setTimeout(() => window.close(), 300);

                event.preventDefault();
            };

            const listItem = document.createElement('li');
            listItem.className = isDefault ? 'text-bold' : '';
            listItem.appendChild(anchor);
            linkList.appendChild(listItem);
        }
    });

    linksElement.appendChild(linkList);
});
