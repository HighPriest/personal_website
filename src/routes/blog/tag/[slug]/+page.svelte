<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import * as m from '#lib/paraglide/messages.js';
	import Kicker from '#lib/components/Kicker.svelte';
	import PostCard from '#lib/components/blog/PostCard.svelte';
	import PostGrid from '#lib/components/blog/PostGrid.svelte';
	import TagList from '#lib/components/blog/TagList.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const name = $derived(data.tag.name);
</script>

<Seo title="{name} · {m.blog_title()} · Amun" description={m.blog_tag_description({ tag: name })} />

<header>
	<Kicker><a href={localizeHref('/blog')}>{m.nav_blog()}</a> / {name}</Kicker>
	<h1>{name}</h1>
</header>

<TagList tags={data.tags} current={data.tag.slug} />

{#if data.posts.length}
	<PostGrid>
		{#each data.posts as post (post.slug)}
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
