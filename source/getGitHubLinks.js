export default function getGitHubLinks({linkFormats}, { url, title }) {
    function parseLinkFormats(linkFormats, { org, repo, number, author, title, url, origin, hostname, pathname, hash, codepath, codefile, codebranch, commit_long, commit_short }) {
        return linkFormats.reduce((enabledItems, item) => {
            // Skip over blank entries used for pretty formatting
            if (!item) return enabledItems;

            if (!Array.isArray(item)) {
                item = [item];
            }

            let [format, enablers, disablers, urlOverride] = item;
            format = new String(format || '');
            enablers = new String(enablers || '');
            disablers = new String(disablers || '');
            urlOverride = new String(urlOverride || '') || null;

            const tokens = /\{\w+\}/g;
            const groupPattern = /\<group\>/;
            const commentPattern = /\<comment\>/;
            const defaultPattern = /\<default\>/;
            const popupPattern = /\[(\w+)\]/g;

            const formatTokens = [...format.matchAll(tokens).map(t => t[0].toLowerCase())];
            const enablerTokens = [...formatTokens, ...enablers.matchAll(tokens).map(t => t[0].toLowerCase())];
            const disablerTokens = [...disablers.matchAll(tokens).map(t => t[0].toLowerCase())];

            // Get the captured popup id values from matches
            const enabledPopups = [...enablers.matchAll(popupPattern).map(t => t[1].toLowerCase())];
            const disabledPopups = [...disablers.matchAll(popupPattern).map(t => t[1].toLowerCase())];

            const popups = {
                ...(enabledPopups.length ? { enabledPopups } : { }),
                ...(disabledPopups.length ? { disabledPopups } : { }),
            };

            const enabled = enablerTokens.reduce((enabled, token) => {
                if (!enabled) return false;

                switch (token) {
                    case '{org}': return (!!org);
                    case '{repo}': return (!!repo);
                    case '{number}': return (!!number);
                    case '{author}': return (!!author);
                    case '{title}': return (!!title);
                    case '{url}': return (!!url);
                    case '{origin}': return (!!origin);
                    case '{hostname}': return (!!hostname);
                    case '{pathname}': return (!!pathname);
                    case '{hash}': return (!!hash);
                    case '{codepath}': return (!!codepath);
                    case '{codefile}': return (!!codefile);
                    case '{codebranch}': return (!!codebranch);
                    case '{commit_long}': return (!!commit_long);
                    case '{commit_short}': return (!!commit_short);
                    default: return true;
                }
            }, true);

            if (!enabled) return enabledItems;

            const disabled = disablerTokens.reduce((disabled, token) => {
                if (disabled) return true;

                switch (token) {
                    case '{org}': return (!!org);
                    case '{repo}': return (!!repo);
                    case '{number}': return (!!number);
                    case '{author}': return (!!author);
                    case '{title}': return (!!title);
                    case '{url}': return (!!url);
                    case '{origin}': return (!!origin);
                    case '{hostname}': return (!!hostname);
                    case '{pathname}': return (!!pathname);
                    case '{hash}': return (!!hash);
                    case '{codepath}': return (!!codepath);
                    case '{codefile}': return (!!codefile);
                    case '{codebranch}': return (!!codebranch);
                    case '{commit_long}': return (!!commit_long);
                    case '{commit_short}': return (!!commit_short);
                    default: return false;
                }
            }, false);

            if (disabled) return enabledItems;

            if (format && format.match && format.match(groupPattern)) {
                return [
                    ...enabledItems, {
                        group: true,
                        text: format.replace(groupPattern, ''),
                        urlOverride,
                        ...popups
                    }
                ];
            }

            if (format && format.match && format.match(commentPattern)) {
                return enabledItems;
            }

            const isDefault = (format && format.match && format.match(defaultPattern));

            if (isDefault) {
                format = format.replace(defaultPattern, '');
            }

            const replaceTokens = template => template && template
                .replace('{org}', org)
                .replace('{repo}', repo)
                .replace('{number}', number)
                .replace('{author}', author)
                .replace('{title}', title)
                .replace('{url}', url)
                .replace('{origin}', origin)
                .replace('{hostname}', hostname)
                .replace('{pathname}', pathname)
                .replace('{hash}', hash)
                .replace('{codepath}', codepath)
                .replace('{codefile}', codefile)
                .replace('{codebranch}', codebranch)
                .replace('{commit_long}', commit_long)
                .replace('{commit_short}', commit_short)
                .trim();

            let linkText = replaceTokens(format);
            const linkUrl = replaceTokens(urlOverride);

            // Prevent duplicate text/url pairs
            for (const existing of enabledItems) {
                if (existing.text == linkText && existing.urlOverride == linkUrl) {
                    return enabledItems;
                }
            }

            return [
                ...enabledItems,
                {
                    text: linkText,
                    urlOverride: linkUrl,
                    ...(isDefault ? { isDefault } : {}),
                    ...popups
                }
            ];
        }, []);
    }

    let { origin, hostname, pathname, hash } = new URL(url);
    if (pathname.length > 1) pathname = pathname.substring(1);

    const [org, repo, ...pathSegments ] = pathname.split('/');

    let isPull = false, isIssue = false, isPullOrIssue = false, number = null, author = null;
    let isCodePath = false, codepath = null, codefile = null, codebranch = null;;
    let isCommit = false, commit_long = null, commit_short = null;

    if (!!org && !!repo && pathSegments.length >= 2) {
        const [ appRoute, appPathRoot, ...appPathSegments ] = pathSegments;
        const parsedNumber = parseInt(appPathRoot);

        isPull = appRoute === 'pull' && !Number.isNaN(parsedNumber);
        isIssue = appRoute === 'issues' && !Number.isNaN(parsedNumber);
        isPullOrIssue = isPull || isIssue;
        number = isPullOrIssue ? parsedNumber : null;

        isCodePath = (appRoute === 'blob' || appRoute === 'tree') && appPathRoot;
        isCommit = appRoute === 'commit' && appPathRoot;

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

                const [ authorPart, by, ...remainingTitleWords ] = titleWords;

                // If the words matched the expected pattern, set the values
                if (authorPart && by === 'by') {
                    remainingTitleWords.reverse();

                    title = remainingTitleWords.join(' ');
                    author = authorPart;
                }
            }
        }
        else if (isCodePath) {
            if (appPathSegments.length > 0) {
                codepath = [appPathRoot, ...appPathSegments].join('/');
                codefile = appPathSegments[appPathSegments.length - 1];
            }
            else {
                codepath = appPathRoot;
            }

            // Strip the repo information from the page title
            const titleParts = title.split(' · ');
            titleParts.reverse();

            const [ /* repo */, ...remainingTitleParts ] = titleParts;
            remainingTitleParts.reverse;

            title = remainingTitleParts.join(' · ');

            // Extract and remove the branch/commit from the title
            const titleWords = title.split(' ');
            titleWords.reverse();

            const [ branch, at, ...remainingTitleWords ] = titleWords;

            // If the words matched the expected pattern, set the values
            if (branch && at === 'at') {
                remainingTitleWords.reverse();

                codepath = remainingTitleWords.join(' ');
                codebranch = branch;

                if (codepath.indexOf(`${repo}/`) == 0) {
                        codepath = codepath.substring(repo.length + 1);
                }
            }
        }
        else if (isCommit) {
            commit_long = appPathRoot;

            // Grab the short commit hash from the title
            const titleParts = title.split('@');

            if (titleParts.length) {
                commit_short = titleParts[titleParts.length - 1];
            }
        }
    }

    return parseLinkFormats(linkFormats, { org, repo, number, author, title, url, origin, hostname, pathname, hash, codepath, codefile, codebranch, commit_long, commit_short });
}
