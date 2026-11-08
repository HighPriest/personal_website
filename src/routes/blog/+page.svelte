<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import * as m from '#lib/paraglide/messages.js';
	import Kicker from '#lib/components/Kicker.svelte';
	import PostCard from '#lib/components/blog/PostCard.svelte';
	import PostGrid from '#lib/components/blog/PostGrid.svelte';
	import TagList from '#lib/components/blog/TagList.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// The featured section in the server's order (flagged posts by publication date, then the
	// newest others): one big card, then four smaller ones.
	const posts = $derived(data.posts);
</script>

<Seo title="{m.blog_title()} · Amun" description={m.door_blog_text()} />

<header>
	<Kicker>{m.nav_blog()}</Kicker>
	<h1>{m.blog_title()}</h1>
</header>

<TagList tags={data.tags} />

{#if posts.length}
	<PostCard post={posts[0]} featured />
	<PostGrid>
		{#each posts.slice(1) as post (post.slug)}
			<PostCard {post} />
		{/each}
	</PostGrid>
{:else}
	<p>{m.blog_empty()}</p>
{/if}

<style>
	header {
		padding-top: 1rem;
	}
</style>
