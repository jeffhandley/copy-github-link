import defaultLinkFormats from './defaultLinkFormats.js';

const disableAppHeaderElement = document.getElementById('disable-app-header');
const disablePullRequestIssueElement = document.getElementById('disable-pullrequest-issue');
const linkFormatsTextArea = document.getElementById('link-formats');

const saveButton = document.getElementById('save-button');
const resetButton = document.getElementById('reset-button');
const status = document.getElementById('status');

function convertLinkFormatsToText(linkFormats) {
  return linkFormats.reduce((text, format, index) =>
    `${text}${(index > 0 ? ',\n' : '')}  ${JSON.stringify(format)}`
    , '[\n'
  ) + '\n]\n';
}

// Saves options to chrome.storage
const saveOptionsToStorage = () => {
  chrome.storage.sync.set(
    {
      disableAppHeaderButton: !!disableAppHeaderElement.checked,
      disablePullRequestIssueButton: !!disablePullRequestIssueElement.checked,
      linkFormats: JSON.parse(linkFormatsTextArea.value)
    },
    () => {
      status.textContent = 'Options saved';
      setTimeout(() => status.textContent = '', 750);
    }
  );
};

const defaultOptions = {
  disableAppHeaderButton: false,
  disablePullRequestIssueButton: false,
  linkFormats: defaultLinkFormats
};

function renderOptions({disableAppHeaderButton, disablePullRequestIssueButton, linkFormats}) {
  disableAppHeaderElement.checked = disableAppHeaderButton;
  disablePullRequestIssueElement.checked = disablePullRequestIssueButton;
  linkFormatsTextArea.value = convertLinkFormatsToText(linkFormats);
}

function loadOptionsFromStorage() {
  chrome.storage.sync.get(defaultOptions, renderOptions);
}

document.addEventListener('DOMContentLoaded', loadOptionsFromStorage);

saveButton.addEventListener('click', saveOptionsToStorage);

resetButton.addEventListener('click', () => {
  renderOptions(defaultOptions);
  status.textContent = 'Defaults restored but not saved';
  setTimeout(() => status.textContent = '', 1500);
});

const logoImage = document.getElementById('logo');
logoImage.src = chrome.runtime.getURL('images/icon-32-enabled.png');

const data = {
  org: 'jeffhandley',
  repo: 'copy-github-link',
  number: '7',
  title: 'pull request number 7',
  url: 'https://github.com/jeffhandley/copy-github-link/pull/7#event123',
  origin: 'https://github.com',
  hostname: 'github.com',
  pathname: 'jeffhandley/copy-github-link/pull/7',
  hash: '#event123',
  filepath: null
};
