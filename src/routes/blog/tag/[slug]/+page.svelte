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

<Header title="Posts"/>
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