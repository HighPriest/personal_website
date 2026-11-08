<!--
	@component
	A hidden door on the front page: a large area over a piece of artwork that
	lights up and shows its card on hover or keyboard focus, or when `open` (set by the page after a
	first tap on touch screens). A door with `href` is one big link; without it, it's a group whose
	card holds its own controls (the contact door). While revealed, the door sets --open: 1 for its
	children (the antenna's beams, the contact buttons).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';

	let {
		area,
		href,
		index,
		kicker,
		title,
		text,
		cta,
		open = false,
		art,
		children
	}: {
		/** The grid area in the scene, also the door's name. */
		area: 'blog' | 'tools' | 'contact';
		href?: string;
		index: string;
		kicker: string;
		title: string;
		text?: string;
		cta?: string;
		open?: boolean;
		art: Snippet;
		children?: Snippet;
	} = $props();

	const glyphs = '01<>/\\[]{}#$%&*+=?ABCDEFXYZ';
	let noise = $state('');
	let timer: ReturnType<typeof setInterval> | undefined;

	/** The visible title decodes from random glyphs (the accessible title never changes). */
	function decode() {
		if (prefersReducedMotion.current) return;
		clearInterval(timer);
		let frame = 0;
		timer = setInterval(() => {
			frame++;
			const settled = Math.floor((frame / 14) * title.length);
			noise = [...title]
				.map((ch, i) => (i < settled ? ch : glyphs[Math.floor(Math.random() * glyphs.length)]))
				.join('');
			if (frame >= 14) {
				clearInterval(timer);
				noise = '';
			}
		}, 35);
	}

	/** Decodes the title when a mouse enters the door, a finger taps it open, or focus arrives. */
	function decodeOnArrival(door: HTMLElement) {
		const onEnter = (event: PointerEvent) => event.pointerType === 'mouse' && decode();
		const onTap = (event: PointerEvent) => event.pointerType !== 'mouse' && !open && decode();
		door.addEventListener('pointerenter', onEnter);
		door.addEventListener('pointerdown', onTap);
		door.addEventListener('focusin', decode);
		return () => {
			door.removeEventListener('pointerenter', onEnter);
			door.removeEventListener('pointerdown', onTap);
			door.removeEventListener('focusin', decode);
			clearInterval(timer);
		};
	}
</script>

<svelte:element
	this={href ? 'a' : 'div'}
	{href}
	role={href ? undefined : 'group'}
	aria-labelledby={href ? undefined : `door-${area}-title`}
	class={['door', area, { open }]}
	data-door={area}
	{@attach decodeOnArrival}
>
	<span class="art">{@render art()}</span>
	<span class="card" data-card>
		<span class="kicker" aria-hidden="true">{index} // {kicker}</span>
		<span class="title" id="door-{area}-title">
			<span class="plain">{title}</span>
			<span aria-hidden="true">{noise || title}</span>
		</span>
		{#if text}<span class="text">{text}</span>{/if}
		{@render children?.()}
		{#if cta}<span class="cta" aria-hidden="true">{cta} ▸</span>{/if}
	</span>
</svelte:element>

<style>
	.door {
		--open: 0;
		position: relative;
		display: grid;
		place-items: center;
		min-height: 15rem;
		padding: 1.5rem;
		color: var(--c-text);
		text-decoration: none;
		outline-offset: -0.75rem;
	}
	.door:focus-visible {
		outline: 2px solid var(--c-neon-b);
		box-shadow: none;
	}
	.blog {
		grid-area: blog;
	}
	.tools {
		grid-area: tools;
	}
	.contact {
		grid-area: contact;
		cursor: default;
	}
	/* Revealed: hover (mouse), keyboard focus, focus inside (the contact buttons), or opened by
	   a tap. */
	.door:is(:hover, :focus-visible, :focus-within, .open) {
		--open: 1;
	}
	.art {
		position: absolute;
		inset: 6%;
		opacity: calc(0.3 + 0.7 * var(--open));
		transition:
			opacity 0.4s ease-out,
			filter 0.4s ease-out;
	}
	.door:is(:hover, :focus-visible, :focus-within, .open) .art {
		filter: drop-shadow(0 0 0.4rem color-mix(in srgb, var(--c-neon-b) 70%, transparent));
	}
	/* Corner brackets, cut from the viewport-fixed gradient. */
	.door::before,
	.door::after {
		content: '';
		position: absolute;
		width: 1.75rem;
		height: 1.75rem;
		background: var(--fx) fixed;
		opacity: var(--open);
		transition: opacity 0.3s ease-out;
	}
	.door::before {
		top: 2rem;
		left: 2rem;
		clip-path: polygon(0 0, 100% 0, 100% 3px, 3px 3px, 3px 100%, 0 100%);
	}
	.door::after {
		right: 2rem;
		bottom: 2rem;
		clip-path: polygon(
			calc(100% - 3px) 0,
			100% 0,
			100% 100%,
			0 100%,
			0 calc(100% - 3px),
			calc(100% - 3px) calc(100% - 3px)
		);
	}
	.card {
		position: relative;
		display: grid;
		justify-items: center;
		gap: 0.35rem;
		padding: 1rem 1.5rem 1.1rem;
		text-align: center;
		background: color-mix(in srgb, var(--c-bg) 86%, transparent);
		border: 1px solid var(--c-line);
		opacity: var(--open);
		transform: translateY(calc((1 - var(--open)) * 0.5rem));
		/* A hidden card must not catch the pointer: on phones it overlaps the next column. */
		pointer-events: none;
		transition:
			opacity 0.3s ease-out,
			transform 0.3s ease-out;
	}
	.door:is(:hover, :focus-visible, :focus-within, .open) .card {
		pointer-events: auto;
	}
	.kicker {
		font-family: var(--f-mono);
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--c-muted);
	}
	.title {
		display: grid;
		font-family: var(--f-display);
		font-size: clamp(1.5rem, 2.4vw, 2.1rem);
		font-weight: 700;
		line-height: 1;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--c-head);
	}
	/* Both copies share one cell: the plain title sizes it and is what assistive technology
	   reads; the visible copy decodes. */
	.title > span {
		grid-area: 1 / 1;
	}
	.plain {
		opacity: 0;
	}
	.text {
		color: var(--c-text);
		font-size: 0.95rem;
	}
	.cta {
		margin-top: 0.35rem;
		font-family: var(--f-mono);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--c-link);
	}

	/* Phones: the doors stand side by side, and the card is wider than its column, so it
	   floats over the neighbours. */
	@media (max-width: 767.98px) {
		.door {
			min-height: 0;
			padding: 0.5rem;
		}
		.art {
			inset: 4%;
		}
		.door::before {
			top: 0.5rem;
			left: 0.5rem;
		}
		.door::after {
			right: 0.5rem;
			bottom: 0.5rem;
		}
		.card {
			position: absolute;
			z-index: 2;
			top: 50%;
			width: min(15rem, calc(100vw - 2rem));
			translate: 0 -50%;
		}
		.tools .card {
			left: 0.25rem;
		}
		.contact .card {
			left: 50%;
			translate: -50% -50%;
		}
		.blog .card {
			right: 0.25rem;
		}
	}
</style>
