<script lang="ts">
    import Nav from '$lib/components/navigation/nav.svelte';
    //import YoutubeFeed from '$lib/components/youtube-feed/YoutubeFeed.svelte';
    import type { Snippet } from 'svelte';
    let { children, data }: { children: Snippet, data:any } = $props();

    /* --- Dev content --- */
    import { postStore } from '$lib';
    import { Inspect } from 'svelte-inspect-value';
	import { getLocale } from '$lib/paraglide/runtime';
    const dev = import.meta.env.DEV ? {
        postStore,
        Inspect,
        getLocale
    } : null;
</script>

{#if dev}
<dev.Inspect value={$postStore} name="testing" style="position: fixed; bottom: 0; z-index: 10;"/>
<dev.Inspect value={getLocale()} name="Locale" />
{/if}
<main id="blog">
    {@render children()}
</main>
<Nav />

<style lang="scss">
main {
    display: grid;
    grid-auto-columns: 100%;
    overflow: auto;
    max-width: 100lvw;
    width: 80em;
    padding: 6rem 2rem;
    margin-right: 2rem;
    backdrop-filter: blur(2px);
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}

@media (orientation: portrait) {
    :global(#image-trim) {
        display: none;
    }

    main {
        padding: unset;
        margin: unset;
        width: 100%;
    }
    :global(.tag, .post) {
        margin: 1rem !important;
        min-width: 15rem !important; /* TODO: Give it rem units */
        flex: 1 1 15rem !important;
    }
}

</style>

