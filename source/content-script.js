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
