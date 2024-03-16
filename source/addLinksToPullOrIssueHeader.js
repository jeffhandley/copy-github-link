export default function addLinksToPullOrIssueHeader(links) {
    const [header] = [...document.getElementsByClassName('gh-header-actions')];
    if (!header) return;

    const url = location.href;
    const linkContainer = document.createElement('div');
    linkContainer.id = 'copy-github-link-container';
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
                linkPopup.setAttribute('style', 'top:6px; width:700px; max-width:calc(100vw - 120px);');

                    const linkPopupBody = document.createElement('div');
                    linkPopupBody.setAttribute('style', 'margin:12px');

                        const linkPopupTitle = document.createElement('h4');
                        linkPopupTitle.innerText = 'Copy GitHub Link';
                        linkPopupBody.appendChild(linkPopupTitle);

                        const linkPopupSubtitle = document.createElement('h5');
                        linkPopupSubtitle.setAttribute('style', 'font-weight:normal;');
                        linkPopupSubtitle.innerText = url;
                        linkPopupBody.appendChild(linkPopupSubtitle);

                        if (links && links.length) {
                            const linkList = document.createElement('ul');
                            linkList.className = 'copy-github-link-list';

                            links.filter(l => !l.disabled).forEach(({text, separator}) => {
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
                        }

                    linkPopup.appendChild(linkPopupBody);
                linkPopupContainer.appendChild(linkPopup);
            linkDetails.appendChild(linkPopupContainer);
        linkContainer.appendChild(linkDetails);

    const existing = document.getElementById('copy-github-link-container');

    if (existing) {
        header.replaceChild(linkContainer, existing);
    }
    else {
        header.insertBefore(linkContainer, header.firstChild);
    }
}
