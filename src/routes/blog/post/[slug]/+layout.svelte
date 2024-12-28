<script lang="ts">
	import type { LayoutData } from "./$types";
	import type { Snippet } from 'svelte';
	let { data, children }: { data: LayoutData, children: Snippet } = $props();
</script>

<article>
	{@render children()}
</article>

<style>

article {
	min-width: 20ch;
	max-width: 80ch;
	color: white;
}
</style>