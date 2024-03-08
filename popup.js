const links = document.getElementById('links');

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs && tabs.length == 1) {
        while (links.firstChild) links.removeChild(links.firstChild);

        const { id, title, url } = tabs[0];
        const { origin, pathname, hash } = new URL(url);
        const [, org, repo, pullOrIssues, number] = pathname.split('/');

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
                anchor.onclick = () => {
                    chrome.tabs.sendMessage(id, { url, text });

                    anchor.className = 'clicked';
                    window.setTimeout(() => anchor.className = null, 250);
                    // window.setTimeout(() => window.close(), 300);
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
