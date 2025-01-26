<script lang="ts">
    import Nav from '$lib/components/navigation/nav.svelte';
    import type { Snippet } from 'svelte';
    let { children}: { children: Snippet } = $props();

</script>

<aside>
    <h1>SimRacing</h1>
    <ul>
        <li><a href="/tools/virtual-codriver">Virtual coDriver</a></li>
    </ul>
    <h1>Programming</h1>
    <ul>
        <li><a href="/tools/virtual-codriver-installer">Content installer</a></li>
    </ul>
</aside>

<main id="tool">
    {@render children()}
</main>
<Nav />