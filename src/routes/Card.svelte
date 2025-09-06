<script lang="ts">
	// How to do Svelte 5 snippets correctly: https://stackoverflow.com/a/78664419
	import type { Snippet } from 'svelte';
	let { front, back }: { front: Snippet; back: Snippet } = $props();

	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';

	// TODO: Make logo animated with this: https://codepen.io/Juxtopposed/details/OJrLZvb
	// Card Source: https://codepen.io/LukyVj/pen/YzOXepM
</script>

<!--Thanks to Josetxu https://codepen.io/collection/gYYajP-->
<div class="pyramid-container">
	<div class="pyramid">
		<span></span>
		<span></span>
		<span></span>
		<span></span>
	</div>
	<div class="card">
		<a href={localizeHref('/blog')} data-umami-event="Secret Button (Blog)">
			<div class="card-flip">
				<div class="front">
					<div role="button">
						<span class="glow"></span>
						<div>
							<img src="eye-of-ra.webp" alt="" />
							{@render front()}
						</div>
					</div>
				</div>
				<div class="back">
					<div role="button">
						<span class="glow"></span>
						<div>
							{@render back()}
						</div>
						<!--<p>AMUN Technologie
                    <br>895 224 10 28</p> -->
					</div>
				</div>
			</div>
		</a>
	</div>
</div>

<style lang="scss">
	$color: #ddca7e;

	@font-face {
		font-family: 'Mona Sans';
		src:
			url('https://assets.codepen.io/64/Mona-Sans.woff2') format('woff2 supports variations'),
			url('https://assets.codepen.io/64/Mona-Sans.woff2') format('woff2-variations');
		font-weight: 100 1000;
	}

	@property --hue {
		syntax: '<number>';
		inherits: true;
		initial-value: 0;
	}
	@property --rotate {
		syntax: '<number>';
		inherits: true;
		initial-value: 0;
	}
	@property --bg-y {
		syntax: '<number>';
		inherits: true;
		initial-value: 0;
	}
	@property --bg-x {
		syntax: '<number>';
		inherits: true;
		initial-value: 0;
	}
	@property --glow-translate-y {
		syntax: '<number>';
		inherits: true;
		initial-value: 0;
	}
	@property --bg-size {
		syntax: '<number>';
		inherits: true;
		initial-value: 0;
	}
	@property --glow-opacity {
		syntax: '<number>';
		inherits: true;
		initial-value: 0;
	}
	@property --glow-blur {
		syntax: '<number>';
		inherits: true;
		initial-value: 0;
	}
	@property --glow-scale {
		syntax: '<number>';
		inherits: true;
		initial-value: 2;
	}

	@property --glow-radius {
		syntax: '<number>';
		inherits: true;
		initial-value: 2;
	}

	@property --white-shadow {
		syntax: '<number>';
		inherits: true;
		initial-value: 0;
	}

	:root {
		// utilities
		--debug: 0;
		--supported: 0;
		--not-supported: 0;

		// Pen vars
		--card-color: hsl(260deg 100% 3%);
		--text-color: hsl(260deg 10% 55%);
		--card-radius: 3.6vw;
		--card-width: 35vw;
		--border-width: 3px;
		--bg-size: 1;

		--hue: 0;
		--hue-speed: 1;

		--rotate: 0;
		--animation-speed: 4s;

		--interaction-speed: 0.55s;
		--glow-scale: 1.5;
		--scale-factor: 1;
		--glow-blur: 6; // 6
		--glow-opacity: 1; // 0.6
		--glow-radius: 100; // 100
		--glow-rotate-unit: 1deg;
	}

	.card {
		position: absolute;
		width: 100%;
		height: 16rem;
		margin: auto;
		transform: translateY(-10rem);
		border: 10px black;
		perspective: 1000px;
		transition:
			transform 2s,
			opacity 4s;
		opacity: 2%;

		:global(h1) {
			background:
				linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 0%, rgba(0, 0, 0, 0.15) 100%),
				radial-gradient(at top center, rgba(255, 255, 255, 0.4) 0%, rgba(0, 0, 0, 0.4) 120%) #989898;
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			font-size: 5em;
			letter-spacing: 7px;
			margin: 0;
			line-height: 1em;
		}

		img {
			display: block;
			height: 10rem;
			width: auto;
		}

		&:hover {
			opacity: 95%;
			transform: scale(110%);
			.card-flip {
				transform: rotateY(-180deg);
				div > div > div {
						mix-blend-mode: darken;
						--text-color: white;
						box-shadow: 0 0 calc(var(--white-shadow) * 1vw) calc(var(--white-shadow) * 0.15vw)
							rgb(255 255 255 / 20%);
						animation: shadow-pulse calc(var(--animation-speed) * 2) linear infinite;
						&:before {
							--bg-size: 15;
							animation-play-state: paused;
							transition: --bg-size var(--interaction-speed) ease;
						}
					}
					.glow {
						--glow-blur: 1.5;
						--glow-opacity: 0.6;
						--glow-scale: 2.5;
						--glow-radius: 0;
						--rotate: 900;
						--glow-rotate-unit: 0;
						--scale-factor: 1.25;
						animation-play-state: paused;

						&:after {
							--glow-translate-y: 0;
							animation-play-state: paused;
							transition:
								--glow-translate-y 0s ease,
								--glow-blur 0.05s ease,
								--glow-opacity 0.05s ease,
								--glow-scale 0.05s ease,
								--glow-radius 0.05s ease;
						}
					}
			}
		}

		.card-flip {
			position: relative;
			width: 100%;
			height: 100%;
			text-align: center;
			transition: transform 2s 3s;
			transform: rotateY(0deg);
			transform-style: preserve-3d;

			.front,
			.back {
				position: absolute;
				width: 100%;
				height: 100%;
				backface-visibility: hidden;
				display: flex;
				justify-content: center;
				align-items: center;
			}

			.back {
				transform: rotateY(180deg);
			}

			div > div {
				width: var(--card-width);
				width: min(480px, var(--card-width));
				aspect-ratio: 5/3;
				color: white;
				margin: auto;
				display: flex;
				align-items: center;
				justify-content: center;
				position: relative;
				z-index: 2;
				border-radius: var(--card-radius);
				cursor: pointer;

				&:hover {
					
				}

				&:before,
				&:after {
					content: '';
					display: block;
					position: absolute;
					width: 100%;
					height: 100%;
					border-radius: var(--card-radius);
				}

				> :global(div) {
					position: absolute;
					width: 30rem;
					height: 50rem;
					background: var(--card-color);
					border-radius: calc(calc(var(--card-radius) * 0.9));
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					font-weight: 800;
					text-transform: uppercase;
					font-stretch: 150%;
					font-size: 18px;
					font-size: clamp(1.5vw, 1.5vmin, 32px);
					color: var(--text-color);
					padding: calc(var(--card-width) / 8);

					:global(span) {
						display: block;
						margin: 1em;
						padding: 0.25em;
						border-radius: 4px;
						background: var(--text-color);
						color: black;
						font-weight: 900;
					}

					&:before {
						content: '';
						display: block;
						position: absolute;
						width: 100%;
						height: 100%;
						border-radius: calc(calc(var(--card-radius) * 0.9));
						box-shadow: 0 0 20px black;
						mix-blend-mode: color-burn;
						z-index: -1;
						background: hsl(0deg 0% 16%)
							radial-gradient(
								30% 30% at calc(var(--bg-x) * 1%) calc(var(--bg-y) * 1%),
								hsl(calc(calc(var(--hue) * var(--hue-speed)) * 1deg) 100% 90%)
									calc(0% * var(--bg-size)),
								hsl(calc(calc(var(--hue) * var(--hue-speed)) * 1deg) 100% 80%)
									calc(20% * var(--bg-size)),
								hsl(calc(calc(var(--hue) * var(--hue-speed)) * 1deg) 100% 60%)
									calc(40% * var(--bg-size)),
								transparent 100%
							);
						width: calc(100% + var(--border-width));
						height: calc(100% + var(--border-width));
						animation:
							hue-animation var(--animation-speed) linear infinite,
							rotate-bg var(--animation-speed) linear infinite;
						transition: --bg-size var(--interaction-speed) ease;
					}
				}

				.glow {
					--glow-translate-y: 0;
					display: block;
					position: absolute;
					width: calc(var(--card-width) / 5);
					height: calc(var(--card-width) / 5);
					animation: rotate var(--animation-speed) linear infinite;
					transform: rotateZ(calc(var(--rotate) * var(--glow-rotate-unit)));
					transform-origin: center;
					border-radius: calc(var(--glow-radius) * 10vw);

					&:after {
						content: '';
						display: block;
						z-index: -2;
						filter: blur(calc(var(--glow-blur) * 10px));
						width: 130%;
						height: 130%;
						left: -15%;
						top: -15%;
						background: hsl(calc(calc(var(--hue) * var(--hue-speed)) * 1deg) 100% 60%);
						position: relative;
						border-radius: calc(var(--glow-radius) * 10vw);
						animation: hue-animation var(--animation-speed) linear infinite;
						transform: scaleY(calc(var(--glow-scale) * var(--scale-factor) / 1.1))
							scaleX(calc(var(--glow-scale) * var(--scale-factor) * 1.2))
							translateY(calc(var(--glow-translate-y) * 1%));
						opacity: var(--glow-opacity);
					}
				}
			}
		}

		@keyframes shadow-pulse {
			0%,
			24%,
			46%,
			73%,
			96% {
				--white-shadow: 0.5;
			}
			12%,
			28%,
			41%,
			63%,
			75%,
			82%,
			98% {
				--white-shadow: 2.5;
			}
			6%,
			32%,
			57% {
				--white-shadow: 1.3;
			}
			18%,
			52%,
			88% {
				--white-shadow: 3.5;
			}
		}

		@keyframes rotate-bg {
			0% {
				--bg-x: 0;
				--bg-y: 0;
			}

			25% {
				--bg-x: 100;
				--bg-y: 0;
			}

			50% {
				--bg-x: 100;
				--bg-y: 100;
			}

			75% {
				--bg-x: 0;
				--bg-y: 100;
			}

			100% {
				--bg-x: 0;
				--bg-y: 0;
			}
		}
		@keyframes rotate {
			from {
				--rotate: -70;
				--glow-translate-y: -65;
			}

			25% {
				--glow-translate-y: -65;
			}

			50% {
				--glow-translate-y: -65;
			}

			60%,
			75% {
				--glow-translate-y: -65;
			}

			85% {
				--glow-translate-y: -65;
			}

			to {
				--rotate: calc(360 - 70);
				--glow-translate-y: -65;
			}
		}
		@keyframes hue-animation {
			0% {
				--hue: 0;
			}
			100% {
				--hue: 360;
			}
		}
	}

	.pyramid-container {
		margin: 0;
		padding: 0;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		perspective: 50vmin;
	}

	.pyramid {
		background: #d8d8d8;
		width: 30vmin;
		height: 30vmin;
		transform: rotateX(34deg) rotateZ(-73deg);
		transform-style: preserve-3d;
		animation: spin 8s linear 0s infinite;

		&:before {
			content: '';
			background: black;
			width: 100%;
			height: 100%;
			position: absolute;
			transform: translateZ(-10vmin);
			box-shadow: 0 0 2vmin 2vmin #000000;
			opacity: 0.15;
		}

		span {
			width: 100%;
			height: 100%;
			position: absolute;
			box-sizing: border-box;
			background-color: #efefef;
			//background-image: url(eye-of-ra.webpp);
			background-image:
				linear-gradient(335deg, #ffffff 6px, transparent 6px),
				linear-gradient(155deg, #ffffff 6px, transparent 6px),
				linear-gradient(335deg, #ffffff 6px, transparent 6px),
				linear-gradient(155deg, #ffffff 6px, transparent 6px);
			background-size: 15px 15px;
			background-position:
				0px 0px,
				1px 8px,
				7px 7px,
				8px 1px;
			opacity: 80%;
			clip-path: polygon(0% 100%, 50% 0%, 100% 100%);

			&:before {
				content: '';
				background: #ffd400;
				width: 100%;
				height: 1.75vmin;
				position: absolute;
			}

			&:nth-child(1) {
				transform: rotateX(-53deg);
				transform-origin: center bottom;
				height: 25vmin;
				bottom: 0;
				filter: brightness(0.875);
			}
			&:nth-child(2) {
				transform: rotateY(53deg) rotateZ(-90deg) translate3d(12.5vmin, -12.5vmin, 0vmin);
				transform-origin: right center;
				height: 25vmin;
				right: 0;
			}

			&:nth-child(3) {
				transform: rotateX(53deg) rotateZ(180deg) translate3d(0vmin, -25vmin, 0vmin);
				transform-origin: center top;
				height: 25vmin;
				top: 0;
				filter: brightness(0.875);
			}

			&:nth-child(4) {
				transform: rotateY(-53deg) rotateZ(90deg) translate3d(-12.5vmin, -12.5vmin, 0vmin);
				transform-origin: left center;
				height: 25vmin;
				left: 0;
			}
		}
	}

	@keyframes spin {
		0% {
			transform: rotateX(65deg) rotateZ(0deg);
		}
		100% {
			transform: rotateX(65deg) rotateZ(360deg);
		}
	}
</style>
