// Turns whatever is typed in the omnibox into a URL.
//
// 1. "youtube"            -> keyword shortcut (see SITE_KEYWORDS)
// 2. "yt cats"            -> search shortcut (see SEARCH_KEYWORDS)
// 3. "example.com/page"   -> treated as a URL
// 4. anything else        -> web search

const SEARCH_URL = "https://www.google.com/search?q=%s";

// Single-word shortcuts that open a site. Add your own here.
export const SITE_KEYWORDS: Record<string, string> = {
	google: "https://www.google.com",
	youtube: "https://www.youtube.com",
	yt: "https://www.youtube.com",
	reddit: "https://www.reddit.com",
	wikipedia: "https://www.wikipedia.org",
	wiki: "https://www.wikipedia.org",
	github: "https://github.com",
	gh: "https://github.com",
	twitter: "https://twitter.com",
	x: "https://x.com",
	discord: "https://discord.com",
	spotify: "https://open.spotify.com",
	twitch: "https://www.twitch.tv",
	netflix: "https://www.netflix.com",
	amazon: "https://www.amazon.com",
	instagram: "https://www.instagram.com",
	duckduckgo: "https://duckduckgo.com",
	ddg: "https://duckduckgo.com",
	bing: "https://www.bing.com",
};

// "<keyword> <search terms>" shortcuts. %s is replaced by the terms.
export const SEARCH_KEYWORDS: Record<string, string> = {
	g: "https://www.google.com/search?q=%s",
	yt: "https://www.youtube.com/results?search_query=%s",
	youtube: "https://www.youtube.com/results?search_query=%s",
	wiki: "https://en.wikipedia.org/w/index.php?search=%s",
	r: "https://www.reddit.com/search/?q=%s",
	reddit: "https://www.reddit.com/search/?q=%s",
	gh: "https://github.com/search?q=%s",
	github: "https://github.com/search?q=%s",
	ddg: "https://duckduckgo.com/?q=%s",
	bing: "https://www.bing.com/search?q=%s",
};

const SCHEME = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//;
const IPV4 = /^\d{1,3}(\.\d{1,3}){3}(:\d+)?(\/.*)?$/;
const HOSTLIKE = /^(localhost|([a-z\d]([a-z\d-]*[a-z\d])?\.)+[a-z]{2,})(:\d+)?([/?#].*)?$/i;

const searchFor = (template: string, terms: string) =>
	template.replace("%s", encodeURIComponent(terms));

export function resolveInput(raw: string): string | null {
	const input = raw.trim();
	if (!input) return null;

	if (SCHEME.test(input)) return input;

	const lower = input.toLowerCase();
	if (SITE_KEYWORDS[lower]) return SITE_KEYWORDS[lower];

	const space = input.indexOf(" ");
	if (space > 0) {
		const key = lower.slice(0, space);
		const terms = input.slice(space + 1).trim();
		if (terms && SEARCH_KEYWORDS[key]) {
			return searchFor(SEARCH_KEYWORDS[key], terms);
		}
	}

	if (!/\s/.test(input) && (IPV4.test(input) || HOSTLIKE.test(input))) {
		return `https://${input}`;
	}

	return searchFor(SEARCH_URL, input);
}
