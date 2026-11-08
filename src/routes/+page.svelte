<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import * as m from '#lib/paraglide/messages.js';
	import Kicker from '#lib/components/Kicker.svelte';
	import Antenna from '#lib/components/front/Antenna.svelte';
	import ContactChannels from '#lib/components/front/ContactChannels.svelte';
	import Door from '#lib/components/front/Door.svelte';
	import LogStream from '#lib/components/front/LogStream.svelte';
	import StageMap from '#lib/components/front/StageMap.svelte';

	/** The door opened by a tap on a touch screen (doors reveal themselves on hover otherwise). */
	let opened = $state<string | null>(null);

	/**
	 * Runs in the capture phase, before SvelteKit's router sees the click. On touch screens the
	 * first tap on a door opens it and only a tap on its card follows the link, so an unseen link
	 * is never followed by accident. With a mouse a door is already lit by hover; only the contact
	 * door waits until its buttons are visible.
	 */
	function guardDoors(event: MouseEvent) {
		const target = event.target as Element;
		const door = target.closest<HTMLElement>('[data-door]');
		if (!door) {
			opened = null;
			return;
		}
		if (matchMedia('(hover: none)').matches) {
			if (opened === door.dataset.door && target.closest('[data-card]')) return;
			event.preventDefault();
			opened = door.dataset.door ?? null;
		} else if (door.dataset.door === 'contact') {
			const card = door.querySelector('[data-card]');
			if (card && Number(getComputedStyle(card).opacity) < 0.5) event.preventDefault();
		}
	}
</script>

<Seo title={m.landing_title()} description={m.landing_description()} />

<svelte:document onclickcapture={guardDoors} />

<div class="front-scene">
	<div class="mark">
		<h1><span>Amun</span><span class="ghost" aria-hidden="true">Amun</span></h1>
		<Kicker>{m.front_tagline()}</Kicker>
	</div>

	<Door
		area="tools"
		href={localizeHref('/tools')}
		index="01"
		kicker={m.door_tools_kicker()}
		title={m.door_tools_title()}
		text={m.door_tools_text()}
		cta={m.door_enter()}
		open={opened === 'tools'}
	>
		{#snippet art()}<StageMap />{/snippet}
	</Door>

	<Door
		area="contact"
		index="02"
		kicker={m.door_contact_kicker()}
		title={m.door_contact_title()}
		open={opened === 'contact'}
	>
		{#snippet art()}<Antenna />{/snippet}
		<ContactChannels />
	</Door>

	<Door
		area="blog"
		href={localizeHref('/blog')}
		index="03"
		kicker={m.door_blog_kicker()}
		title={m.door_blog_title()}
		text={m.door_blog_text()}
		cta={m.door_enter()}
		open={opened === 'blog'}
	>
		{#snippet art()}<LogStream />{/snippet}
	</Door>
</div>

<style>
	/* The scene fills the screen edge to edge: no page padding, no footer (root layout). */
	:global(body:has(.front-scene)) {
		padding-bottom: 0;
	}
	:global(body > app > main:has(.front-scene)) {
		padding-block: 0;
	}
	.front-scene {
		position: relative;
		width: 100vw;
		margin: 0 calc(50% - 50vw);
		min-height: 100dvh;
		display: grid;
		grid-template-columns: 1fr 1.15fr 1fr;
		grid-template-rows: 1fr 1fr;
		grid-template-areas:
			'tools mark blog'
			'tools contact blog';
		overflow: hidden;
		isolation: isolate;
	}
	/* A perspective floor rolling towards the viewer, and a horizon glow. */
	.front-scene::before {
		content: '';
		position: absolute;
		inset: 58% -60% -20%;
		z-index: -1;
		--floor: color-mix(in srgb, var(--c-neon-b) 38%, transparent);
		background:
			linear-gradient(var(--floor) 1px, transparent 1px) 0 0 / 4rem 4rem,
			linear-gradient(90deg, var(--floor) 1px, transparent 1px) 0 0 / 4rem 4rem;
		transform: perspective(24rem) rotateX(64deg);
		transform-origin: top;
		mask-image: linear-gradient(transparent, #000 35%);
		animation: floor 2.6s linear infinite;
	}
	@keyframes floor {
		to {
			background-position:
				0 4rem,
				0 4rem;
		}
	}
	.front-scene::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -2;
		background:
			radial-gradient(
				50% 18% at 50% 58%,
				color-mix(in srgb, var(--c-neon-y) 16%, transparent),
				transparent 70%
			),
			radial-gradient(
				70% 40% at 50% 62%,
				color-mix(in srgb, var(--c-neon-b) 14%, transparent),
				transparent 70%
			);
	}
	.mark {
		grid-area: mark;
		align-self: end;
		justify-self: center;
		text-align: center;
		padding: 0 1rem 1.5rem;
		pointer-events: none;
	}
	h1 {
		position: relative;
		margin: 0 auto 0.75rem;
		width: fit-content;
		font-size: clamp(3.25rem, 7vw, 7rem);
		line-height: 0.9;
		letter-spacing: 0.12em;
		text-shadow: 0 0 1.5rem color-mix(in srgb, var(--c-neon-y) 35%, transparent);
	}
	h1::after {
		margin-inline: auto;
		width: 55%;
		height: 0.35rem;
	}
	/* Every few seconds a blue copy of the mark flickers through in slices. */
	.ghost {
		position: absolute;
		inset: 0 auto auto 0;
		color: var(--c-neon-b);
		clip-path: inset(100% 0 0 0);
		animation: glitch 7s steps(1) 0.4s infinite both;
		pointer-events: none;
	}
	@keyframes glitch {
		0% {
			clip-path: inset(12% 0 58% 0);
			transform: translate(-0.05em, 0);
		}
		2% {
			clip-path: inset(62% 0 12% 0);
			transform: translate(0.04em, 0.02em);
		}
		4% {
			clip-path: inset(30% 0 44% 0);
			transform: translate(-0.03em, -0.02em);
		}
		6% {
			clip-path: inset(80% 0 4% 0);
			transform: translate(0.04em, 0);
		}
		8%,
		100% {
			clip-path: inset(100% 0 0 0);
			transform: none;
		}
	}

	/* Phones: the scene fits one screen. The mark on top, the three doors side by side, and the
	   bottom third left to the pyramid and the navigation bar. */
	@media (max-width: 767.98px) {
		.front-scene {
			height: 100dvh;
			min-height: 30rem;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			grid-template-rows: auto minmax(0, 1fr) 33dvh;
			grid-template-areas:
				'mark mark mark'
				'tools contact blog'
				'. . .';
			padding-top: max(1.5rem, env(safe-area-inset-top, 0px));
		}
		.front-scene::before {
			inset: 62% -80% -10%;
		}
		.front-scene::after {
			background:
				radial-gradient(
					60% 14% at 50% 70%,
					color-mix(in srgb, var(--c-neon-y) 16%, transparent),
					transparent 70%
				),
				radial-gradient(
					90% 30% at 50% 74%,
					color-mix(in srgb, var(--c-neon-b) 14%, transparent),
					transparent 70%
				);
		}
		.mark {
			align-self: start;
			padding-bottom: 0;
		}
		h1 {
			font-size: clamp(2.75rem, 16vw, 4rem);
		}
	}
</style>
