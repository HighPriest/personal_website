<!--
	@component
	The contact door's artwork: a broadcasting antenna with pulsing rings and a carrier wave. When
	the door opens (its --open property becomes 1), two beams fan out towards the contact buttons.
	Decorative.
-->
<script lang="ts">
	import { carrierWave } from '#lib/scene.js';

	const wave = carrierWave();
</script>

<svg viewBox="0 0 300 260" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
	<g class="pulse" fill="none" stroke-width="1.5">
		<circle cx="150" cy="112" r="110" stroke="var(--c-neon-b)" />
		<circle cx="150" cy="112" r="110" stroke="var(--c-neon-b)" />
		<circle cx="150" cy="112" r="110" stroke="var(--c-neon-y)" />
		<circle cx="150" cy="112" r="110" stroke="var(--c-neon-b)" />
	</g>
	<path class="beam" d="M150 112 L26 236" fill="none" stroke="var(--c-neon-y)" stroke-width="1.5" />
	<path
		class="beam"
		d="M150 112 L274 236"
		fill="none"
		stroke="var(--c-neon-b)"
		stroke-width="1.5"
	/>
	<path
		d="M150 112v118M150 112l-34 118M150 112l34 118M128 180h44M122 205h56"
		fill="none"
		stroke="var(--c-neon-y)"
		stroke-width="1.5"
	/>
	<circle cx="150" cy="112" r="5" fill="var(--c-neon-y)" />
	<path d={wave} fill="none" stroke="var(--c-neon-b)" stroke-width="1.2" />
</svg>

<style>
	svg {
		width: 100%;
		height: 100%;
	}
	.pulse circle {
		transform-origin: 150px 112px;
		animation: pulse 3.2s ease-out infinite;
	}
	.pulse circle:nth-child(2) {
		animation-delay: 0.8s;
	}
	.pulse circle:nth-child(3) {
		animation-delay: 1.6s;
	}
	.pulse circle:nth-child(4) {
		animation-delay: 2.4s;
	}
	@keyframes pulse {
		from {
			transform: scale(0.2);
			opacity: 1;
		}
		to {
			transform: scale(1);
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.pulse circle {
			opacity: 0.6;
		}
	}
	.beam {
		stroke-dasharray: 4 5;
		opacity: var(--open, 0);
		transition: opacity 0.4s ease-out 0.15s;
	}
</style>
