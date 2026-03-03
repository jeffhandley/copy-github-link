export default function addLinksToPage(options, links, urlOverride, previousDelay) {
    const url = urlOverride || location.href;
    const optionsUrl = chrome.runtime.getURL('options.html');

    // --- DOM helpers ---

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const svgTags = new Set(['svg', 'path']);

    function elem(tag, attrs, ...children) {
        const el = svgTags.has(tag)
            ? document.createElementNS(SVG_NS, tag)
            : document.createElement(tag);

        for (const [key, value] of Object.entries(attrs || {})) {
            if (key === 'onclick') el.onclick = value;
            else if (key === 'className') el.className = value;
            else el.setAttribute(key, value);
        }

        for (const child of children.flat()) {
            if (child != null) {
                el.append(typeof child === 'string' ? document.createTextNode(child) : child);
            }
        }

        return el;
    }

    function icon(className, pathData) {
        return elem('svg', { class: className, 'aria-hidden': true, height: 16, width: 16, viewBox: '0 0 16 16', version: '1.1' },
            elem('path', { d: pathData })
        );
    }

    const ICON_LINK = 'm7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z';
    const ICON_DROPDOWN = 'm4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z';
    const ICON_GEAR = 'M8 0a8.2 8.2 0 0 1 .701.031C9.444.095 9.99.645 10.16 1.29l.288 1.107c.018.066.079.158.212.224.231.114.454.243.668.386.123.082.233.09.299.071l1.103-.303c.644-.176 1.392.021 1.82.63.27.385.506.792.704 1.218.315.675.111 1.422-.364 1.891l-.814.806c-.049.048-.098.147-.088.294.016.257.016.515 0 .772-.01.147.038.246.088.294l.814.806c.475.469.679 1.216.364 1.891a7.977 7.977 0 0 1-.704 1.217c-.428.61-1.176.807-1.82.63l-1.102-.302c-.067-.019-.177-.011-.3.071a5.909 5.909 0 0 1-.668.386c-.133.066-.194.158-.211.224l-.29 1.106c-.168.646-.715 1.196-1.458 1.26a8.006 8.006 0 0 1-1.402 0c-.743-.064-1.289-.614-1.458-1.26l-.289-1.106c-.018-.066-.079-.158-.212-.224a5.738 5.738 0 0 1-.668-.386c-.123-.082-.233-.09-.299-.071l-1.103.303c-.644.176-1.392-.021-1.82-.63a8.12 8.12 0 0 1-.704-1.218c-.315-.675-.111-1.422.363-1.891l.815-.806c.05-.048.098-.147.088-.294a6.214 6.214 0 0 1 0-.772c.01-.147-.038-.246-.088-.294l-.815-.806C.635 6.045.431 5.298.746 4.623a7.92 7.92 0 0 1 .704-1.217c.428-.61 1.176-.807 1.82-.63l1.102.302c.067.019.177.011.3-.071.214-.143.437-.272.668-.386.133-.066.194-.158.211-.224l.29-1.106C6.009.645 6.556.095 7.299.03 7.53.01 7.764 0 8 0Zm-.571 1.525c-.036.003-.108.036-.137.146l-.289 1.105c-.147.561-.549.967-.998 1.189-.173.086-.34.183-.5.29-.417.278-.97.423-1.529.27l-1.103-.303c-.109-.03-.175.016-.195.045-.22.312-.412.644-.573.99-.014.031-.021.11.059.19l.815.806c.411.406.562.957.53 1.456a4.709 4.709 0 0 0 0 .582c.032.499-.119 1.05-.53 1.456l-.815.806c-.081.08-.073.159-.059.19.162.346.353.677.573.989.02.03.085.076.195.046l1.102-.303c.56-.153 1.113-.008 1.53.27.161.107.328.204.501.29.447.222.85.629.997 1.189l.289 1.105c.029.109.101.143.137.146a6.6 6.6 0 0 0 1.142 0c.036-.003.108-.036.137-.146l.289-1.105c.147-.561.549-.967.998-1.189.173-.086.34-.183.5-.29.417-.278.97-.423 1.529-.27l1.103.303c.109.029.175-.016.195-.045.22-.313.411-.644.573-.99.014-.031.021-.11-.059-.19l-.815-.806c-.411-.406-.562-.957-.53-1.456a4.709 4.709 0 0 0 0-.582c-.032-.499.119-1.05.53-1.456l.815-.806c.081-.08.073-.159.059-.19a6.464 6.464 0 0 0-.573-.989c-.02-.03-.085-.076-.195-.046l-1.102.303c-.56.153-1.113.008-1.53-.27a4.44 4.44 0 0 0-.501-.29c-.447-.222-.85-.629-.997-1.189l-.289-1.105c-.029-.11-.101-.143-.137-.146a6.6 6.6 0 0 0-1.142 0ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9.5 8a1.5 1.5 0 1 0-3.001.001A1.5 1.5 0 0 0 9.5 8Z';

    function formatRadio(id, value, label, checked) {
        return [
            elem('input', { type: 'radio', name: `copy-github-link-format-${id}`, id: `copy-github-link-format-${value}-${id}`, value, className: 'mr-1', ...(checked && { checked: '' }) }),
            elem('label', { for: `copy-github-link-format-${value}-${id}`, className: 'mr-2' }, label),
        ];
    }

    // --- Clipboard ---

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

    function flashClass(el, className, duration = 400) {
        const restore = el.className;
        el.className += ` ${className}`;
        window.setTimeout(() => el.className = restore, duration);
    }

    // --- Button creation ---

    function createLinkButton(popupLinks, id, includeTextLabel, buttonClass = '', linkClass = '') {
        const defaultLink = popupLinks.find(l => l.isDefault && !l.group) || popupLinks.find(l => !l.group) || {};
        const defaultUrl = defaultLink.urlOverride || url;

        const defaultButton = elem('a', {
            id: `copy-github-link-button-${id}`,
            className: `${buttonClass} btn BtnGroup-item ${linkClass}`,
            icon: 'link',
            'data-view-component': true,
            title: `Click to copy this link to the clipboard.\n\nText:\n${defaultLink.text}\n\nURL:\n${defaultUrl}`,
            onclick: event => {
                copyLinkToClipboard({ url: defaultUrl, text: defaultLink.text, format: 'html' });
                flashClass(defaultButton, 'btn-primary');
                event.preventDefault();
            },
        },
            icon(`octicon octicon-link ${includeTextLabel ? 'mr-2' : 'mr-0'}`, ICON_LINK),
            includeTextLabel ? 'Link' : null,
        );

        const detailsEl = elem('details', {
            id: `copy-github-link-menu-${id}`,
            className: 'copy-github-link-buttongroup details-reset details-overlay BtnGroup-parent d-inline-block position-relative',
            group_item: true,
            'data-view-component': true,
        });

        const urlSubtitleAnchor = elem('a', {
            href: '#',
            title: `Click to copy this URL to the clipboard as plain text.\n\n${url}`,
            onclick: event => {
                copyLinkToClipboard({ text: url, format: 'text' });
                urlSubtitleAnchor.className = 'copy-github-link-clicked';
                window.setTimeout(() => urlSubtitleAnchor.className = null, 250);
                window.setTimeout(() => detailsEl.removeAttribute('open'), 300);
                event.preventDefault();
            },
        }, url);

        detailsEl.append(
            elem('summary', {
                className: `${buttonClass} btn btn-block BtnGroup-item px-2 float-none ml-0`,
                'data-view-component': true,
                role: 'button',
                'aria-haspopup': true,
                title: 'Copy GitHub Link (open popup to choose a link format)',
            },
                icon('octicon octicon-triangle-down', ICON_DROPDOWN),
            ),

            elem('div', { className: 'dropdown-menu dropdown-menu-sw top-auto mt-2', role: 'menu', 'data-focus-trap': 'suspended' },
                elem('div', { className: 'copy-github-link-body' },
                    elem('div', { className: 'copy-github-link-body-content' },
                        elem('h4', null,
                            'Copy GitHub Link',
                            elem('a', { className: 'float-right', href: optionsUrl, target: 'copy-github-link-options', title: 'Options and link customization' },
                                icon('UnderlineNav-octicon d-none d-sm-inline octicon octicon-gear', ICON_GEAR),
                            ),
                            elem('span', { className: 'float-right mr-2' },
                                ...formatRadio(id, 'html', 'Rich Text', options.defaultCopyFormat == 'html'),
                                ...formatRadio(id, 'markdown', 'Markdown', options.defaultCopyFormat == 'markdown'),
                            ),
                        ),

                        elem('h5', null, urlSubtitleAnchor),

                        ...buildLinkGroups(popupLinks, id, defaultLink, detailsEl),
                    ),
                ),
            ),
        );

        return elem('div', { 'data-view-component': true, className: 'BtnGroup d-flex' },
            defaultButton, detailsEl,
        );
    }

    function buildLinkGroups(popupLinks, id, defaultLink, detailsEl) {
        const fragments = [];
        let linkList = elem('ul', { className: 'copy-github-link-list' });
        let pendingGroupTitle = null;

        popupLinks.forEach(({ text, group, urlOverride }) => {
            if (group) {
                if (linkList.lastChild) fragments.push(linkList);
                linkList = elem('ul', { className: 'copy-github-link-list' });
                pendingGroupTitle = text
                    ? elem('div', { className: 'copy-github-link-group' }, text)
                    : null;
            } else if (text) {
                if (pendingGroupTitle) {
                    fragments.push(pendingGroupTitle);
                    pendingGroupTitle = null;
                }

                const linkUrl = urlOverride || url;
                const isDefault = text === defaultLink.text && urlOverride === defaultLink.urlOverride;

                const anchor = elem('a', {
                    href: linkUrl,
                    title: `Click to copy this link to the clipboard.${isDefault ? ' This is the default format.' : ''}\n\nText:\n${text}\n\nURL:\n${linkUrl}`,
                    onclick: event => {
                        const format = [...document.querySelectorAll(`input[type='radio'][name='copy-github-link-format-${id}']`)]
                            .sort((l, r) => l.checked ? -1 : (r.checked ? 1 : 0))[0].value;
                        copyLinkToClipboard({ url: linkUrl, text, format });
                        anchor.className = 'copy-github-link-clicked';
                        window.setTimeout(() => anchor.className = null, 250);
                        window.setTimeout(() => detailsEl.removeAttribute('open'), 300);
                        event.preventDefault();
                    },
                }, text);

                linkList.append(elem('li', { className: isDefault ? 'text-bold' : '' }, anchor));
            }
        });

        fragments.push(linkList);
        return fragments;
    }

    // --- Rendering into page ---

    function renderLinkButton(header, elementType, optionDisabled, popupId, includeTextLabel, buttonClass, linkClass, insertBeforeRef) {
        const existing = document.getElementById(popupId);

        const popupLinks = [...links]
            .filter(l => !l.enabledPopups || l.enabledPopups.includes(popupId))
            .filter(l => !l.disabledPopups || !l.disabledPopups.includes(popupId));

        if (optionDisabled || !popupLinks.length) {
            if (existing) existing.remove();
            return;
        }

        const linkButton = createLinkButton(popupLinks, popupId, includeTextLabel, buttonClass, linkClass);

        const linkContainer = elem(elementType, { id: popupId, className: 'copy-github-link-container' }, linkButton);

        if (existing) existing.remove();

        header.insertBefore(linkContainer, insertBeforeRef || header.firstChild);
    }

    // --- Placement targets ---

    const appHeader = document.querySelector('div[data-testid="top-bar-actions"]');

    if (appHeader) {
        renderLinkButton(appHeader, 'div', options.disableAppHeaderButton, 'appheader', false, '', 'pl-2 pr-2');
    }

    // Issues and pull requests have a page header with action buttons.
    // New experience uses PH_Actions; classic experience uses gh-header-actions.
    const headerContainer = document.querySelector('[data-component="PH_Actions"]')
        || document.querySelector('.gh-header-actions');

    // On issue pages, action buttons are inside a menuActionsContainer within PH_Actions.
    // Insert into that container so the Link button appears next to Edit.
    const menuActionsContainer = headerContainer?.querySelector(':scope > [class*="menuActionsContainer"]');
    const insertionTarget = menuActionsContainer || headerContainer;

    // Use the small button style when the header has nested button containers (pull requests)
    const headerFirstButton = headerContainer?.querySelector('button');
    const headerButtonContainer = headerFirstButton?.parentElement;
    const buttonClass = headerContainer?.firstElementChild == headerButtonContainer ? '' : 'btn-sm';

    if (insertionTarget) {
        renderLinkButton(insertionTarget, 'div', options.disablePullRequestIssueButton, 'pullorissue', true, buttonClass, '');

        // For classic PR experience, match the flex ordering of the Edit/Code buttons
        // so the link button appears next to them instead of at the start of the header.
        // Only apply when sibling elements use flex ordering (PRs do, discussions don't).
        const pullorissueContainer = document.getElementById('pullorissue');
        if (pullorissueContainer && headerContainer?.classList.contains('gh-header-actions')
            && headerContainer.querySelector('.flex-md-order-2')) {
            pullorissueContainer.classList.add('flex-md-order-2');
        }
    } else if (!!urlOverride) {
        // When there's a urlOverride, we might be loading in a project pane
        // This could have a delayed rendering of the issue pane, so we will
        // use a backoff strategy for retries
        const delay = (previousDelay || 0) + 1000;
        window.setTimeout(() => addLinksToPage(options, links, urlOverride, delay), delay);
    }

    const [pageHeadActions] = [...document.getElementsByClassName('pagehead-actions')];

    if (pageHeadActions) {
        renderLinkButton(pageHeadActions, 'li', options.disableRepoHeaderButton, 'repoheader', true, 'btn-sm');
    }
}
