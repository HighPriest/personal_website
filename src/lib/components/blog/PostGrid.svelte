<!--
	@component
	The responsive grid of post cards (columns of at least 17 rem, one column on phones).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div>{@render children()}</div>

<style>
	div {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
		gap: 1.25rem;
	}
</style>
