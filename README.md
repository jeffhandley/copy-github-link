# Chromium Extension: Copy GitHub Link

Copy a formatted GitHub link to a repository, issue, or pull request. Each link available is copied to the clipboard using the full URL of the current page, with the text of the link in the following formats. Not all link formats are applicable for all GitHub URLs, so any format that is not applicable for the current page is ommitted. Clicking on one of the links copies it to the clipboard in both plain text format (just the text, without the URL) and as an HTML link.

## Links Available Through the Extension Popup

* When viewing an issues or a pull request
  * `{org}/{repo}#{number}`
  * `#{number}`
  * `{title}` (for pull requests, the "by {author}" suffix is removed from the title)
  * `{title} (#{number})`
  * `{title} ({org}/{repo}#{number})`
* For any GitHub URL within an org/repo
  * `https://github.com/{org}/{repo}`
  * `github.com/{org}/{repo}`
  * `{org}/{repo}`
  * `{repo}`
* For all GitHub URLs
  * `https://github.com/{pathname}#{hashname}`
  * `https://github.com/{pathname}`
  * `github.com/{pathname}#{hashname}`
  * `github.com/{pathname}`

Links to pull requests that include the title remove the " by {author} · Pull Request #{number} · {org}/{repo}" suffix.

## Acknowledgements

This extension was originally inspired by @zaki-yama, and their [zaki-yama/copy-title-and-url-as-markdown: Chrome Extension: Quickly copy the title & url of current tab as Markdown style](https://github.com/zaki-yama/copy-title-and-url-as-markdown). Fun note, that extension was used to copy that link as Markdown.

Additional acknowledgement to @timheuer for creating [timheuer/repolink](https://github.com/timheuer/repolink) when I asked if an extension like this existed. Tim's quick turnaround for creating that extension encouraged the development of this implementation.
