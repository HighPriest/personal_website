<!--
	@component
	The original front page's spinning CSS pyramid (after Josetxu's pen), in the Neon night
	colours. It stands above the navigation dock: always on the front page, and
	as the loading sign elsewhere while a navigation takes a moment. Every length is in --u, a
	thirtieth of the base, so the whole model scales from --s. Decorative: hidden from assistive
	technology.
-->
<script lang="ts">
	let {
		shown,
		loading = false,
		halo = false
	}: {
		/** Visible: on the front page, or while loading. */
		shown: boolean;
		/** Spin fast, as the loading sign. */
		loading?: boolean;
		/** A soft backing in the page colour, for when it floats over page content. */
		halo?: boolean;
	} = $props();
</script>

<div class={['pyr', { shown, loading, halo }]} aria-hidden="true">
	<div class="pyramid"><span></span><span></span><span></span><span></span></div>
</div>

<style>
	.pyr {
		--s: 5.5rem;
		--u: calc(var(--s) / 30);
		--face: #1b2030;
		--face-glow: color-mix(in srgb, var(--c-neon-b) 22%, transparent);
		position: fixed;
		z-index: 14;
		right: calc(max(1.5rem, env(safe-area-inset-right, 0px)) + 6.5rem);
		bottom: calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + 3.75rem);
		width: calc(var(--s) * 1.5);
		height: calc(var(--s) * 1.5);
		display: grid;
		place-items: center;
		perspective: calc(var(--u) * 50);
		pointer-events: none;
		opacity: 0;
		transform: translateY(0.75rem) scale(0.9);
		transition:
			opacity 0.35s ease-out,
			transform 0.35s ease-out;
		view-transition-name: pyramid;
	}
	:global(:root[data-theme='light']) .pyr {
		--face: #eef0f6;
		--face-glow: color-mix(in srgb, var(--c-neon-b) 12%, transparent);
	}
	@media (prefers-color-scheme: light) {
		:global(:root:not([data-theme='dark'])) .pyr {
			--face: #eef0f6;
			--face-glow: color-mix(in srgb, var(--c-neon-b) 12%, transparent);
		}
	}
	.pyr.shown {
		opacity: 1;
		transform: none;
	}
	.pyr.halo::before {
		content: '';
		position: absolute;
		inset: -20%;
		z-index: -1;
		background: radial-gradient(
			closest-side,
			color-mix(in srgb, var(--c-bg) 88%, transparent),
			transparent
		);
	}
	.pyramid {
		position: relative;
		width: var(--s);
		height: var(--s);
		transform-style: preserve-3d;
		transform: rotateX(65deg) rotateZ(-35deg);
		animation: spin 8s linear infinite;
	}
	.loading .pyramid {
		animation-duration: 1.6s;
	}
	/* Glow on the ground below the base. */
	.pyramid::before {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--c-neon-b);
		transform: translateZ(calc(var(--u) * -10));
		box-shadow: 0 0 calc(var(--u) * 6) calc(var(--u) * 3) var(--c-neon-b);
		opacity: 0.22;
	}
	.pyramid span {
		position: absolute;
		width: 100%;
		height: calc(var(--u) * 25);
		box-sizing: border-box;
		background: linear-gradient(to top, var(--face-glow), transparent 60%) var(--face);
		clip-path: polygon(0% 100%, 50% 0%, 100% 100%);
		opacity: 0.9;
	}
	/* The capstone. */
	.pyramid span::before {
		content: '';
		position: absolute;
		width: 100%;
		height: calc(var(--u) * 3.5);
		background: var(--c-neon-y);
		box-shadow: 0 0 calc(var(--u) * 2) var(--c-neon-y);
	}
	.pyramid span:nth-child(1) {
		transform: rotateX(-53deg);
		transform-origin: center bottom;
		bottom: 0;
		filter: brightness(0.62);
	}
	.pyramid span:nth-child(2) {
		transform: rotateY(53deg) rotateZ(-90deg)
			translate3d(calc(var(--u) * 12.5), calc(var(--u) * -12.5), 0);
		transform-origin: right center;
		right: 0;
	}
	.pyramid span:nth-child(3) {
		transform: rotateX(53deg) rotateZ(180deg) translate3d(0, calc(var(--u) * -25), 0);
		transform-origin: center top;
		top: 0;
		filter: brightness(0.62);
	}
	.pyramid span:nth-child(4) {
		transform: rotateY(-53deg) rotateZ(90deg)
			translate3d(calc(var(--u) * -12.5), calc(var(--u) * -12.5), 0);
		transform-origin: left center;
		left: 0;
	}
	@keyframes spin {
		from {
			transform: rotateX(65deg) rotateZ(-35deg);
		}
		to {
			transform: rotateX(65deg) rotateZ(325deg);
		}
	}

	/* Phones: centred in the bottom third, above the navigation bar. */
	@media (max-width: 767.98px) {
		.pyr {
			--s: min(17dvh, 40vw);
			right: auto;
			left: 50%;
			translate: -50% 0;
			bottom: calc(max(0.75rem, env(safe-area-inset-bottom, 0px)) + 4.5rem);
		}
	}
</style>
