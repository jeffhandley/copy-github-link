export default function addLinksToPage(options, links, urlOverride, previousDelay) {
    const url = urlOverride || location.href;
    const optionsUrl = chrome.runtime.getURL('options.html');

    function copyLinkToClipboard({ url, text, format }) {
        const overrideCopyCommand = (event) => {
            switch (format) {
                case 'markdown':
                    event.clipboardData.setData('text/plain', `[${text}](${url})`);
                    event.clipboardData.setData('text/html', `<a href='${url}'>${text}</a>`);
                    break;

                case 'text':
                    event.clipboardData.setData('text/plain', text);
                    break;

                case 'html':
                default:
                    event.clipboardData.setData('text/plain', text);
                    event.clipboardData.setData('text/html', `<a href='${url}'>${text}</a>`);
                    break;

            }

            event.preventDefault();
        };

        document.addEventListener('copy', overrideCopyCommand);
        document.execCommand('copy');
        document.removeEventListener('copy', overrideCopyCommand);
    }

    function createLinkButton(popupLinks, id, includeTextLabel, buttonClass = '', linkClass = '') {
        const defaultLink = popupLinks.find(l => l.isDefault && !l.group) || popupLinks.find(l => !l.group) || {};

        const buttonGroup = document.createElement('div');
        buttonGroup.setAttribute('data-view-component', true);
        buttonGroup.className = 'BtnGroup d-flex';

            const buttonGroupDefaultLink = document.createElement('a');
            buttonGroupDefaultLink.id = `copy-github-link-button-${id}`;
            buttonGroupDefaultLink.className = `${buttonClass} btn BtnGroup-item ${linkClass}`;
            buttonGroupDefaultLink.setAttribute('icon', 'link');
            buttonGroupDefaultLink.setAttribute('data-view-component', true);
            buttonGroupDefaultLink.setAttribute('title', `Click to copy this link to the clipboard.\n\nText:\n${defaultLink.text}\n\nURL:\n${(defaultLink.urlOverride || url)}`);

            buttonGroupDefaultLink.onclick = event => {
                copyLinkToClipboard({
                    url: defaultLink.urlOverride || url,
                    text: defaultLink.text,
                    format: 'html'
                });

                const classNameRestore = buttonGroupDefaultLink.className;
                buttonGroupDefaultLink.className += ' btn-primary';
                window.setTimeout(() => buttonGroupDefaultLink.className = classNameRestore, 400);

                event.preventDefault();
            }

                const buttonGroupDefaultIconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                buttonGroupDefaultIconSvg.setAttribute('class', `octicon octicon-link ${(includeTextLabel ? 'mr-2' : 'mr-0')}`); // setting className on an SVG does not take effect
                buttonGroupDefaultIconSvg.setAttribute('aria-hidden', true);
                buttonGroupDefaultIconSvg.setAttribute('height', 16);
                buttonGroupDefaultIconSvg.setAttribute('width', 16);
                buttonGroupDefaultIconSvg.setAttribute('viewBox', '0 0 16 16');
                buttonGroupDefaultIconSvg.setAttribute('version', '1.1');

                    const buttonGroupDefaultIconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    buttonGroupDefaultIconPath.setAttribute('d', 'm7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z');

                    buttonGroupDefaultIconSvg.appendChild(buttonGroupDefaultIconPath);

                buttonGroupDefaultLink.appendChild(buttonGroupDefaultIconSvg);

                if (includeTextLabel) {
                    buttonGroupDefaultLink.appendChild(document.createTextNode('Link'));
                }

            buttonGroup.appendChild(buttonGroupDefaultLink);

            const buttonGroupDetails = document.createElement('details');
            buttonGroupDetails.id = `copy-github-link-menu-${id}`;
            buttonGroupDetails.className = 'copy-github-link-buttongroup details-reset details-overlay BtnGroup-parent d-inline-block position-relative';
            buttonGroupDetails.setAttribute('group_item', true);
            buttonGroupDetails.setAttribute('data-view-component', true);

                const buttonGroupSummary = document.createElement('summary');
                buttonGroupSummary.className = `${buttonClass} btn btn-block BtnGroup-item px-2 float-none ml-0`;
                buttonGroupSummary.setAttribute('data-view-component', true);
                buttonGroupSummary.setAttribute('role', 'button');
                buttonGroupSummary.setAttribute('aria-haspopup', true);
                buttonGroupSummary.setAttribute('title', 'Copy GitHub Link (open popup to choose a link format)');

                    const buttonGroupSummarySvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    buttonGroupSummarySvg.setAttribute('class', 'octicon octicon-triangle-down'); // setting className on an SVG does not take effect
                    buttonGroupSummarySvg.setAttribute('height', 16);
                    buttonGroupSummarySvg.setAttribute('width', 16);
                    buttonGroupSummarySvg.setAttribute('viewBox', '0 0 16 16');
                    buttonGroupSummarySvg.setAttribute('version', '1.1');
                    buttonGroupSummarySvg.setAttribute('aria-hidden', true);

                        const buttonGroupSummaryPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        buttonGroupSummaryPath.setAttribute('d', 'm4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z');
                        buttonGroupSummarySvg.appendChild(buttonGroupSummaryPath);
                buttonGroupSummary.appendChild(buttonGroupSummarySvg);
            buttonGroupDetails.appendChild(buttonGroupSummary);

            const buttonGroupDropdown = document.createElement('div');
            buttonGroupDropdown.className = 'dropdown-menu dropdown-menu-sw top-auto mt-2';
            buttonGroupDropdown.setAttribute('role', 'menu');
            buttonGroupDropdown.setAttribute('data-focus-trap', 'suspended');

                const linkPopupBody = document.createElement('div');
                linkPopupBody.className = 'copy-github-link-body';

                    const linkPopupBodyContent = document.createElement('div');
                    linkPopupBodyContent.className = 'copy-github-link-body-content';

                        const linkPopupTitle = document.createElement('h4');
                        linkPopupTitle.appendChild(document.createTextNode('Copy GitHub Link'));

                            const linkPopupOptionsAnchor = document.createElement('a');
                            linkPopupOptionsAnchor.className = 'float-right';
                            linkPopupOptionsAnchor.href = optionsUrl;
                            linkPopupOptionsAnchor.target = 'copy-github-link-options';
                            linkPopupOptionsAnchor.setAttribute('title', 'Options and link customization');

                                const linkPopupOptionsGearSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                                linkPopupOptionsGearSvg.setAttribute('class', 'UnderlineNav-octicon d-none d-sm-inline octicon octicon-gear');
                                linkPopupOptionsGearSvg.setAttribute('height', 16);
                                linkPopupOptionsGearSvg.setAttribute('width', 16);
                                linkPopupOptionsGearSvg.setAttribute('viewBox', '0 0 16 16');
                                linkPopupOptionsGearSvg.setAttribute('version', '1.1');

                                    const linkPopupOptionsGearPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                                    linkPopupOptionsGearPath.setAttribute('d', 'M8 0a8.2 8.2 0 0 1 .701.031C9.444.095 9.99.645 10.16 1.29l.288 1.107c.018.066.079.158.212.224.231.114.454.243.668.386.123.082.233.09.299.071l1.103-.303c.644-.176 1.392.021 1.82.63.27.385.506.792.704 1.218.315.675.111 1.422-.364 1.891l-.814.806c-.049.048-.098.147-.088.294.016.257.016.515 0 .772-.01.147.038.246.088.294l.814.806c.475.469.679 1.216.364 1.891a7.977 7.977 0 0 1-.704 1.217c-.428.61-1.176.807-1.82.63l-1.102-.302c-.067-.019-.177-.011-.3.071a5.909 5.909 0 0 1-.668.386c-.133.066-.194.158-.211.224l-.29 1.106c-.168.646-.715 1.196-1.458 1.26a8.006 8.006 0 0 1-1.402 0c-.743-.064-1.289-.614-1.458-1.26l-.289-1.106c-.018-.066-.079-.158-.212-.224a5.738 5.738 0 0 1-.668-.386c-.123-.082-.233-.09-.299-.071l-1.103.303c-.644.176-1.392-.021-1.82-.63a8.12 8.12 0 0 1-.704-1.218c-.315-.675-.111-1.422.363-1.891l.815-.806c.05-.048.098-.147.088-.294a6.214 6.214 0 0 1 0-.772c.01-.147-.038-.246-.088-.294l-.815-.806C.635 6.045.431 5.298.746 4.623a7.92 7.92 0 0 1 .704-1.217c.428-.61 1.176-.807 1.82-.63l1.102.302c.067.019.177.011.3-.071.214-.143.437-.272.668-.386.133-.066.194-.158.211-.224l.29-1.106C6.009.645 6.556.095 7.299.03 7.53.01 7.764 0 8 0Zm-.571 1.525c-.036.003-.108.036-.137.146l-.289 1.105c-.147.561-.549.967-.998 1.189-.173.086-.34.183-.5.29-.417.278-.97.423-1.529.27l-1.103-.303c-.109-.03-.175.016-.195.045-.22.312-.412.644-.573.99-.014.031-.021.11.059.19l.815.806c.411.406.562.957.53 1.456a4.709 4.709 0 0 0 0 .582c.032.499-.119 1.05-.53 1.456l-.815.806c-.081.08-.073.159-.059.19.162.346.353.677.573.989.02.03.085.076.195.046l1.102-.303c.56-.153 1.113-.008 1.53.27.161.107.328.204.501.29.447.222.85.629.997 1.189l.289 1.105c.029.109.101.143.137.146a6.6 6.6 0 0 0 1.142 0c.036-.003.108-.036.137-.146l.289-1.105c.147-.561.549-.967.998-1.189.173-.086.34-.183.5-.29.417-.278.97-.423 1.529-.27l1.103.303c.109.029.175-.016.195-.045.22-.313.411-.644.573-.99.014-.031.021-.11-.059-.19l-.815-.806c-.411-.406-.562-.957-.53-1.456a4.709 4.709 0 0 0 0-.582c-.032-.499.119-1.05.53-1.456l.815-.806c.081-.08.073-.159.059-.19a6.464 6.464 0 0 0-.573-.989c-.02-.03-.085-.076-.195-.046l-1.102.303c-.56.153-1.113.008-1.53-.27a4.44 4.44 0 0 0-.501-.29c-.447-.222-.85-.629-.997-1.189l-.289-1.105c-.029-.11-.101-.143-.137-.146a6.6 6.6 0 0 0-1.142 0ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9.5 8a1.5 1.5 0 1 0-3.001.001A1.5 1.5 0 0 0 9.5 8Z');
                                    linkPopupOptionsGearSvg.appendChild(linkPopupOptionsGearPath);
                                linkPopupOptionsAnchor.appendChild(linkPopupOptionsGearSvg);
                            linkPopupTitle.appendChild(linkPopupOptionsAnchor);

                            const linkPopupFormatSpan = document.createElement('span');
                            linkPopupFormatSpan.className = 'float-right mr-2';
                                const linkPopupFormatHtmlRadio = document.createElement('input');
                                linkPopupFormatHtmlRadio.type = 'radio';
                                linkPopupFormatHtmlRadio.name = `copy-github-link-format-${id}`;
                                linkPopupFormatHtmlRadio.id = `copy-github-link-format-html-${id}`;
                                linkPopupFormatHtmlRadio.value = 'html';
                                linkPopupFormatHtmlRadio.checked = true;
                                linkPopupFormatHtmlRadio.className = 'mr-1';
                                linkPopupFormatSpan.appendChild(linkPopupFormatHtmlRadio);

                                const linkPopupFormatHtmlLabel = document.createElement('label');
                                linkPopupFormatHtmlLabel.htmlFor = `copy-github-link-format-html-${id}`;
                                linkPopupFormatHtmlLabel.innerText = 'Rich Text';
                                linkPopupFormatHtmlLabel.className = 'mr-2';
                                linkPopupFormatSpan.appendChild(linkPopupFormatHtmlLabel);

                                const linkPopupFormatMarkdownRadio = document.createElement('input');
                                linkPopupFormatMarkdownRadio.type = 'radio';
                                linkPopupFormatMarkdownRadio.name = `copy-github-link-format-${id}`;
                                linkPopupFormatMarkdownRadio.id = `copy-github-link-format-markdown-${id}`;
                                linkPopupFormatMarkdownRadio.value = 'markdown';
                                linkPopupFormatMarkdownRadio.className = 'mr-1';
                                linkPopupFormatSpan.appendChild(linkPopupFormatMarkdownRadio);

                                const linkPopupFormatMarkdownLabel = document.createElement('label');
                                linkPopupFormatMarkdownLabel.htmlFor = `copy-github-link-format-markdown-${id}`;
                                linkPopupFormatMarkdownLabel.innerText = 'Markdown';
                                linkPopupFormatMarkdownLabel.className = 'mr-2';
                                linkPopupFormatSpan.appendChild(linkPopupFormatMarkdownLabel);
                            linkPopupTitle.appendChild(linkPopupFormatSpan);
                        linkPopupBodyContent.appendChild(linkPopupTitle);

                        const linkPopupSubtitle = document.createElement('h5');
                            const linkPopupSubtitleAnchor = document.createElement('a');
                            linkPopupSubtitleAnchor.innerText = url;
                            linkPopupSubtitleAnchor.href = '#';
                            linkPopupSubtitleAnchor.title = `Click to copy this URL to the clipboard as plain text.\n\n${url}`;
                            linkPopupSubtitleAnchor.onclick = event => {
                                copyLinkToClipboard({ text: url, format: 'text' });
                                linkPopupSubtitleAnchor.className = 'copy-github-link-clicked';

                                window.setTimeout(() => linkPopupSubtitleAnchor.className = null, 250);
                                window.setTimeout(() => buttonGroupDetails.removeAttribute('open'), 300);

                                event.preventDefault();
                            };
                            linkPopupSubtitle.appendChild(linkPopupSubtitleAnchor);
                        linkPopupBodyContent.appendChild(linkPopupSubtitle);

                        let linkList, pendingGroupTitle;

                        const newGroup = () => {
                            if (linkList && linkList.lastChild) {
                                linkPopupBodyContent.appendChild(linkList);
                            }

                            linkList = document.createElement('ul');
                            linkList.className = 'copy-github-link-list';
                        }

                        newGroup();

                        popupLinks.forEach(({text, group, urlOverride}) => {
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
                                    linkPopupBodyContent.appendChild(pendingGroupTitle);
                                    pendingGroupTitle = null;
                                }

                                const linkUrl = urlOverride || url;

                                const listItem = document.createElement('li');
                                const isDefault = text === defaultLink.text && urlOverride === defaultLink.urlOverride;
                                listItem.className = isDefault ? 'text-bold' : '';

                                    const anchor = document.createElement('a');
                                    anchor.innerText = text;
                                    anchor.href = linkUrl;
                                    anchor.title = `Click to copy this link to the clipboard.${(isDefault ? ' This is the default format.' : '')}\n\nText:\n${text}\n\nURL:\n${linkUrl}`;
                                    anchor.onclick = event => {
                                        const format = [...document.querySelectorAll(`input[type='radio'][name='copy-github-link-format-${id}']`)].sort((l, r) => l.checked ? -1 : (r.checked ? 1 : 0))[0].value;
                                        copyLinkToClipboard({ url: linkUrl, text, format });
                                        anchor.className = 'copy-github-link-clicked';

                                        window.setTimeout(() => anchor.className = null, 250);
                                        window.setTimeout(() => buttonGroupDetails.removeAttribute('open'), 300);

                                        event.preventDefault();
                                    };

                                    listItem.appendChild(anchor);
                                linkList.appendChild(listItem);
                            }
                        });

                        linkPopupBodyContent.appendChild(linkList);
                    linkPopupBody.appendChild(linkPopupBodyContent);
                buttonGroupDropdown.appendChild(linkPopupBody);
            buttonGroupDetails.appendChild(buttonGroupDropdown);
        buttonGroup.appendChild(buttonGroupDetails);

        return buttonGroup;
    }

    function renderLinkButton(header, elementType, optionDisabled, popupId, includeTextLabel, buttonClass, linkClass) {
        const existing = document.getElementById(popupId);

        const popupLinks = [...links]
            .filter(l => !l.enabledPopups || l.enabledPopups.includes(popupId))
            .filter(l => !l.disabledPopups || !l.disabledPopups.includes(popupId));

        if (optionDisabled || !popupLinks.length) {
            if (existing) {
                header.removeChild(existing);
            }

            return;
        }

        const linkButton = createLinkButton(popupLinks, popupId, includeTextLabel, buttonClass, linkClass);

        const linkContainer = document.createElement(elementType);
        linkContainer.id = popupId;
        linkContainer.className = 'copy-github-link-container';
        linkContainer.appendChild(linkButton);

        if (existing) {
            header.replaceChild(linkContainer, existing);
        }
        else {
            header.insertBefore(linkContainer, header.firstChild);
        }
    }

    const appHeader = document.querySelector('.AppHeader-actions');

    if (appHeader) {
        renderLinkButton(appHeader, 'div', options.disableAppHeaderButton, 'appheader', false, '', 'pl-2 pr-2');
    }

    // With the new Issue Types (https://github.blog/changelog/2024-10-01-evolving-github-issues-public-preview/),
    // the action block no longer has a unique class name, so search for it by `data-component` tag,
    // but fall back to the older approach for repos that don't have types enabled.
    const newHeaderOuterDiv = document.querySelector('[data-component="PH_Actions"]');
    const newActionHeader = newHeaderOuterDiv ? newHeaderOuterDiv.firstElementChild : null;

    const [oldStyleActionHeader] = [...document.getElementsByClassName('gh-header-actions')];

    // The new Issue Types UI no longer uses `btn-sm` style on the buttons
    const buttonClass = !!newActionHeader ? '' : 'btn-sm';

    const pullRequestOrIssueHeader = newActionHeader || oldStyleActionHeader;

    if (pullRequestOrIssueHeader) {
        renderLinkButton(pullRequestOrIssueHeader, 'div', options.disablePullRequestIssueButton, 'pullorissue', true, buttonClass);
    } else if (!!urlOverride) {
        // When there's a urlOverride, we might be loading in a project pane
        // This could have a delayed rendering of the issue pane, so we will
        // use a backoff strategy for retries
        const delay = (previousDelay || 0) + 1000;
        window.setTimeout(() => addLinksToPage(options, links, urlOverride, delay), delay);
    }

    const [pageHeadActions] = [...document.getElementsByClassName('pagehead-actions')];

    if (pageHeadActions) {
        renderLinkButton(pageHeadActions, 'li', options.disableRepoHeaderButton, 'repoheader', true, buttonClass);
    }
}
