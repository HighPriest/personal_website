<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import * as m from '#lib/paraglide/messages.js';
	import Kicker from '#lib/components/Kicker.svelte';
	import PostMeta from '#lib/components/blog/PostMeta.svelte';
	import '#lib/components/blog/koenig-cards.css';
	import { postContent } from '#lib/blog/post-content.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const post = $derived(data.post);
</script>

{#if post}
	<Seo title="{post.title} · Amun" description={post.excerpt} {post} />
	<article {@attach postContent}>
		<header>
			<Kicker>
				<a href={localizeHref('/blog')}>{m.nav_blog()}</a>
				{#each post.tags as tag (tag.slug)}
					/ <a href={localizeHref(`/blog/tag/${tag.slug}`)}>{tag.name}</a>
				{/each}
			</Kicker>
			<h1>{post.title}</h1>
			<PostMeta
				date={post.publishedAt ?? post.updatedAt ?? undefined}
				readingTime={post.readingTime ?? undefined}
				authors={post.authors}
			/>
		</header>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- post HTML comes from our own Ghost instance, authored by the site owner -->
		{@html post.html}
	</article>
{/if}

<style>
	/* The post is the page, not a card: no card frame, a comfortable reading width. */
	article {
		max-width: 44rem;
		margin-inline: auto;
		padding: 1rem 0 0;
		background: none;
		border: 0;
		clip-path: none;
	}
	article:is(:hover, :focus-within) {
		background: none;
		box-shadow: none;
	}
	header {
		margin: 0 0 2rem;
		padding: 0;
		background: none;
		border: 0;
	}
	h1 {
		font-size: clamp(2rem, 5vw, 3rem);
		line-height: 1.05;
	}
	/* Section headings in the post get a small notched marker in the viewport-fixed gradient
	   (not the big title inside a Koenig header card). */
	article :global(h2:not(.kg-header-card-heading)::before) {
		content: '';
		display: inline-block;
		width: 0.5em;
		height: 0.5em;
		margin-right: 0.45em;
		vertical-align: 0.12em;
		background: var(--fx) fixed;
		clip-path: polygon(0 0, 100% 0, 100% 100%, 30% 100%, 0 70%);
	}
	article :global(:is(p, li)) {
		font-size: 1.0625rem;
		line-height: 1.7;
	}
	article :global(figcaption) {
		font-family: var(--f-mono);
		font-size: 0.75rem;
		color: var(--c-muted);
	}
</style>
