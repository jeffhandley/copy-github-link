import defaultLinkFormats from './defaultLinkFormats.js';

// Saves options to chrome.storage
const saveOptions = () => {
  // const color = document.getElementById('color').value;
  // const likesColor = document.getElementById('like').checked;

  // chrome.storage.sync.set(
  //   { favoriteColor: color, likesColor: likesColor },
  //   () => {
  //     // Update status to let user know options were saved.
  //     const status = document.getElementById('status');
  //     status.textContent = 'Options saved.';
  //     setTimeout(() => {
  //       status.textContent = '';
  //     }, 750);
  //   }
  // );
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  // chrome.storage.sync.get(
  //   { favoriteColor: 'red', likesColor: true },
  //   (items) => {
  //     document.getElementById('color').value = items.favoriteColor;
  //     document.getElementById('like').checked = items.likesColor;
  //   }
  // );
};

// document.addEventListener('DOMContentLoaded', restoreOptions);
// document.getElementById('save').addEventListener('click', saveOptions);

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

const linkFormatsTextArea = document.getElementById('link-formats');

const formatLines = defaultLinkFormats.reduce((text, format, index) =>
  `${text}${(index > 0 ? ',\n' : '')}  ${JSON.stringify(format)}`
, '[\n') + '\n]\n';

linkFormatsTextArea.value = formatLines;

const linkFormats = parseLinkFormats(JSON.parse(linkFormatsTextArea.value), data);
console.log(linkFormats);
