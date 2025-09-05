<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { PageData } from './$types';

	import Post from '$lib/components/blog/BlogPostCard.svelte';

	import { trackPageView } from '@lukulent/svelte-umami';
	let { data }: { data: PageData } = $props();

	//const posts = data.posts?.filter(post => post.tags?.some(tag => $page.params.slug === tag));
	const posts = data.posts;

	onMount(() => {
		trackPageView({ url: page.url.pathname });
	});

	$inspect('Post Browse data: ', data);
</script>

<!--
<Header
	title={String(
		page.params.slug.charAt(0).toUpperCase() + String(page.params.slug).slice(1)
	).replaceAll('-', ' ')}
/>
TODO: Bring this back as a Nav view with breadcrumbs
-->
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
