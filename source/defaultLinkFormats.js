export default [
  // Basic pull/issue links with a trailing separator
  "{org}/{repo}/#{number}",
  "#{number}",
  ["{separator}", "{number}"],

  // Common pull/issue title links with a trailing separator
  ["{title}","{number}"],
  ["{title} (#{number})", "{org}{repo}"],
  "{title} ({org}/{repo}#{number})",
  ["{separator}", "{number}{title}"],

  // The raw URL (including the hash)
  "{url}",

  // The URL without the hash (but only when there was a hash)
  ["{origin}/{pathname}", "{hash}"],
  ["{separator}", "{hash}"],
  "{hostname}/{pathname}{hash}",

  // The URL without the scheme
  "{hostname}/{pathname}",

  // The URL path without the scheme or the origin or hash (but only when it's not a pull or issue)
  ["{pathname}", null, "{number}"],

  // Username (but only when there is not a repo)
  ["@{org}", null, "{repo}"],

  // Less common pull/issue links
  ["{separator}", "{number}"],
  ["{origin}/{org}/{repo}", "{number}"],
  ["{hostname}/{org}/{repo}", "{number}"],
  ["{org}/{repo}", "{number}"],
  ["{repo}", "{number}"],

  // File path links
  ["{separator}", "{filepath}"],
  "{filepath}"
];
