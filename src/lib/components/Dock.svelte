<!--
	@component
	The site navigation, at the bottom of the screen.
	Desktop: a floating console in the bottom-right corner whose top edge fills as the page
	scrolls. Under 768 px: a full-width bar of icon buttons. The current area is marked with
	aria-current; the language menu sits after a separator. On the front page, with a mouse, the
	dock waits below the screen edge until the pointer comes near the bottom or the pyramid's
	corner, or focus enters it, so the front page stays a bare scene.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { deLocalizeHref, localizeHref } from '#lib/paraglide/runtime.js';
	import * as m from '#lib/paraglide/messages.js';
	import LangSwitcher from './LangSwitcher.svelte';

	type Area = 'home' | 'blog' | 'tools';

	const path = $derived(deLocalizeHref(page.url.pathname));
	const current = $derived<Area | null>(
		path === '/'
			? 'home'
			: path.startsWith('/blog')
				? 'blog'
				: path.startsWith('/tools')
					? 'tools'
					: null
	);

	const links: { area: Area; href: string; label: () => string; icon: string }[] = [
		{ area: 'home', href: '/', label: m.nav_home, icon: 'M12 3 21.5 20h-19Z M7.6 15h8.8' },
		{
			area: 'blog',
			href: '/blog',
			label: m.nav_blog,
			icon: 'M5 3h10l4 4v14H5Z M14 3v5h5 M8.5 12h7 M8.5 16h7'
		},
		{
			area: 'tools',
			href: '/tools',
			label: m.nav_simracing,
			// A steering wheel: rim, hub and three spokes.
			icon: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0 M9.5 12a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0 M3 12h6.5 M14.5 12H21 M12 14.5V21'
		}
	];

	// Front page, mouse only: the pointer is near the bottom edge, or in the bottom-right corner
	// where the pyramid stands above the dock.
	let near = $state(false);
	function track(event: PointerEvent) {
		if (event.pointerType !== 'mouse') return;
		const fromBottom = innerHeight - event.clientY;
		near = fromBottom < 110 || (fromBottom < 300 && innerWidth - event.clientX < 380);
	}
</script>

<svelte:window onpointermove={track} />

<nav class={['dock', { waiting: current === 'home' && !near }]} aria-label={m.nav_label()}>
	<ul>
		{#each links as link (link.area)}
			<li>
				<a href={localizeHref(link.href)} aria-current={current === link.area ? 'page' : undefined}>
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d={link.icon} /></svg>
					<span>{link.label()}</span>
				</a>
			</li>
		{/each}
	</ul>
	<span class="separator" aria-hidden="true"></span>
	<LangSwitcher />
</nav>

<style>
	.dock {
		position: fixed;
		z-index: 15;
		right: max(1.5rem, env(safe-area-inset-right, 0px));
		bottom: max(1.25rem, env(safe-area-inset-bottom, 0px));
		display: flex;
		align-items: stretch;
		margin: 0;
		padding: 0.4rem 0.6rem 0.3rem 1.9rem;
		transition:
			transform 0.35s ease-out,
			opacity 0.35s ease-out;
		/* Stays put while the page underneath cross-fades. */
		view-transition-name: dock;
	}
	@media (hover: hover) and (min-width: 768px) {
		.dock.waiting:not(:focus-within) {
			transform: translateY(calc(100% + 2rem));
			opacity: 0;
		}
	}
	.separator {
		width: 1px;
		margin: 0.5rem 0.4rem;
		background: var(--c-line);
	}
	/* The angled panel is painted by ::before, so nothing inside the dock is clipped. */
	.dock::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background:
			linear-gradient(var(--c-line), var(--c-line)) top / 100% 1px no-repeat,
			color-mix(in srgb, var(--c-bg2) 84%, transparent);
		backdrop-filter: blur(10px);
		clip-path: polygon(
			1.4rem 0,
			100% 0,
			100% calc(100% - 0.7rem),
			calc(100% - 0.7rem) 100%,
			0 100%
		);
		box-shadow: 0 0 2.5rem color-mix(in srgb, var(--c-neon-b) 18%, transparent);
	}
	/* The top edge fills with the page's scroll position (a full line where scroll-driven
	   animations aren't supported, and with reduced motion). */
	.dock::after {
		content: '';
		position: absolute;
		left: 1.4rem;
		right: 0;
		top: 0;
		height: 2px;
		background: var(--fx-h);
		box-shadow: 0 0 0.6rem color-mix(in srgb, var(--c-neon-b) 70%, transparent);
		transform-origin: left;
		animation: progress linear both;
		animation-timeline: scroll(root);
	}
	@keyframes progress {
		from {
			transform: scaleX(0.04);
		}
		to {
			transform: scaleX(1);
		}
	}
	/* Pico's class-less nav styles (spacing, negative margins) are reset here. */
	.dock ul {
		display: flex;
		align-items: stretch;
		gap: 0.25rem;
		margin: 0;
		padding: 0;
	}
	.dock li {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.dock a {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.3rem;
		min-width: 4.5rem;
		margin: 0;
		padding: 0.45rem 0.7rem 0.4rem;
		font-family: var(--f-mono);
		font-size: 0.625rem;
		font-weight: 600;
		line-height: 1;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--c-muted);
		text-decoration: none;
	}
	.dock svg {
		width: 1.2rem;
		height: 1.2rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.6;
		stroke-linejoin: round;
		stroke-linecap: round;
		transition:
			transform var(--pico-transition),
			filter var(--pico-transition);
	}
	.dock a:is(:hover, :focus-visible) {
		color: var(--c-text);
	}
	.dock a:is(:hover, :focus-visible) svg {
		stroke: var(--c-neon-y);
		filter: drop-shadow(0 0 0.35rem var(--c-neon-y));
		transform: translateY(-2px);
	}
	.dock a[aria-current='page'] {
		color: var(--c-head);
	}
	.dock a[aria-current='page'] svg {
		stroke: var(--c-neon-y);
	}
	.dock a[aria-current='page']::after {
		content: '';
		position: absolute;
		left: 32%;
		right: 32%;
		bottom: 0;
		height: 2px;
		background: var(--fx-h);
		box-shadow: 0 0 0.5rem color-mix(in srgb, var(--c-neon-y) 70%, transparent);
	}

	/* Phones: a full-width bar of equal buttons, like the old blog's bottom bar. */
	@media (max-width: 767.98px) {
		.dock {
			left: max(16px, env(safe-area-inset-left, 0px));
			right: max(16px, env(safe-area-inset-right, 0px));
			bottom: max(0.75rem, env(safe-area-inset-bottom, 0px));
			padding: 0.3rem;
		}
		.dock::before {
			clip-path: polygon(
				0.9rem 0,
				100% 0,
				100% calc(100% - 0.9rem),
				calc(100% - 0.9rem) 100%,
				0 100%,
				0 0.9rem
			);
		}
		.dock::after {
			left: 0.9rem;
		}
		.dock ul {
			flex: 3;
			gap: 0;
		}
		/* The language menu takes the fourth equal share of the bar. */
		.dock li,
		.dock :global(details) {
			flex: 1;
		}
		.separator {
			display: none;
		}
		.dock a {
			min-width: 0;
			min-height: 3.5rem;
			padding: 0.5rem 0.25rem;
			font-size: 0.6875rem;
			letter-spacing: 0.1em;
		}
		.dock svg {
			width: 1.35rem;
			height: 1.35rem;
		}
	}
</style>
