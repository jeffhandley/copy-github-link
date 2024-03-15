const linkTarget = document.getElementById('link-target');
const linkList = document.getElementById('link-list');

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs && tabs.length == 1) {
        while (linkList.firstChild) linkList.removeChild(linkList.firstChild);

        const { id, title, url } = tabs[0];
        const { origin, pathname, hash } = new URL(url);
        const [, org, repo, pullOrIssues, number] = pathname.split('/');

        const linkTargetAnchor = document.createElement("A");
        linkTarget.innerText = url;

        chrome.tabs.sendMessage(id, { type: 'getLinks' }, links => {
            links.filter(l => !l.disabled).forEach(({ text, separator }) => {
                if (separator && linkList.lastChild) {
                    linkList.lastChild.className = 'last-in-group';
                }

                if (text) {
                    const anchor = document.createElement("A");
                    anchor.innerText = text;
                    anchor.href = url;
                    anchor.title = `Click to copy this link to the clipboard.\n\nText:\n${text}\n\nURL:\n${url}`;

                    anchor.onclick = () => {
                        chrome.tabs.sendMessage(id, { type: "copyLink", url, text });

                        anchor.className = 'clicked';
                        window.setTimeout(() => anchor.className = null, 250);
                        window.setTimeout(() => window.close(), 300);
                    };

                    const item = document.createElement("LI");
                    item.appendChild(anchor);
                    linkList.appendChild(item);
                }
            });
        });
    }
});
