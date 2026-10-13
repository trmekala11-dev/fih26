import { css, type Component } from "dreamland/core";
import FlagEditor from "./components/FlagEditor";
import { createTabbedBrowser } from "./pages/TabbedBrowser";

const App: Component<
	{},
	{},
	{
		tabstrip: HTMLDivElement;
		toolbar: HTMLDivElement;
		view: HTMLDivElement;
	}
> = function (cx) {
	cx.mount = () => {
		createTabbedBrowser({
			tabstrip: this.tabstrip,
			toolbar: this.toolbar,
			view: this.view,
		});
	};
	return (
		<div>
			<div class="chrome">
				<div class="top-bar">
					<div class="brand">
						<span class="brand-name">Fihh's Proxy</span>
					</div>
					<div class="tab-bar">
						<div this={use(this.tabstrip)}></div>
					</div>
					<div class="top-actions">
						<FlagEditor inline={true} />
					</div>
				</div>
				<div this={use(this.toolbar)}></div>
			</div>
			<div class="tab-panel browser-panel active">
				<div this={use(this.view)}></div>
			</div>
		</div>
	);
};

App.style = css`
	@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20,400,0,0");
	@import url("https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap");

	:scope {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		margin: 0;
		overflow: hidden;
		position: absolute;
		top: 0;
		left: 0;

		padding: 0;
		font-family: "Fredoka", "Trebuchet MS", system-ui, sans-serif;
		background: radial-gradient(circle at 20% -10%, #0b3b63 0%, #04121f 55%);
		box-sizing: border-box;
	}
	.material-symbols-outlined {
		font-family: "Material Symbols Outlined";
		font-weight: normal;
		font-style: normal;
		font-size: 11px;
		line-height: 1;
		letter-spacing: normal;
		text-transform: none;
		display: inline-block;
		white-space: nowrap;
		word-wrap: normal;
		direction: ltr;
		-webkit-font-smoothing: antialiased;
	}
	.top-bar {
		position: relative;
		z-index: 5;
		display: flex;
		align-items: stretch;
		gap: 0;
		margin-bottom: 0;
		border-bottom: 1px solid rgba(125, 211, 252, 0.18);
		background: rgba(7, 42, 69, 0.72);
		backdrop-filter: blur(14px);
		padding: 4px 6px;
		align-items: center;
		gap: 6px;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 0.45em;
		padding: 0 0.5em;
	}
	.brand-name {
		color: #7dd3fc;
		font-weight: 700;
		font-size: 0.95em;
		letter-spacing: 0.03em;
	}
	.tab-bar {
		display: flex;
		flex: 1;
		align-items: center;
		min-width: 0;
		gap: 0;
	}
	.tab-button {
		border: 1px solid transparent;
		background: transparent;
		color: #8ec5e8;
		padding: 0.24em 0.62em;
		border-radius: 999px;
		cursor: pointer;
		font-size: 0.84em;
		line-height: 1.2;
		min-height: 28px;
		margin: 0;
		white-space: nowrap;
		display: inline-flex;
		align-items: center;
	}
	.tab-button.active {
		background: linear-gradient(135deg, #0ea5e9, #2563eb);
		color: #fff;
		box-shadow: 0 2px 10px rgba(14, 165, 233, 0.4);
	}
	.top-actions {
		display: flex;
		align-items: center;
		margin-left: auto;
		padding: 0 0.35em;
		min-height: 28px;
	}
	.chrome {
		position: relative;
		z-index: 5;
	}
	.chrome::after,
	.chrome::before {
		content: "";
		position: absolute;
		left: 0;
		top: 100%;
		width: 100%;
		height: 16px;
		pointer-events: none;
		background-repeat: repeat-x;
		background-size: 50% 100%;
	}
	.chrome::before {
		background-image: url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 120%22 preserveAspectRatio=%22none%22%3E%3Cpath fill=%22rgba(14,165,233,0.30)%22 d=%22M0,70 C200,10 400,110 600,70 C800,30 1000,110 1200,70 L1200,120 L0,120 Z%22/%3E%3C/svg%3E");
		animation: wave-drift 11s linear infinite reverse;
	}
	.chrome::after {
		background-image: url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 120%22 preserveAspectRatio=%22none%22%3E%3Cpath fill=%22rgba(56,189,248,0.35)%22 d=%22M0,60 C150,100 350,0 600,60 C850,120 1050,20 1200,60 L1200,120 L0,120 Z%22/%3E%3C/svg%3E");
		animation: wave-drift 7s linear infinite;
	}
	@keyframes wave-drift {
		from { background-position-x: 0; }
		to { background-position-x: 100%; }
	}
	.brand-name {
		font-family: "Fredoka", sans-serif;
	}
	.brand-name::after {
		content: "";
		display: inline-block;
		width: 6px;
		height: 6px;
		margin-left: 5px;
		border-radius: 50%;
		background: #fde047;
		box-shadow: 0 0 8px rgba(253, 224, 71, 0.8);
	}
	.tab-button.active::before {
		content: "";
		width: 6px;
		height: 6px;
		margin-right: 6px;
		border-radius: 50%;
		background: #fde047;
	}
	.tab-panel {
		flex: 1;
		width: 100%;
		min-width: 0;
		min-height: 0;
		display: none;
	}
	.tab-panel.active {
		display: flex;
	}
`;
export default App;
