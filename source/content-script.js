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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type } = message;

    switch (message.type) {
        case 'copyLink':
            return copyLinkToClipboard(message);
    }
});
