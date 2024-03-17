export default function getGitHubLinks(linkFormats, { url, title }) {
    function parseLinkFormats(linkFormats, { org, repo, number, title, url, origin, hostname, pathname, hash, filepath }) {
      return linkFormats.reduce((enabledItems, item) => {
        if (!Array.isArray(item)) {
          item = [item];
        }

        let [format, enablers, disablers] = item;
        const tokens = /\{\w+\}/g;

        const formatTokens = [...new String(format).matchAll(tokens).map(t => t[0])];
        const enablerTokens = [...formatTokens, ...new String(enablers).matchAll(tokens).map(t => t[0])];
        const disablerTokens = [...new String(disablers).matchAll(tokens).map(t => t[0])];

        const enabled = enablerTokens.reduce((enabled, token) => {
          if (!enabled) return false;

          switch (token) {
            case '{org}': return (!!org);
            case '{repo}': return (!!repo);
            case '{number}': return (!!number);
            case '{title}': return (!!title);
            case '{url}': return (!!url);
            case '{origin}': return (!!origin);
            case '{hostname}': return (!!hostname);
            case '{pathname}': return (!!pathname);
            case '{hash}': return (!!hash);
            case '{filepath}': return (!!filepath);
            default: return true;
          }
        }, true);

        if (!enabled) return enabledItems;

        const disabled = disablerTokens.reduce((disabled, token) => {
          if (disabled) return true;

          switch (token) {
            case '{org}': return (!org);
            case '{repo}': return (!repo);
            case '{number}': return (!number);
            case '{title}': return (!title);
            case '{url}': return (!url);
            case '{origin}': return (!origin);
            case '{hostname}': return (!hostname);
            case '{pathname}': return (!pathname);
            case '{hash}': return (!hash);
            case '{filepath}': return (!filepath);
            default: return false;
          }
        }, false);

        if (disabled) return enabledItems;

        if (format.match(/\{separator\}/)) {
          return [ ...enabledItems, { separator: true } ];
        }

        return [
          ...enabledItems,
          {
            text: format
              .replace('{org}', org)
              .replace('{repo}', repo)
              .replace('{number}', number)
              .replace('{title}', title)
              .replace('{url}', url)
              .replace('{origin}', origin)
              .replace('{hostname}', hostname)
              .replace('{pathname}', pathname)
              .replace('{hash}', hash)
              .replace('{filepath}', filepath),
          }
        ];
      }, []);
    }

    let { origin, hostname, pathname, hash } = new URL(url);
    if (pathname.length > 1) pathname = pathname.substring(1);

    const [org, repo, ...pathSegments ] = pathname.split('/');

    let isPull = false, isIssue = false, isPullOrIssue = false, number = null;
    let isFilepath = false, filepath = null;

    if (!!org && !!repo && pathSegments.length >= 2) {
        const [ appRoute, appPathRoot, ...appPathSegments ] = pathSegments;
        const parsedNumber = parseInt(appPathRoot);

        isPull = appRoute === 'pull' && !Number.isNaN(parsedNumber);
        isIssue = appRoute === 'issues' && !Number.isNaN(parsedNumber);
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
        else {
            isFilepath = (appRoute === 'blob' || appRoute === 'tree') && appPathRoot;

            if (isFilepath && appPathSegments.length > 0) {
                filepath = appPathSegments.join('/');
            }
            else if (isFilepath) {
                filepath = appPathRoot;
            }
        }
    }

    return parseLinkFormats(linkFormats, { org, repo, number, title, url, origin, hostname, pathname, hash, filepath });
}
