<!--
	@component
	The blog door's artwork: a log screen whose text bars scroll upward in a loop (two copies of
	the same block). Decorative.
-->
<script lang="ts">
	import { logBars } from '#lib/scene.js';

	const bars = logBars();
	const stroke = { yellow: 'var(--c-neon-y)', blue: 'var(--c-neon-b)', muted: 'var(--c-muted)' };
</script>

<svg viewBox="0 0 240 360" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
	<defs><clipPath id="log-screen"><rect x="34" y="40" width="172" height="272" /></clipPath></defs>
	<path
		d="M24 30h176l16 16v280H40l-16-16Z"
		fill="none"
		stroke="var(--c-neon-y)"
		stroke-width="1.5"
	/>
	<path
		d="M14 20h40M14 20v40M226 340h-40M226 340v-40"
		fill="none"
		stroke="var(--c-neon-b)"
		stroke-width="1.5"
	/>
	<g clip-path="url(#log-screen)">
		<g class="rows">
			{#each [0, 336] as offset (offset)}
				{#each bars as bar, i (i)}
					<path
						d="M{bar.x.toFixed(1)} {bar.y + offset}h{bar.w.toFixed(1)}"
						stroke={stroke[bar.tone]}
						stroke-width="4"
					/>
				{/each}
			{/each}
		</g>
	</g>
	<text x="34" y="334">LOG_STREAM // 0x2F8C</text>
</svg>

<style>
	svg {
		width: 100%;
		height: 100%;
	}
	text {
		fill: var(--c-muted);
		font-family: var(--f-mono);
		font-size: 9px;
		letter-spacing: 0.08em;
	}
	.rows {
		animation: rise 14s linear infinite;
	}
	@keyframes rise {
		to {
			transform: translateY(-336px);
		}
	}
</style>
