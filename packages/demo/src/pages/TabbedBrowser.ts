// Tabbed browser: every tab is its own iframe controlled by its own scramjet Frame.
import {
	CatchEscapedLinksPlugin,
	UrlWatcherPlugin,
} from "@mercuryworkshop/scramjet-utils";
import type { Frame } from "@mercuryworkshop/scramjet-controller";
import { cachePlugin, controller } from "..";
import { resolveInput } from "../keywords";
import homepage from "./homepage.html?raw";

export interface BrowserParts {
	tabstrip: HTMLElement;
	toolbar: HTMLElement;
	view: HTMLElement;
}

interface Tab {
	iframe: HTMLIFrameElement;
	frame: Frame;
	url: string;
	home: boolean;
	title: string;
	tabEl: HTMLElement;
	titleEl: HTMLElement;
}

const STYLE = `
.fx-tabstrip{display:flex;align-items:center;gap:4px;flex:1;min-width:0;overflow-x:auto;scrollbar-width:none}
.fx-tabstrip::-webkit-scrollbar{display:none}
.fx-tab{display:flex;align-items:center;gap:6px;flex:0 1 200px;min-width:90px;max-width:200px;box-sizing:border-box;padding:5px 6px 5px 12px;border-radius:999px;background:rgba(125,211,252,.1);color:#bfe3f8;font-size:.84em;cursor:pointer;user-select:none;transition:background .15s}
.fx-tab:hover{background:rgba(125,211,252,.22)}
.fx-tab.active{background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#fff;box-shadow:0 2px 10px rgba(14,165,233,.4)}
.fx-tab.active::before{content:"";flex:none;width:6px;height:6px;border-radius:50%;background:#fde047}
.fx-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fx-close,.fx-new,.fx-btn{border:0;background:transparent;color:#8ec5e8;cursor:pointer;font:inherit;padding:0;transition:background .15s,color .15s}
.fx-close{flex:none;width:20px;height:20px;border-radius:50%;font-size:15px;line-height:1;color:inherit;opacity:.85}
.fx-close:hover{background:rgba(253,224,71,.25);color:#fde047;opacity:1}
.fx-new{flex:none;width:28px;height:28px;border-radius:50%;font-size:20px;line-height:1}
.fx-new:hover,.fx-btn:hover{background:rgba(253,224,71,.18);color:#fde047}
.fx-toolbar{display:flex;align-items:center;gap:6px;padding:6px 10px;background:rgba(7,42,69,.6);border-bottom:1px solid rgba(125,211,252,.18)}
.fx-btn{flex:none;width:32px;height:32px;border-radius:50%;font-size:17px;line-height:1}
.fx-omni{flex:1;display:flex;min-width:0;margin:0}
.fx-omni input{width:100%;box-sizing:border-box;padding:.5em 1em;border-radius:999px;border:1px solid rgba(125,211,252,.22);background:rgba(125,211,252,.08);color:#e6f6ff;font:inherit;font-size:.92em;outline:none;transition:border-color .15s,box-shadow .15s,background .15s}
.fx-omni input::placeholder{color:#6aa7cf}
.fx-omni input:focus{border-color:#38bdf8;box-shadow:0 0 0 3px rgba(56,189,248,.22);background:rgba(125,211,252,.14)}
.fx-view{position:relative;flex:1;min-width:0;min-height:0}
.fx-frame{position:absolute;top:0;left:0;width:100%;height:100%;border:0;background:#072a45}
`;

export function createTabbedBrowser(parts: BrowserParts) {
	const style = document.createElement("style");
	style.textContent = STYLE;
	document.head.append(style);

	const homeDataUrl = `data:text/html;base64,${btoa(homepage)}`;
	const tabs: Tab[] = [];
	let active: Tab | null = null;

	// ---- toolbar -----------------------------------------------------------
	parts.toolbar.className = "fx-toolbar";
	const mkBtn = (label: string, title: string, onClick: () => void) => {
		const b = document.createElement("button");
		b.type = "button";
		b.className = "fx-btn";
		b.title = title;
		b.textContent = label;
		b.addEventListener("click", onClick);
		return b;
	};
	const form = document.createElement("form");
	form.className = "fx-omni";
	const input = document.createElement("input");
	input.type = "text";
	input.spellcheck = false;
	input.placeholder = "Enter a URL, keyword (e.g. youtube) or search...";
	form.append(input);
	form.addEventListener("submit", (e) => {
		e.preventDefault();
		if (active) navigate(active, input.value);
	});
	parts.toolbar.append(
		mkBtn("\u2190", "Back", () => active?.frame.back()),
		mkBtn("\u2192", "Forward", () => active?.frame.forward()),
		mkBtn("\u21BB", "Reload", () => active?.frame.reload()),
		mkBtn("\u2302", "Home", () => active && goHome(active)),
		form
	);

	// ---- tab strip ---------------------------------------------------------
	parts.tabstrip.className = "fx-tabstrip";
	parts.view.classList.add("fx-view");
	const newBtn = document.createElement("button");
	newBtn.type = "button";
	newBtn.className = "fx-new";
	newBtn.title = "New tab";
	newBtn.textContent = "+";
	newBtn.addEventListener("click", () => newTab());
	parts.tabstrip.append(newBtn);

	// ---- behaviour ---------------------------------------------------------
	function setActive(tab: Tab) {
		active = tab;
		for (const t of tabs) {
			t.iframe.style.display = t === tab ? "block" : "none";
			t.tabEl.classList.toggle("active", t === tab);
		}
		input.value = tab.home ? "" : tab.url;
		if (tab.home) input.focus();
	}

	function navigate(tab: Tab, raw: string) {
		const target = resolveInput(raw);
		if (!target) return;
		tab.url = target;
		tab.home = false;
		if (active === tab) input.value = target;
		tab.frame.go(target);
	}

	function goHome(tab: Tab) {
		tab.home = true;
		tab.url = "";
		tab.iframe.src = homeDataUrl;
		setTitle(tab, "New Tab");
		if (active === tab) setActive(tab);
	}

	function setTitle(tab: Tab, title: string) {
		if (tab.title === title) return;
		tab.title = title;
		tab.titleEl.textContent = title;
		tab.tabEl.title = title;
	}

	function closeTab(tab: Tab) {
		const i = tabs.indexOf(tab);
		if (i < 0) return;
		tabs.splice(i, 1);
		tab.tabEl.remove();
		tab.iframe.remove();
		if (tabs.length === 0) {
			newTab();
		} else if (active === tab) {
			setActive(tabs[Math.min(i, tabs.length - 1)]);
		}
	}

	function newTab(go?: string): Tab {
		const iframe = document.createElement("iframe");
		iframe.className = "fx-frame";
		iframe.style.display = "none";
		parts.view.append(iframe);

		const tab = {
			iframe,
			url: "",
			home: true,
			title: "New Tab",
		} as Tab;

		const urlWatcher = new UrlWatcherPlugin((url: string) => {
			tab.url = url;
			tab.home = false;
			if (active === tab) input.value = url;
		});
		const catchEscapedLinks = new CatchEscapedLinksPlugin(
			(url: URL) =>
				new URL(`/?goto=${encodeURIComponent(url.href)}`, location.origin)
		);
		tab.frame = controller.createFrame(iframe, {
			plugins: [cachePlugin, urlWatcher, catchEscapedLinks],
		});

		const tabEl = document.createElement("div");
		tabEl.className = "fx-tab";
		const titleEl = document.createElement("span");
		titleEl.className = "fx-title";
		titleEl.textContent = tab.title;
		const close = document.createElement("button");
		close.type = "button";
		close.className = "fx-close";
		close.title = "Close tab";
		close.textContent = "\u00D7";
		close.addEventListener("click", (e) => {
			e.stopPropagation();
			closeTab(tab);
		});
		tabEl.append(titleEl, close);
		tabEl.addEventListener("click", () => setActive(tab));
		tabEl.addEventListener("auxclick", (e) => {
			if (e.button === 1) closeTab(tab);
		});
		tab.tabEl = tabEl;
		tab.titleEl = titleEl;
		parts.tabstrip.insertBefore(tabEl, newBtn);

		tabs.push(tab);
		iframe.src = homeDataUrl;
		setActive(tab);
		if (go) navigate(tab, go);
		return tab;
	}

	// The homepage lives in a data: iframe and asks us to navigate via postMessage.
	window.addEventListener("message", (e: MessageEvent) => {
		const tab = tabs.find((t) => t.iframe.contentWindow === e.source);
		if (!tab) return;
		if (e.data?.type === "fihh-search" && typeof e.data.value === "string") {
			navigate(tab, e.data.value);
		} else if (e.data?.type === "fihh-home") {
			goHome(tab);
		}
	});

	// Keep tab titles in sync with the page inside each tab.
	setInterval(() => {
		for (const tab of tabs) {
			if (tab.home) {
				setTitle(tab, "New Tab");
				continue;
			}
			let title = "";
			try {
				title = tab.iframe.contentDocument?.title || "";
			} catch {}
			if (!title) {
				try {
					title = new URL(tab.url).hostname;
				} catch {}
			}
			setTitle(tab, title || "Loading...");
		}
	}, 1000);

	// Links that escape the frame reload the app with ?goto=...; open that in a tab.
	const goto = new URL(location.href).searchParams.get("goto");
	if (goto) {
		history.replaceState(null, "", location.href.split("?")[0]);
		newTab(goto);
	} else {
		newTab();
	}
}
