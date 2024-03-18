export default {
  disableAppHeaderButton: false,
  disablePullRequestIssueButton: false,

  linkFormats: [
      // Basic pull/issue links
      ["<group>Pull Request / Issue", "{number}"],
      "{org}/{repo}/#{number}",
      "#{number}",

      // Additional pull/issue links in a new group
      ["<group>", "{number}"],
      ["{title}","{number}"],
      ["{title} (#{number})", "{org}{repo}"],
      "{title} ({org}/{repo}#{number})",

      // Code path links
      ["<group>Code Links", "{codepath}"],
      "{repo}/{codebranch}/{codepath}",
      "{repo}/{codepath} ({codebranch})",
      "{repo}/{codepath}",
      "{codepath} ({codebranch})",
      "{codepath}",

      "<group>Org / Repo (targeting current page)",
      "{origin}/{org}/{repo}",
      "{hostname}/{org}/{repo}",
      "{org}/{repo}",
      "{repo}",
      "{org}",
      "@{org}",

      // The raw URL (including the hash)
      "<group>URL",
      "{url}",
      "{hostname}/{pathname}{hash}",
      "{hostname}/{pathname}",

      // The URL without the hash (but only when there was a hash)
      ["{origin}/{pathname}", "{hash}"],

      // The URL path without the scheme or the origin or hash (but only when it's not a pull or issue)
      ["{pathname}", null, "{number}"],

      ["<group>Link to Repository", "{repo}"],
      ["{origin}/{org}/{repo}", null, null, "https://github.com/{org}/{repo}"],
      ["{hostname}/{org}/{repo}", null, null, "https://github.com/{org}/{repo}"],
      ["{org}/{repo}", null, null, "https://github.com/{org}/{repo}"],
      ["{repo}", null, null, "https://github.com/{org}/{repo}"],

      ["<group>Link to Organization / User", "{org}"],
      ["{org}", null, null, "https://github.com/{org}"],
      ["@{org}", null, null, "https://github.com/{org}"]
    ]
};
