<script lang="ts">
    import Nav from '$lib/components/navigation/nav.svelte';
    import BlogProfile from '$lib/components/blog/Blog-Profile.svelte';
    //import YoutubeFeed from '$lib/components/youtube-feed/YoutubeFeed.svelte';
    import type { Snippet } from 'svelte';
    let { children}: { children: Snippet } = $props();
</script>

<main id="blog">
    {@render children()}
</main>
<Nav />

<style lang="scss">
main {
    display: grid;
    grid-auto-rows: max-content;
    overflow: auto;
    max-width: 80em;
    padding: 6rem 2rem;
    margin-right: 2rem;
    backdrop-filter: blur(2px);
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}

@media (pointer: coarse) {
    main {
        padding: 6rem auto;
        margin: 0 auto;
    }
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

