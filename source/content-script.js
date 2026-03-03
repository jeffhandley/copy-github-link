function copyLinkToClipboard({ url, text, format }) {
    const overrideCopyCommand = (event) => {
        switch (format) {
            case 'html':
                event.clipboardData.setData('text/plain', text);
                event.clipboardData.setData('text/html', `<a href='${url}'>${text}</a>`);
                break;

            case 'markdown':
                event.clipboardData.setData('text/plain', `[${text}](${url})`);
                event.clipboardData.setData('text/html', `<a href='${url}'>${text}</a>`);
                break;

            case 'text':
                event.clipboardData.setData('text/plain', text);
                break;
        }

        event.preventDefault();
    };

    document.addEventListener('copy', overrideCopyCommand);
    document.execCommand('copy');
    document.removeEventListener('copy', overrideCopyCommand);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type } = message;

    switch (message.type) {
        case 'copyLink':
            return copyLinkToClipboard(message);
    }
});

// Detect client-side navigation (turbo/SPA routing) and request button re-rendering.
// This runs in the content script (page lifetime), so setTimeout is reliable here
// unlike in the service worker which can be terminated by Chrome.
let lastNotifiedUrl = location.href;
let lastNotifiedTitle = document.title;
let lastNavigationTime = 0;
let pendingNotifications = [];

function scheduleRenderRequests() {
    pendingNotifications.forEach(t => clearTimeout(t));
    pendingNotifications = [500, 1500].map(delay =>
        setTimeout(() => {
            try {
                chrome.runtime.sendMessage({ type: 'renderLinks' });
            } catch (e) {
                // Extension context invalidated (extension was reloaded/updated)
                pendingNotifications.forEach(t => clearTimeout(t));
            }
        }, delay)
    );
}

function checkForNavigation() {
    const urlChanged = location.href !== lastNotifiedUrl;
    const titleChanged = document.title !== lastNotifiedTitle;

    if (urlChanged) {
        lastNotifiedUrl = location.href;
        lastNotifiedTitle = document.title;
        lastNavigationTime = Date.now();
        scheduleRenderRequests();
    } else if (titleChanged && Date.now() - lastNavigationTime < 10000) {
        // Title changed shortly after navigation -- the page likely finished
        // loading async data (e.g. PR title). Re-render with the updated title.
        lastNotifiedTitle = document.title;
        scheduleRenderRequests();
    }
}

window.addEventListener('popstate', checkForNavigation);
window.addEventListener('hashchange', checkForNavigation);

new MutationObserver(checkForNavigation)
    .observe(document.head, { childList: true, subtree: true, characterData: true });
