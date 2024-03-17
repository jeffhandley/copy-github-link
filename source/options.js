import defaultOptions from './defaultOptions.js';

const logoImage = document.getElementById('logo');
logoImage.src = chrome.runtime.getURL('images/icon-32-enabled.png');

const disableAppHeaderElement = document.getElementById('disable-app-header');
const disablePullRequestIssueElement = document.getElementById('disable-pullrequest-issue');
const linkFormatsTextArea = document.getElementById('link-formats');

const saveButton = document.getElementById('save-button');
const resetButton = document.getElementById('reset-button');
const statusMessage = document.getElementById('status-message');
let statusMessageTimeout = null;

chrome.storage.sync.get(defaultOptions, renderOptions);

saveButton.addEventListener('click', saveOptionsToStorage);

resetButton.addEventListener('click', () => {
  renderOptions(defaultOptions);
  showStatus('Options restored to defaults, but not saved', 2500);
});

function convertLinkFormatsToText(linkFormats) {
  return linkFormats.reduce((text, format, index) =>
    `${text}${(index > 0 ? ',\n' : '')}  ${JSON.stringify(format)}`
    , '[\n'
  ) + '\n]\n';
}

function renderOptions({disableAppHeaderButton, disablePullRequestIssueButton, linkFormats}) {
  disableAppHeaderElement.checked = disableAppHeaderButton;
  disablePullRequestIssueElement.checked = disablePullRequestIssueButton;
  linkFormatsTextArea.value = convertLinkFormatsToText(linkFormats);
}

function saveOptionsToStorage() {
  try {
    const linkFormats = JSON.parse(linkFormatsTextArea.value);

    chrome.storage.sync.set(
      {
        disableAppHeaderButton: !!disableAppHeaderElement.checked,
        disablePullRequestIssueButton: !!disablePullRequestIssueElement.checked,
        linkFormats
      },
      () => showStatus('Options saved', 1500)
    );
  }
  catch (error) {
    showStatus(error, 10000);
    return;
  }
}

function showStatus(message, duration) {
  if (statusMessageTimeout) clearTimeout(statusMessageTimeout);

  statusMessage.textContent = message;
  statusMessageTimeout = setTimeout(() => statusMessage.textContent = '', duration);
}
