import { css, type Component } from "dreamland/core";
const LoadInterstitial: Component<{
	status: string;
}> = function () {
	return (
		<dialog class="signin">
			<h1>Fihh...</h1>
			<p>{use(this.status)}</p>
		</dialog>
	);
};

LoadInterstitial.style = css`
	:scope {
		transition: opacity 0.4s ease;
		width: 50%;
		height: 20%;
		border-radius: 1em;
		background: #072a45;
		color: #e6f6ff;
		border: 1px solid #38bdf8;
		text-align: center;
	}
	h1 {
		text-align: center;
		font-weight: bold;
		font-size: 2em;
	}
	:modal[open] {
		animation: fade 0.4s ease normal;
	}

	:modal::backdrop {
		backdrop-filter: blur(3px);
	}
`;

export default LoadInterstitial;
