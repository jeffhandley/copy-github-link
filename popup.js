const linkTarget = document.getElementById('link-target');
const links = document.getElementById('links');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Popup received message', message, sender);
    sendResponse('Response from popup');
});

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs && tabs.length == 1) {
        while (links.firstChild) links.removeChild(links.firstChild);

        const { id, title, url } = tabs[0];
        const { origin, pathname, hash } = new URL(url);
        const [, org, repo, pullOrIssues, number] = pathname.split('/');

        chrome.tabs.sendMessage(id, { greeting: 'from popup' }, response => {
            console.log('Response to popup', response);
        });

        const linkTargetAnchor = document.createElement("A");
        linkTarget.innerText = url;

        let linkTexts = [
            `${url}`,
            ...(url.indexOf('#') > -1 ?
                [
                    `https://github.com${pathname}`,
                    '',
                    `github.com${pathname}${hash}`,
                ] : []
            ),
            `github.com${pathname}`,
            ...((pullOrIssues !== 'pull' && pullOrIssues !== 'issues') || !number ?
                [ `${pathname.substring(1)}` ] : []
            ),
            ''
        ];

        if (!!org && !!repo && !!pullOrIssues) {
            linkTexts = [
                ...linkTexts,
                `https://github.com/${org}/${repo}`,
                `github.com/${org}/${repo}`,
                `${org}/${repo}`,
                `${repo}`,
                ''
            ];
        }

        if ((pullOrIssues === 'pull' || pullOrIssues === 'issues') && number) {
            const titleParts = title.split(' · ');
            titleParts.reverse();

            const [ /* repo */, /* issue or pull number */ , ...remainingTitleParts] = titleParts;
            remainingTitleParts.reverse();

            let issueOrPullTitle = remainingTitleParts.join(' · ');

            // Remove the author from pull request titles
            if (pullOrIssues === 'pull') {
                const titleWords = issueOrPullTitle.split(' ');
                titleWords.reverse();

                let [ /* author */, /* "by" */, ...remainingTitleWords] = titleWords;
                remainingTitleWords.reverse();

                issueOrPullTitle = remainingTitleWords.join(' ');
            }

            linkTexts = [
                `${org}/${repo}#${number}`,
                `#${number}`,
                '',
                `${issueOrPullTitle}`,
                `${issueOrPullTitle} (#${number})`,
                `${issueOrPullTitle} (${org}/${repo}#${number})`,
                '',
                ...linkTexts
            ]
        }


        linkTexts.forEach(text => {
            if (!!text) {
                const anchor = document.createElement("A");
                anchor.innerText = text;
                anchor.href = url;
                anchor.title = `Click to copy this link to the clipboard.\nText: ${text}\nURL: ${url}`;

                anchor.onclick = () => {
                    chrome.tabs.sendMessage(id, { type: "copy", url, text });

                    anchor.className = 'clicked';
                    window.setTimeout(() => anchor.className = null, 250);
                    window.setTimeout(() => window.close(), 300);
                };

                const item = document.createElement("LI");
                item.appendChild(anchor);

                links.appendChild(item);
            }
            else {
                links.lastChild.className = "last-in-group";
            }
        });
    }
});
