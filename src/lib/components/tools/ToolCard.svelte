<!--
	@component
	A tool on the tools hub: a HUD line on top (two tags), the title, the
	purpose, an example callout, and the action at the bottom. The action link stretches over the
	whole card, so a click anywhere on it follows the link; keyboards and screen readers still meet
	one link, named by its own text.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		tags,
		title,
		text,
		callout,
		actions
	}: {
		tags: [string, string];
		title: string;
		text: string;
		callout: Snippet;
		actions: Snippet;
	} = $props();
</script>

<article>
	<header>
		<span>{tags[0]}</span>
		<span>{tags[1]}</span>
	</header>
	<h2>{title}</h2>
	<p>{text}</p>
	<p class="callout">{@render callout()}</p>
	<footer>{@render actions()}</footer>
</article>

<style>
	article {
		position: relative;
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		min-width: 0;
		margin: 0;
		transition:
			box-shadow var(--pico-transition),
			transform 0.25s ease-out;
	}
	@media (prefers-reduced-motion: no-preference) {
		article:hover {
			transform: translateY(-4px);
		}
	}
	/* The action covers the card (one link per card). */
	footer :global(a)::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 1;
	}
	/* The two tags on one line where there's clearly room, one above the other on narrow screens:
	   a line that only just fits would wrap or not depending on the font, so it would jump when
	   the HUD font arrives. */
	header {
		display: flex;
		flex-direction: column;
		gap: 0.15rem 0.5rem;
		font-family: var(--f-mono);
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--pico-muted-color);
	}
	h2 {
		font-size: 1.5rem;
		margin: 0.25rem 0 0.75rem;
	}
	h2::after {
		display: none;
	}
	.callout {
		font-family: var(--f-mono);
		font-size: 0.9rem;
		color: var(--c-text);
		border: 1px dashed var(--c-line);
		padding: 0.6rem 0.8rem;
		margin-bottom: 1rem;
	}
	.callout :global(b) {
		color: var(--c-head);
	}
	footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
		margin-top: auto;
	}
	footer :global([role='button']) {
		margin: 0;
	}
	@container (min-width: 30rem) {
		header {
			flex-direction: row;
			justify-content: space-between;
		}
	}
</style>
