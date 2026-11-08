<!--
	@component
	A YouTube video that loads only when played (as the blog's embeds do, #lib/server/ghost):
	until then a local poster with a play button, a link to the video that works without
	JavaScript. Playing swaps in the player from youtube-nocookie.com and focuses it.
-->
<script lang="ts">
	let {
		id,
		title,
		poster,
		playLabel
	}: {
		/** The YouTube video id. */
		id: string;
		title: string;
		/** A local image, so the page asks YouTube for nothing before a click. */
		poster: string;
		/** The play button's accessible name, e.g. "Play the video (loads from YouTube)". */
		playLabel: string;
	} = $props();

	let playing = $state(false);

	function play(event: MouseEvent) {
		if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
			return; // a new tab or window: the link does that
		}
		event.preventDefault();
		playing = true;
	}

	const focus = (player: HTMLIFrameElement) => player.focus();
</script>

<div class="video">
	{#if playing}
		<iframe
			src="https://www.youtube-nocookie.com/embed/{id}?autoplay=1"
			{title}
			allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
			allowfullscreen
			referrerpolicy="strict-origin-when-cross-origin"
			{@attach focus}
		></iframe>
	{:else}
		<!-- The link's name is its visible text, after a hidden "Play the video…" (label in name,
			WCAG 2.5.3). -->
		<a href="https://www.youtube.com/watch?v={id}" onclick={play}>
			<img src={poster} alt="" width="640" height="480" loading="lazy" decoding="async" />
			<span class="play" aria-hidden="true"></span>
			<span class="title">
				<span class="hidden">{playLabel}:</span>
				{title}
				<small>YouTube</small>
			</span>
		</a>
	{/if}
</div>

<style>
	.video {
		position: relative;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		background: var(--c-bg2);
		clip-path: polygon(
			0 0,
			100% 0,
			100% calc(100% - var(--cut)),
			calc(100% - var(--cut)) 100%,
			0 100%
		);
	}
	iframe,
	a,
	img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border: 0;
	}
	a {
		display: grid;
		place-items: end start;
		color: #f6f7fb;
		text-decoration: none;
	}
	img {
		object-fit: cover;
		transition: transform 0.4s ease-out;
	}
	/* The play mark: a notched neon box with a triangle, centred. */
	.play {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 5rem;
		height: 3.5rem;
		translate: -50% -50%;
		background: var(--c-ink);
		border: 2px solid var(--c-neon-y);
		box-shadow: 0 0 1.25rem color-mix(in srgb, var(--c-neon-y) 45%, transparent);
		transition: box-shadow var(--pico-transition);
	}
	.play::after {
		content: '';
		position: absolute;
		inset: 0;
		margin: auto;
		width: 1.2rem;
		height: 1.4rem;
		background: var(--c-neon-y);
		clip-path: polygon(0 0, 100% 50%, 0 100%);
		translate: 0.15rem 0;
	}
	.title {
		position: relative;
		display: grid;
		gap: 0.15rem;
		width: 100%;
		padding: 3rem 1.25rem 1rem;
		background: linear-gradient(to top, rgb(7 8 13 / 0.9), transparent);
		font-weight: 600;
	}
	/* Read by screen readers, not shown. */
	.hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.title small {
		font-family: var(--f-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		opacity: 0.85;
	}
	a:is(:hover, :focus-visible) .play {
		box-shadow: 0 0 2rem var(--c-neon-y);
	}
	a:focus-visible {
		outline: var(--pico-outline-width) solid var(--c-neon-y);
		outline-offset: -4px;
	}
	@media (prefers-reduced-motion: no-preference) {
		a:hover img {
			transform: scale(1.04);
		}
	}
</style>
