<script lang="ts">
	import { page } from "$app/stores";
	import Post from "$lib/components/blog/BlogPostCard.svelte";
	import Header from "$lib/components/blog/Blog-Header.svelte";

	import type { PageData } from "./$types";
	let { data }: { data: PageData } = $props();
    //const posts = data.posts?.filter(post => post.tags?.some(tag => $page.params.slug === tag));
	const posts = data.posts;

	console.log("Post Browse data: ", data);
</script>

<Header />
<h1>Posts</h1>
<section id="posts">
{#each posts ?? [] as post}
	<Post {...post} />
{/each}
</section>

<style>
	h1 {
		text-align: center;
		font-weight: bold;
		font-style: oblique;
		font-size: 3em;
		margin: 0 10em;
		padding: 1em;
	}
	#posts {
		display: flex;
		flex-wrap: wrap;
		flex-direction: column;
		justify-content: center;
	}
</style>