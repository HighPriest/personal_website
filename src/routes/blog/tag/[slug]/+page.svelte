<script lang="ts">
	import Post from "$lib/components/blog/BlogPostCard.svelte";
	import Header from "$lib/components/blog/Blog-Header.svelte";

	import type { PageData } from "./$types";
	import { page } from "$app/state";
	let { data }: { data: PageData } = $props();
    //const posts = data.posts?.filter(post => post.tags?.some(tag => $page.params.slug === tag));
	const posts = data.posts;

	console.log("Post Browse data: ", data);
</script>

<Header title="{String(page.params.slug.charAt(0).toUpperCase() + String(page.params.slug).slice(1)).replaceAll('-', ' ')}"/>
<section id="posts">
{#each posts ?? [] as post}
	<Post {...post} />
{/each}
</section>

<style>
	#posts {
		display: flex;
		flex-wrap: wrap;
		flex-direction: column;
		justify-content: center;
	}
</style>