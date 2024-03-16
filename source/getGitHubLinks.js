export default function getGitHubLinks(url, title) {
    const { origin, hostname, pathname, hash } = new URL(url);
    const [, org, repo, ...pathSegments ] = pathname.split('/');

    let isPull = false, isIssue = false, isPullOrIssue = false, number = null;

    if (!!org && !!repo && pathSegments.length >= 2) {
        const [ pullOrIssueSegment, numberSegment ] = pathSegments;
        const parsedNumber = parseInt(numberSegment);

        isPull = pullOrIssueSegment === 'pull' && !Number.isNaN(parsedNumber);
        isIssue = pullOrIssueSegment === 'issues' && !Number.isNaN(parsedNumber);
        isPullOrIssue = isPull || isIssue;
        number = isPullOrIssue ? parsedNumber : null;

        if (isPullOrIssue) {
            // Strip the pull/issue number and repo information from the page title
            const titleParts = title.split(' · ');
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

        // Provide a link to the user if viewing a profile
        { disabled: !hasData.org || hasData.repo, text: `@${org}` },

        // Pull request and issue links
        { disabled: !hasData.number, separator: true },
        { disabled: !hasData.number, text: `${origin}/${org}/${repo}` },
        { disabled: !hasData.number, text: `${hostname}/${org}/${repo}` },
        { disabled: !hasData.number, text: `${org}/${repo}` },
        { disabled: !hasData.number, text: repo }
    ];
}
