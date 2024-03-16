export default function isGitHub(tab) {
    const hasTabUrl = tab && tab.id && tab.url;

    if (hasTabUrl) {
        const {origin} = new URL(tab.url);
        return origin === 'https://github.com';
    }

    return false;
}
