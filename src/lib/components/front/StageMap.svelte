<!--
	@component
	The simracing door's artwork: a winding rally stage with pacenote calls along it and a car
	running the stage. The car stands still with reduced motion. Decorative.
-->
<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import { rallyStage } from '#lib/scene.js';

	const stage = rallyStage();
	const calls = (
		[
			[0.08, '6 R'],
			[0.22, '4 L TIGHTENS'],
			[0.38, 'CREST'],
			[0.52, 'KEEP L'],
			[0.67, '3 R LONG'],
			[0.82, "DON'T CUT"],
			[0.96, 'FINISH']
		] as const
	).map(([share, call]) => {
		const point = stage.pointAt(share);
		return { ...point, call, right: point.x < 170 };
	});
	const start = stage.pointAt(0.3);

	/** Drives the car along the stage, one lap every 16 s. */
	function drive(car: SVGCircleElement) {
		if (prefersReducedMotion.current) return;
		let frame = requestAnimationFrame(function step(now) {
			const point = stage.pointAt((now / 16000) % 1);
			car.setAttribute('cx', point.x.toFixed(1));
			car.setAttribute('cy', point.y.toFixed(1));
			frame = requestAnimationFrame(step);
		});
		return () => cancelAnimationFrame(frame);
	}
</script>

<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
	<path
		d="M10 10h40M10 10v40M290 390h-40M290 390v-40"
		fill="none"
		stroke="var(--c-muted)"
		stroke-width="1"
	/>
	<path
		d={stage.d}
		fill="none"
		stroke="var(--c-neon-b)"
		stroke-width="9"
		stroke-opacity=".25"
		stroke-linecap="round"
	/>
	<path
		d={stage.d}
		fill="none"
		stroke="var(--c-neon-y)"
		stroke-width="2.5"
		stroke-linecap="round"
	/>
	{#each calls as note (note.call)}
		<circle
			cx={note.x}
			cy={note.y}
			r="3.5"
			fill="none"
			stroke="var(--c-neon-b)"
			stroke-width="1.5"
		/>
		<path d="M{note.x} {note.y}h{note.right ? 14 : -14}" stroke="var(--c-muted)" stroke-width="1" />
		<text
			x={note.x + (note.right ? 18 : -18)}
			y={note.y + 3}
			text-anchor={note.right ? 'start' : 'end'}>{note.call}</text
		>
	{/each}
	<circle cx={start.x} cy={start.y} r="5" fill="var(--c-neon-y)" {@attach drive} />
	<text x="18" y="384">SS4 · 12.4 KM · GRAVEL</text>
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
</style>
