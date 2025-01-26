<script lang="ts">
    import Nav from '$lib/components/navigation/nav.svelte';
    import type { Snippet } from 'svelte';
    let { children}: { children: Snippet } = $props();

</script>
<main id="tool">
    {@render children()}
</main>
<Nav />