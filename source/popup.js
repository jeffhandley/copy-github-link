import defaultOptions from './defaultOptions.js';
import isGitHub from './isGitHub.js';
import getGitHubLinks from './getGitHubLinks.js';

let currentOptions = {...defaultOptions};

function loadOptionsFromStorage() {
    chrome.storage.sync.get(defaultOptions, loadedOptions => {
        currentOptions = {
            ...currentOptions,
            ...loadedOptions
        };

        document.getElementById('copy-github-link-format-html').checked = (currentOptions.defaultCopyFormat == 'html');
        document.getElementById('copy-github-link-format-markdown').checked = (currentOptions.defaultCopyFormat == 'markdown');
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
    while (linksElement.firstChild) linksElement.removeChild(linksElement.firstChild);

    const { links, urlOverride } = getGitHubLinks(currentOptions, {url, title});

    const headerAnchor = document.createElement('a');
    const headerUrl = urlOverride || url;
    headerAnchor.innerText = headerUrl;
    headerAnchor.href = headerUrl;
    headerAnchor.title = `Click to copy this URL to the clipboard as plain text.\n\n${headerUrl}`

    headerAnchor.onclick = event => {
        chrome.tabs.sendMessage(id, { type: 'copyLink', text: headerUrl, url: headerUrl, format: 'text' });

        headerAnchor.className = 'copy-github-link-clicked';
        window.setTimeout(() => headerAnchor.className = null, 250);
        window.setTimeout(() => window.close(), 300);

        event.preventDefault();
    };

    while (linkTarget.firstChild) linkTarget.removeChild(linkTarget.firstChild);
    linkTarget.appendChild(headerAnchor);

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

    const defaultLink = popupLinks.find(l => l.isDefault && !l.group) || popupLinks.find(l => !l.group) || {};

    popupLinks.forEach(({ text, group, urlOverride: linkUrlOverride }) => {
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

            const linkUrl = linkUrlOverride || urlOverride || url;
            const isDefault = text === defaultLink.text && linkUrlOverride === defaultLink.urlOverride;

            const anchor = document.createElement('a');
            anchor.innerText = text;
            anchor.href = linkUrl;
            anchor.title = `Click to copy this link to the clipboard.${(isDefault ? ' This is the default format.' : '')}\n\nText:\n${text}\n\nURL:\n${linkUrl}`

            anchor.onclick = event => {
                const format = [...document.querySelectorAll(`input[type='radio'][name='copy-github-link-format']`)].sort((l, r) => l.checked ? -1 : (r.checked ? 1 : 0))[0].value;
                chrome.tabs.sendMessage(id, { type: 'copyLink', url: linkUrl, text, format });

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
