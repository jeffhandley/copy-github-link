export default function addLinksToPage(options, links) {
    const url = location.href;
    const logoUrl = chrome.runtime.getURL('images/logo-256.png');

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

    function createLinkButton(id, includeTextLabel, buttonClass = '', linkClass = '') {
        const [defaultLink] = links.filter(l => !l.group).sort((a, b) => (a.isDefault ? -1 : (b.isDefault ? 1 : 0)));

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
                copyLinkToClipboard({ url: defaultLink.urlOverride || url, text: defaultLink.text });

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
                buttonGroupSummary.className = `${buttonClass} btn BtnGroup-item px-2 float-none ml-0`;
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
                linkPopupBody.setAttribute('style', `background-image: url('${logoUrl}');`);

                    const linkPopupBodyContent = document.createElement('div');
                    linkPopupBodyContent.className = 'copy-github-link-body-content';

                        const linkPopupTitle = document.createElement('h4');
                        linkPopupTitle.innerText = 'Copy GitHub Link';
                        linkPopupBodyContent.appendChild(linkPopupTitle);

                        const linkPopupSubtitle = document.createElement('h5');
                        linkPopupSubtitle.innerText = url;
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

                        links.forEach(({text, group, urlOverride}) => {
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
                                        copyLinkToClipboard({ url: linkUrl, text });
                                        anchor.className = 'copy-github-link-clicked';

                                        window.setTimeout(() => anchor.className = null, 250);
                                        window.setTimeout(() => buttonGroupDetails.removeAttribute('open'), 300);

                                        event.preventDefault();
                                    }

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

    function renderLinkButton(header, elementType, optionDisabled, containerId, includeTextLabel, buttonClass, linkClass) {
        const existing = document.getElementById(containerId);

        if (optionDisabled || !links || !links.length) {
            if (existing) {
                header.removeChild(existing);
            }

            return;
        }

        const linkButton = createLinkButton(containerId, includeTextLabel, buttonClass, linkClass);

        const linkContainer = document.createElement(elementType);
        linkContainer.id = containerId;
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

    const [pullRequestOrIssueHeader] = [...document.getElementsByClassName('gh-header-actions')];

    if (pullRequestOrIssueHeader) {
        renderLinkButton(pullRequestOrIssueHeader, 'div', options.disablePullRequestIssueButton, 'pullorissue', true, 'btn-sm');
    }

    const [pageHeadActions] = [...document.getElementsByClassName('pagehead-actions')];

    if (pageHeadActions) {
        renderLinkButton(pageHeadActions, 'li', options.disableRepoHeaderButton, 'pagehead', true, 'btn-sm');
    }
}
