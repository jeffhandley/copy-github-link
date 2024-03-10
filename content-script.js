chrome.runtime.onMessage.addListener(({ type, url, text }) => {
    if (type === "copy") {
        const copyToClipboard = (event) => {
            event.clipboardData.setData("text/plain", text);
            event.clipboardData.setData("text/html", `<a href="${url}">${text}</a>`);

            event.preventDefault();
        };

        document.addEventListener("copy", copyToClipboard);
        document.execCommand("copy");
        document.removeEventListener("copy", copyToClipboard);
    }
});

function detectDarkMode() {
    const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    chrome.runtime.sendMessage({ type: "darkMode", darkMode });
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', detectDarkMode);
detectDarkMode();
