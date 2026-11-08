<!--
	@component
	A post as a card: the cover image edge to edge on top with the
	post's first tag on it, the small meta line, the title as the link, and the excerpt when known.
	`featured` lays it out wide, cover beside the text, with a "read" cue. On hover the card lifts,
	the cover zooms in slightly and the tag slides (not with reduced motion).
-->
<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import * as m from '#lib/paraglide/messages.js';
	import type { PostSummary } from '#lib/blog/types.js';
	import PostMeta from './PostMeta.svelte';

	let { post, featured = false }: { post: PostSummary; featured?: boolean } = $props();

	const href = $derived(localizeHref(`/blog/post/${post.slug}`));
</script>

<article class={{ featured }}>
	<!-- A 16:9 frame (the gradient shows when a post has no cover); the image has width and
		height set, so it never shifts the layout. -->
	<div class="cover">
		{#if post.cover}
			<img
				src={post.cover}
				alt={post.coverAlt}
				width="1600"
				height="900"
				loading={featured ? 'eager' : 'lazy'}
				decoding="async"
			/>
		{/if}
		{#if post.tag}<span class="tag">{post.tag.name}</span>{/if}
	</div>
	<div class="body">
		<PostMeta
			date={post.publishedAt ?? post.updatedAt ?? undefined}
			readingTime={post.readingTime ?? undefined}
			small
		/>
		<svelte:element this={featured ? 'h2' : 'h3'}>
			<a {href}>{post.title}</a>
		</svelte:element>
		{#if post.excerpt}<p>{post.excerpt}</p>{/if}
		{#if featured}<span class="read" aria-hidden="true">{m.blog_read()} →</span>{/if}
	</div>
</article>

<style>
	article {
		position: relative;
		display: flex;
		flex-direction: column;
		min-width: 0;
		margin: 0;
		transition:
			box-shadow var(--pico-transition),
			transform 0.25s ease-out;
	}
	/* Hover motion: the card lifts, the cover zooms in inside its frame, the tag slides. */
	@media (prefers-reduced-motion: no-preference) {
		article:hover {
			transform: translateY(-4px);
		}
		article:hover .cover img {
			transform: scale(1.05);
		}
		article:hover .tag {
			transform: translateX(4px);
		}
	}
	/* The title link stretches over the whole card, so a click anywhere on it opens the post,
	   while the card stays one link, named by its title, for keyboards and screen readers. */
	:is(h2, h3) a::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 1;
	}
	article:hover :is(h2, h3) a {
		color: var(--c-link-hover);
	}
	.read {
		color: var(--c-link);
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}
	.cover {
		position: relative;
		overflow: hidden;
		width: calc(100% + 2 * var(--pico-block-spacing-horizontal));
		max-width: none;
		aspect-ratio: 16 / 9;
		margin: calc(var(--pico-block-spacing-vertical) * -1)
			calc(var(--pico-block-spacing-horizontal) * -1) 1rem;
		background: linear-gradient(
			135deg,
			var(--c-neon-y) -20%,
			var(--c-neon-b) 55%,
			var(--c-bg) 120%
		);
	}
	.cover img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.4s ease-out;
	}
	/* The first tag, as a HUD label on the cover (or above the meta line without a cover). */
	.tag {
		position: absolute;
		left: 0.75rem;
		bottom: 0.6rem;
		padding: 0.15rem 0.45rem;
		background: var(--c-ink);
		color: #f6f7fb;
		font-family: var(--f-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		transition: transform 0.25s ease-out;
	}
	h2,
	h3 {
		margin: 0 0 0.5rem;
	}
	h3 {
		font-size: 1.15rem;
	}
	h2 {
		font-size: clamp(1.5rem, 3vw, 2.1rem);
	}
	h2::after {
		display: none;
	}
	:is(h2, h3) a {
		color: inherit;
		text-decoration: none;
	}
	:is(h2, h3) a:is(:hover, :focus-visible) {
		color: var(--c-link-hover);
	}
	p {
		color: var(--c-muted);
		font-size: 0.95rem;
	}

	/* Featured: cover beside the text on wide screens. */
	.featured {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
		gap: 0 2rem;
		margin-bottom: 2rem;
	}
	.featured .body {
		align-self: center;
	}
	.featured .cover {
		height: 100%;
		min-height: 16rem;
		aspect-ratio: auto;
		margin: calc(var(--pico-block-spacing-vertical) * -1) 0
			calc(var(--pico-block-spacing-vertical) * -1) calc(var(--pico-block-spacing-horizontal) * -1);
		width: calc(100% + var(--pico-block-spacing-horizontal));
	}
	@media (max-width: 720px) {
		.featured {
			grid-template-columns: minmax(0, 1fr);
		}
		.featured .cover {
			width: calc(100% + 2 * var(--pico-block-spacing-horizontal));
			height: auto;
			min-height: 0;
			aspect-ratio: 16 / 9;
			margin: calc(var(--pico-block-spacing-vertical) * -1)
				calc(var(--pico-block-spacing-horizontal) * -1) 1rem;
		}
	}
</style>
