<!--
	@component
	The small HUD line above a title: mono capitals, muted, with the `//` in the text-safe
	viewport-fixed gradient. It may contain links (a breadcrumb).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<p>{@render children()}</p>

<style>
	p {
		margin: 0 0 0.5rem;
		font-family: var(--f-mono);
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--pico-muted-color);
	}
	p::before {
		content: '// ';
		background: var(--fx-text) fixed;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	p :global(a) {
		color: var(--pico-muted-color);
	}
	p :global(a:is(:hover, :focus-visible)) {
		color: var(--c-link-hover);
	}
</style>
