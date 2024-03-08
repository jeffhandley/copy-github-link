chrome.runtime.onMessage.addListener(({ url, text }) => {
    const copyToClipboard = (event) => {
        event.clipboardData.setData("text/plain", text);
        event.clipboardData.setData("text/html", `<a href="${url}">${text}</a>`);

        event.preventDefault();
    };

    document.addEventListener("copy", copyToClipboard);
    document.execCommand("copy");
    document.removeEventListener("copy", copyToClipboard);
});
