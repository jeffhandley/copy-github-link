function copyLinkToClipboard({ url, text }) {
    const overrideCopyCommand = (event) => {
        event.clipboardData.setData('text/plain', text);
        event.clipboardData.setData('text/html', `<a href='${url}'>${text}</a>`);

        event.preventDefault();
    };

    document.addEventListener('copy', overrideCopyCommand);
    document.execCommand('copy');
    document.removeEventListener('copy', overrideCopyCommand);
}

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
        { disabled: !hasData.number, separator: true },
        { disabled: !hasData.number, text: `${origin}/${org}/${repo}` },
        { disabled: !hasData.number, text: `${hostname}/${org}/${repo}` },
        { disabled: !hasData.number, text: `${org}/${repo}` },
        { disabled: !hasData.number, text: repo }
    ];
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type } = message;

    switch (message.type) {
        case 'getLinks':
            return sendResponse(getGitHubLinks());

        case 'copyLink':
            return copyLinkToClipboard(message);
    }
});

function addActionToHeader() {
    const [header] = [...document.getElementsByClassName('gh-header-actions')];
    if (!header) return;

    const url = location.href;
    const linkContainer = document.createElement('div');
    linkContainer.className = 'flex-md-order-2';

        const linkDetails = document.createElement('details');
        linkDetails.id = 'copy-github-link-details';
        linkDetails.className = 'position-relative details-overlay details-reset hx_dropdown-fullscreen';
        linkDetails.setAttribute('data-action', 'toggle:copy-github-link#onDetailsToggle');

            const linkSummary = document.createElement('summary');
            linkSummary.className = 'Button--secondary Button--small Button float-none';
            linkSummary.ariaDescription = 'Copy GitHub Link';
            linkSummary.setAttribute('data-view-component', true);

                const linkButton = document.createElement('span');
                linkButton.className = 'Button-content';

                    const linkButtonIcon = document.createElement('span');
                    linkButtonIcon.className = 'Button-visual Button-leadingVisual';

                        const linkButtonSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        linkButtonSvg.className = 'octicon octicon-link';
                        linkButtonSvg.ariaHidden = true;
                        linkButtonSvg.setAttribute('width', 16);
                        linkButtonSvg.setAttribute('height', 16);
                        linkButtonSvg.setAttribute('viewBox', '0 0 16 16');
                        linkButtonSvg.setAttribute('version', '1.1');
                        linkButtonSvg.setAttribute('data-view-component', true);

                            const linkButtonSvgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                            linkButtonSvgPath.setAttribute('d', 'm7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z');
                            linkButtonSvg.appendChild(linkButtonSvgPath);

                        linkButtonIcon.appendChild(linkButtonSvg);

                    linkButton.appendChild(linkButtonIcon);

                    const linkButtonText = document.createElement('span');
                    linkButtonText.className = 'Button-label';
                    linkButtonText.innerText = 'Link';
                    linkButton.appendChild(linkButtonText);

                linkSummary.appendChild(linkButton);

                const linkButtonDropdown = document.createElement('span');
                linkButtonDropdown.className = 'Button-visual Button-trailingAction';

                    const linkButtonDropdownSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    linkButtonDropdownSvg.className = 'octicon octicon-triangle-down';
                    linkButtonDropdownSvg.ariaHidden = true;
                    linkButtonDropdownSvg.setAttribute('width', 16);
                    linkButtonDropdownSvg.setAttribute('height', 16);
                    linkButtonDropdownSvg.setAttribute('viewBox', '0 0 16 16');
                    linkButtonDropdownSvg.setAttribute('version', '1.1');
                    linkButtonDropdownSvg.setAttribute('data-view-component', true);

                        const linkButtonDropdownSvgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        linkButtonDropdownSvgPath.setAttribute('d', 'm4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z');

                        linkButtonDropdownSvg.appendChild(linkButtonDropdownSvgPath);
                    linkButtonDropdown.appendChild(linkButtonDropdownSvg);
                linkSummary.appendChild(linkButtonDropdown);
            linkDetails.appendChild(linkSummary);

            const linkPopupContainer = document.createElement('div');
            linkPopupContainer.className = 'position-relative';

                const linkPopup = document.createElement('div');
                linkPopup.className = 'dropdown-menu dropdown-menu-sw p-0';
                linkPopup.setAttribute('style', 'top:6px; width:auto; max-width:calc(100vw - 320px);');

                    const linkPopupBody = document.createElement('div');
                    linkPopupBody.setAttribute('style', 'margin:12px');

                        const linkPopupTitle = document.createElement('h4');
                        linkPopupTitle.innerText = 'Copy GitHub Link';
                        linkPopupBody.appendChild(linkPopupTitle);

                        const linkPopupSubtitle = document.createElement('h5');
                        linkPopupSubtitle.setAttribute('style', 'font-weight:normal;');
                        linkPopupSubtitle.innerText = url;
                        linkPopupBody.appendChild(linkPopupSubtitle);

                        const linkStyle = document.createElement('style');
                        linkStyle.innerHTML = `
                            UL.copy-github-link-list {
                                padding: 10px 20px;
                                list-style-type: none;
                            }
                            UL.copy-github-link-list LI {
                                margin: 0 8px;
                            }
                            UL.copy-github-link-list ::marker {
                                content: '📋 ';
                            }
                            UL.copy-github-link-list LI {
                                text-wrap: nowrap;
                            }
                            UL.copy-github-link-list LI.copy-github-link-separator {
                                padding-bottom: 6px;
                            }
                            UL.copy-github-link-list LI A.copy-github-link-clicked {
                                color: darkgreen;
                                background-color: rgba(255, 255, 0, 0.5);
                            }
                        `;
                        linkPopupBody.appendChild(linkStyle);

                        const linkList = document.createElement('ul');
                        linkList.className = 'copy-github-link-list';

                        const links = getGitHubLinks().filter(l => !l.disabled).forEach(({text, separator}) => {
                            if (separator && linkList.lastChild) {
                                linkList.lastChild.className = 'copy-github-link-separator';
                            }

                            if (text) {
                                const listItem = document.createElement('li');
                                    const anchor = document.createElement('a');
                                    anchor.innerText = text;
                                    anchor.href = url;
                                    anchor.title = `Click to copy this link to the clipboard.\n\nText:\n${text}\n\nURL:\n${url}`;
                                    anchor.onclick = event => {
                                        copyLinkToClipboard({ url, text });
                                        anchor.className = 'copy-github-link-clicked';

                                        window.setTimeout(() => anchor.className = null, 250);
                                        window.setTimeout(() => linkDetails.removeAttribute('open'), 300);

                                        event.preventDefault();
                                    }

                                    listItem.appendChild(anchor);
                                linkList.appendChild(listItem);
                            }
                        });

                        linkPopupBody.appendChild(linkList);

                    linkPopup.appendChild(linkPopupBody);
                linkPopupContainer.appendChild(linkPopup);
            linkDetails.appendChild(linkPopupContainer);
        linkContainer.appendChild(linkDetails);
    header.insertBefore(linkContainer, header.firstChild);
}

addActionToHeader();
