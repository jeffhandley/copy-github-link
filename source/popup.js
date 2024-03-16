import isGitHub from './isGitHub.js';
import getGitHubLinks from './getGitHubLinks.js';

const linkTarget = document.getElementById('link-target');
const linkList = document.getElementById('link-list');

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!isGitHub(tab)) return;

    const {id, url, title} = tab;

    const linkTargetAnchor = document.createElement("A");
    linkTarget.innerText = url;

    while (linkList.firstChild) linkList.removeChild(linkList.firstChild);

    getGitHubLinks(url, title).filter(l => !l.disabled).forEach(({ text, separator }) => {
        if (separator && linkList.lastChild) {
            linkList.lastChild.className = 'copy-github-link-separator';
        }

        if (text) {
            const anchor = document.createElement("A");
            anchor.innerText = text;
            anchor.href = url;
            anchor.title = `Click to copy this link to the clipboard.\n\nText:\n${text}\n\nURL:\n${url}`;

            anchor.onclick = event => {
                chrome.tabs.sendMessage(id, { type: "copyLink", url, text });

                anchor.className = 'copy-github-link-clicked';
                window.setTimeout(() => anchor.className = null, 250);
                window.setTimeout(() => window.close(), 300);

                event.preventDefault();
            };

            const item = document.createElement("LI");
            item.appendChild(anchor);
            linkList.appendChild(item);
        }
    });
});
