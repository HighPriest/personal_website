<!--
	@component
	The Virtual CoDriver hero artwork: a car runs a rally stage while the co-driver reads the
	calls. As the car nears each call point, the call shows in a big readout and the voice's
	waveform pulses. Runs only while on screen; a still frame with reduced motion. Decorative:
	the page's text says what it means. With `backdrop`, it drops its frame and fades, to sit behind
	a page's content.
-->
<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import { getLocale, type Locale } from '#lib/paraglide/runtime.js';
	import { rallyStage } from '#lib/scene.js';

	let { backdrop = false }: { backdrop?: boolean } = $props();

	/** The calls along the stage (share of its length), in each language's co-driver words. */
	const CALLS: Record<Locale, string[]> = {
		en: [
			'6 RIGHT',
			'100',
			'4 LEFT TIGHTENS',
			'OVER CREST',
			'HAIRPIN RIGHT',
			'3 LEFT LONG',
			"DON'T CUT",
			'FINISH'
		],
		pl: [
			'6 PRAWY',
			'100',
			'4 LEWY ZACIEŚNIA',
			'NA SZCZYT',
			'SZPILA PRAWA',
			'HAK LEWY',
			'NIE TNIJ',
			'META'
		],
		de: [
			'6 RECHTS',
			'100',
			'4 LINKS ENGER',
			'ÜBER KUPPE',
			'SPITZKEHRE RECHTS',
			'3 LINKS LANG',
			'NICHT SCHNEIDEN',
			'ZIEL'
		]
	};
	const SHARES = [0.06, 0.18, 0.3, 0.42, 0.55, 0.67, 0.8, 0.94];
	/** How long before a call point the co-driver starts reading it (share of the stage). */
	const LEAD = 0.07;
	const LAP_MS = 18000;

	const stage = rallyStage();
	const points = SHARES.map((share) => ({ share, ...stage.pointAt(share) }));
	const calls = $derived(CALLS[getLocale()]);

	// The still frame (and the first frame before the car moves): the third call, being read.
	let current = $state(2);
	let speaking = $state(true);
	let car = $state(stage.pointAt(SHARES[2] - LEAD / 2));

	/** Drives the car while the artwork is on screen, and reads each call as the car nears it. */
	function drive(node: HTMLElement) {
		if (prefersReducedMotion.current) return;
		let frame = 0;
		let started: number | undefined;
		const step = (now: number) => {
			started ??= now;
			const share = ((now - started) / LAP_MS + SHARES[0] - LEAD) % 1;
			car = stage.pointAt(share);
			const next = SHARES.findIndex((point) => point >= share);
			const index = next === -1 ? 0 : next;
			current = index;
			speaking = SHARES[index] - share <= LEAD && SHARES[index] >= share;
			frame = requestAnimationFrame(step);
		};
		const observer = new IntersectionObserver(([entry]) => {
			cancelAnimationFrame(frame);
			if (entry.isIntersecting) frame = requestAnimationFrame(step);
		});
		observer.observe(node);
		return () => {
			observer.disconnect();
			cancelAnimationFrame(frame);
		};
	}

	const BARS = 22;
</script>

<div class={['radio', { backdrop }]} aria-hidden="true" {@attach drive}>
	<div class="hud">
		<p class="label"><span class={['dot', { on: speaking }]}></span>CO-DRIVER · CH 1</p>
		<p class={['call', { speaking }]}>{calls[current]}</p>
	</div>
	<div class={['wave', { speaking }]}>
		{#each { length: BARS }, i (i)}
			<span style:--i={i}></span>
		{/each}
	</div>
	<svg class="stage" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid meet">
		<defs>
			<linearGradient id="codriver-road" x1="0" y1="1" x2="0" y2="0">
				<stop offset="0" stop-color="var(--c-neon-b)" />
				<stop offset="1" stop-color="var(--c-neon-y)" />
			</linearGradient>
		</defs>
		<path
			d={stage.d}
			fill="none"
			stroke="var(--c-neon-b)"
			stroke-width="12"
			stroke-opacity=".18"
			stroke-linecap="round"
		/>
		<path
			d={stage.d}
			fill="none"
			stroke="url(#codriver-road)"
			stroke-width="3"
			stroke-linecap="round"
		/>
		{#each points as point, i (point.share)}
			<circle
				cx={point.x}
				cy={point.y}
				r={i === current ? 6 : 3.5}
				class={['point', { now: i === current }]}
			/>
		{/each}
		<circle cx={car.x} cy={car.y} r="6" class="car" />
	</svg>
</div>

<style>
	/* A HUD screen: the readout at the top, the voice along the bottom, the stage at the right. */
	.radio {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
		grid-template-rows: auto minmax(0, 1fr);
		grid-template-areas: 'hud stage' 'wave stage';
		gap: 1rem 1.5rem;
		aspect-ratio: 4 / 3;
		padding: 1.5rem;
		border: 1px solid var(--c-line);
		background:
			radial-gradient(
				circle at 70% 40%,
				color-mix(in srgb, var(--c-neon-b) 14%, transparent),
				transparent 60%
			),
			var(--c-bg2);
		clip-path: polygon(
			0 0,
			100% 0,
			100% calc(100% - var(--cut)),
			calc(100% - var(--cut)) 100%,
			0 100%
		);
	}
	.hud {
		grid-area: hud;
		display: grid;
		gap: 0.75rem;
		min-width: 0;
	}
	.label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		color: var(--c-muted);
		font-family: var(--f-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.12em;
	}
	.dot {
		width: 0.55rem;
		height: 0.55rem;
		border-radius: 50%;
		background: var(--c-line);
	}
	.dot.on {
		background: var(--c-neon-y);
		box-shadow: 0 0 0.6rem var(--c-neon-y);
	}
	/* The call being read: big, in the viewport-fixed gradient. */
	.call {
		min-height: 2.4em;
		margin: 0;
		font-family: var(--f-display);
		font-size: clamp(1.4rem, 3.2vw, 2.4rem);
		font-weight: 700;
		line-height: 1.1;
		background: var(--fx-text) fixed;
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
		opacity: 0.7;
		transition: opacity 0.2s;
	}
	.call.speaking {
		opacity: 1;
	}
	/* The voice: tall bars along the bottom; a quiet shape between calls, moving while reading. */
	.wave {
		grid-area: wave;
		align-self: end;
		display: flex;
		align-items: center;
		gap: 5px;
		height: min(9rem, 100%);
	}
	.wave span {
		flex: 1;
		height: 100%;
		background: var(--fx) fixed;
		border-radius: 2px;
		opacity: 0.85;
		transform: scaleY(calc(0.12 + 0.25 * sin(var(--i) * 0.7) * sin(var(--i) * 0.7)));
		transition: transform 0.3s;
	}
	/* While reading, the bars move like a voice (still, at a spoken shape, with reduced motion). */
	.wave.speaking span {
		transform: scaleY(calc(0.25 + 0.7 * sin(var(--i) * 0.5) * sin(var(--i) * 0.5)));
	}
	@media (prefers-reduced-motion: no-preference) {
		.wave.speaking span {
			animation: talk 0.42s ease-in-out infinite alternate;
			animation-delay: calc(var(--i) * -53ms);
		}
	}
	@keyframes talk {
		from {
			transform: scaleY(0.15);
		}
		to {
			transform: scaleY(calc(0.35 + 0.65 * sin(var(--i) * 1.7) * sin(var(--i) * 1.7)));
		}
	}
	.stage {
		grid-area: stage;
		width: 100%;
		height: 100%;
	}
	.point {
		fill: var(--c-bg2);
		stroke: var(--c-neon-b);
		stroke-width: 1.5;
	}
	.point.now {
		stroke: var(--c-neon-y);
		stroke-width: 2.5;
	}
	.car {
		fill: var(--c-neon-y);
		filter: drop-shadow(0 0 4px var(--c-neon-y));
	}
	@media (max-width: 30rem) {
		.radio {
			padding: 1rem;
			gap: 0.75rem 1rem;
		}
	}

	/* Behind a page: no frame or panel, larger and faint. The readout and the voice sit low, along
	   the bottom of the screen, and the stage runs up the right side, clear of the page's heading. */
	.backdrop {
		width: 100%;
		height: 100%;
		aspect-ratio: auto;
		grid-template-rows: minmax(0, 1fr) auto auto;
		grid-template-areas: '. stage' 'hud stage' 'wave stage';
		padding: clamp(1.5rem, 5vw, 4rem);
		padding-bottom: 6rem;
		border: 0;
		background: none;
		clip-path: none;
		opacity: 0.12;
	}
	.backdrop .label {
		display: none;
	}
	.backdrop .call {
		font-size: clamp(2.5rem, 7vw, 6rem);
	}
	.backdrop .wave {
		height: min(16rem, 100%);
	}
</style>
