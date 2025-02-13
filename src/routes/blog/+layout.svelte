<script lang="ts">
    import Nav from '$lib/components/navigation/nav.svelte';
    import BlogProfile from '$lib/components/blog/Blog-Profile.svelte';
    //import YoutubeFeed from '$lib/components/youtube-feed/YoutubeFeed.svelte';
    import type { Snippet } from 'svelte';
    let { children, data }: { children: Snippet, data:any } = $props();

    /* --- Dev content --- */
    import { postStore } from '$lib';
    import { Inspect } from 'svelte-inspect-value';
    const dev = import.meta.env.DEV ? {
        postStore,
        Inspect
    } : null;
</script>

{#if dev}
<dev.Inspect value={$postStore} name="testing" />
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
    max-width: 80em;
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

