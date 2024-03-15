chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content-script received message', message, sender);
    sendResponse('Response from content-script');

    const { type, url, text } = message;

    if (type === 'copy') {
        const copyToClipboard = (event) => {
            event.clipboardData.setData('text/plain', text);
            event.clipboardData.setData('text/html', `<a href='${url}'>${text}</a>`);

            event.preventDefault();
        };

        document.addEventListener('copy', copyToClipboard);
        document.execCommand('copy');
        document.removeEventListener('copy', copyToClipboard);
    }
});

function detectDarkMode() {
    const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    chrome.runtime.sendMessage({ type: 'darkMode', darkMode });
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', detectDarkMode);
detectDarkMode();

function getGitHubLinks() {
    const url = location.href;
    const { origin, hostname, pathname, hash } = new URL(url);
    const [, org, repo, ...pathSegments ] = pathname.split('/');

    let isPull = false, isIssue = false, isPullOrIssue = false, number = null, title = null;

    if (!!org && !!repo && pathSegments.length >= 2) {
        const [ pullOrIssueSegment, numberSegment ] = pathSegments;
        const parsedNumber = parseInt(numberSegment);

        isPull = pullOrIssueSegment === 'pull' && !Number.isNaN(parsedNumber);
        isIssue = pullOrIssueSegment === 'issues' && !Number.isNaN(parsedNumber);
        isPullOrIssue = isPull || isIssue;
        number = isPullOrIssue ? parsedNumber : null;

        if (isPullOrIssue) {
            // Strip the pull/issue number and repo information from the page title
            const titleParts = document.title.split(' · ');
            titleParts.reverse();

            const [ /* repo */, /* number */, ...remainingTitleParts ] = titleParts;
            remainingTitleParts.reverse();

            title = remainingTitleParts.join(' · ');

            // Remove the author from pull request titles
            if (isPull) {
                const titleWords = title.split(' ');
                titleWords.reverse();

                const [ /* author */, /* "by" */, ...remainingTitleWords ] = titleWords;
                remainingTitleWords.reverse();

                title = remainingTitleWords.join(' ');
            }
        }
    }

    const hasData = {
        org: !!org,
        repo: !!repo,
        number: !!number,
        title: !!number && !!title,
        hash: !!hash
    };

    return [
        { disabled: !hasData.number, text: `${org}/${repo}#${number}` },
        { disabled: !hasData.number, text: `#${number}` },
        { disabled: !hasData.number, separator: true },
        { disabled: !hasData.title, text: title },
        { disabled: !hasData.title, text: `${title} (#${number})` },
        { disabled: !hasData.title, text: `${title} (${org}/${repo}#${number})` },
        { disabled: !hasData.title, separator: true },

        // Always provide the full page URL as the link text
        { text: url },

        // If there was a #hash on the URL, provide links that omit the hash from the text
        { disabled: !hasData.hash, text: `${origin}${pathname}` },
        { disabled: !hasData.hash, separator: true },
        { disabled: !hasData.hash, text: `${hostname}${pathname}${hash}` },

        // Always provide the full page URL (excluding the scheme)
        { text: `${hostname}${pathname}` },

        // For pages other than pull requests and issues, provide the path to the page excluding the leading /
        { disabled: hasData.number, text: pathname.substring(1) },

        // Pull request and issue links
        { disabled: !hasData.number, text: `${origin}/${org}/${repo}` },
        { disabled: !hasData.number, text: `${hostname}/${org}/${repo}` },
        { disabled: !hasData.number, text: `${org}/${repo}` },
        { disabled: !hasData.number, text: repo },
        { disabled: !hasData.number, separator: true },
    ];
}

async function sendMessageToExtension(message) {
    const response = await chrome.runtime.sendMessage(message);
    console.log('Content-script received response', response);
}

const links = getGitHubLinks();
sendMessageToExtension(links);
