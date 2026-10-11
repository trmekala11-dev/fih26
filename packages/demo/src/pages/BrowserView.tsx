import {
	css,
	type Delegate,
	type Component,
	createState,
} from "dreamland/core";
import {
	CatchEscapedLinksPlugin,
	UrlWatcherPlugin,
} from "@mercuryworkshop/scramjet-utils";
import { versionInfo } from "@mercuryworkshop/scramjet";
import { cachePlugin, controller } from "..";
import { demoSettingsStore } from "../store";
import { resolveInput } from "../keywords";
import homepage from "./homepage.html?raw";
import type { Frame } from "@mercuryworkshop/scramjet-controller";

export const browserState = createState({
	url: demoSettingsStore.homeUrl,
	frame: null! as Frame,
});

export const Omnibox: Component = function (cx) {
	const navigate = () => {
		const target = resolveInput(browserState.url);
		if (!target) return;
		browserState.url = target;
		demoSettingsStore.homeUrl = target;
		browserState.frame?.go(target);
	};
	return (
		<form
			class="url-form"
			on:submit={(e: SubmitEvent) => {
				e.preventDefault();
				navigate();
			}}
		>
			<div class="browser-omnibox-shell">
				<div class="omnibox-nav" aria-hidden="true">
					<button
						type="button"
						class="nav-btn"
						on:click={() => browserState.frame?.back()}
					>
						<span class="material-symbols-outlined">arrow_back</span>
					</button>
					<button
						type="button"
						class="nav-btn"
						on:click={() => browserState.frame?.forward()}
					>
						<span class="material-symbols-outlined">arrow_forward</span>
					</button>
					<button
						type="button"
						class="nav-btn"
						on:click={() => browserState.frame?.reload()}
					>
						<span class="material-symbols-outlined">refresh</span>
					</button>
				</div>
				<input
					id="search"
					class="url-input"
					type="text"
					value={use(browserState.url)}
					spellcheck="false"
					placeholder="Enter a URL, keyword (e.g. youtube) or search..."
				/>
			</div>
		</form>
	);
};
Omnibox.style = css`
	:scope {
		display: flex;
		align-items: center;
		padding: 6px 10px;
		min-width: 0;
		width: 100%;
		box-sizing: border-box;
	}
	.browser-omnibox-shell {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 0.35em;
		min-width: 0;
		padding: 2px 6px 2px 4px;
		border-radius: 999px;
		background: rgba(125, 211, 252, 0.08);
		border: 1px solid rgba(125, 211, 252, 0.22);
		transition:
			border-color 0.15s,
			box-shadow 0.15s,
			background 0.15s;
	}
	.browser-omnibox-shell:focus-within {
		background: rgba(125, 211, 252, 0.14);
		border-color: #38bdf8;
		box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.22);
	}
	.omnibox-nav {
		display: flex;
		align-items: center;
		gap: 0.1em;
	}
	.nav-btn {
		border: 0;
		background: transparent;
		color: #8ec5e8;
		width: 1.9em;
		height: 1.9em;
		padding: 0;
		border-radius: 50%;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: background 0.15s, color 0.15s;
	}
	.nav-btn:hover {
		background: rgba(253, 224, 71, 0.16);
		color: #fde047;
	}
	.browser-omnibox-shell .material-symbols-outlined {
		font-size: 17px !important;
		line-height: 1 !important;
		font-variation-settings:
			"OPSZ" 20,
			"wght" 300,
			"FILL" 0,
			"GRAD" 0;
	}
	.url-input {
		box-sizing: border-box;
		width: 100%;
		padding: 0.4em 0.5em;
		font-size: 0.92em;
		border: 0;
		background: transparent;
		color: #e6f6ff;
		outline: none;
		font-family: inherit;
	}
	.url-input::placeholder {
		color: #6aa7cf;
	}
`;

const BrowserView: Component<
	{
		active: boolean;
	},
	{},
	{
		frameel: HTMLIFrameElement;
	}
> = function (cx) {
	cx.mount = async () => {
		await controller.wait();

		let urlWatcher = new UrlWatcherPlugin((url) => {
			browserState.url = url;
		});
		let catchEscapedLinks = new CatchEscapedLinksPlugin(
			(url) =>
				new URL(`/?goto=${encodeURIComponent(url.href)}`, location.origin)
		);
		browserState.frame = controller.createFrame(this.frameel, {
			plugins: [cachePlugin, urlWatcher, catchEscapedLinks],
		});
		window.addEventListener("message", (e: MessageEvent) => {
			if (e.source !== this.frameel.contentWindow) return;
			if (e.data?.type !== "fihh-search" || typeof e.data.value !== "string")
				return;
			const target = resolveInput(e.data.value);
			if (!target) return;
			browserState.url = target;
			demoSettingsStore.homeUrl = target;
			browserState.frame?.go(target);
		});
		let realHomepage = homepage;
		realHomepage = realHomepage.replaceAll(
			"{{SCRAMJET_VERSION}}",
			String(versionInfo.version)
		);
		realHomepage = realHomepage.replaceAll(
			"{{SCRAMJET_BUILD}}",
			String(versionInfo.build)
		);
		realHomepage = realHomepage.replaceAll(
			"{{SCRAMJET_DATE_PRETTY}}",
			new Date(versionInfo.date).toLocaleString(undefined, {
				dateStyle: "short",
				timeStyle: "short",
			})
		);
		this.frameel.src = `data:text/html;base64,${btoa(realHomepage)}`;

		let goto = new URL(location.href).searchParams.get("goto");
		if (goto) {
			browserState.frame?.go(goto);
			history.replaceState(null, "", location.href.split("?")[0]);
		}
	};

	return (
		<div
			class={use(this.active).map(
				(active) => `tab-panel browser-view ${active ? "active" : ""}`
			)}
		>
			<iframe this={use(this.frameel)}></iframe>
		</div>
	);
};

BrowserView.style = css`
	:scope {
		flex: 1;
		width: 100%;
		min-width: 0;
		min-height: 0;
		display: none;
		flex-direction: column;
	}
	:scope.active {
		display: flex;
	}

	iframe {
		background: #072a45;
		flex: 1;
		border: none;
	}
`;

export default BrowserView;
