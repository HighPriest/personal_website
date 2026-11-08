<!--
	@component
	A page's head for search engines and link previews: title, description,
	canonical URL, locale alternates, Open Graph and Twitter cards, and on posts BlogPosting
	structured data. With `post`, the canonical is the post's unprefixed address in every locale
	and there are no alternates (one URL per post, §5.3).
-->
<script lang="ts">
	import { page } from '$app/state';
	import { deLocalizeHref, getLocale, locales } from '#lib/paraglide/runtime.js';
	import type { PostSummary } from '#lib/blog/types.js';
	import {
		absolute,
		alternates,
		DEFAULT_IMAGE,
		jsonLd,
		localized,
		metaDescription,
		OG_LOCALES
	} from '#lib/seo.js';

	let {
		title,
		description: text,
		post
	}: { title: string; description: string; post?: PostSummary } = $props();

	const description = $derived(metaDescription(text));

	const locale = $derived(getLocale());
	const path = $derived(deLocalizeHref(page.url.pathname));
	const canonical = $derived(post ? absolute(`/blog/post/${post.slug}`) : localized(path, locale));
	const image = $derived(post?.cover ?? DEFAULT_IMAGE);

	/** A post's structured data, as a JSON-LD script element. */
	const structured = $derived(
		post &&
			jsonLd({
				'@context': 'https://schema.org',
				'@type': 'BlogPosting',
				headline: post.title,
				description,
				image,
				datePublished: post.publishedAt ?? undefined,
				dateModified: post.updatedAt ?? post.publishedAt ?? undefined,
				author: post.authors.map((name) => ({ '@type': 'Person', name })),
				keywords: post.tags.map((tag) => tag.name).join(', ') || undefined,
				mainEntityOfPage: canonical
			})
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	{#if !post}
		{#each alternates(path) as { hreflang, href } (hreflang)}
			<link rel="alternate" {hreflang} {href} />
		{/each}
	{/if}

	<meta property="og:site_name" content="Amun" />
	<meta property="og:type" content={post ? 'article' : 'website'} />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={post?.title ?? title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={image} />
	{#if post?.cover && post.coverAlt}<meta property="og:image:alt" content={post.coverAlt} />{/if}
	<meta property="og:locale" content={OG_LOCALES[locale]} />
	{#each locales.filter((other) => other !== locale) as other (other)}
		<meta property="og:locale:alternate" content={OG_LOCALES[other]} />
	{/each}
	<meta name="twitter:card" content={post?.cover ? 'summary_large_image' : 'summary'} />

	{#if post}
		{#if post.publishedAt}<meta property="article:published_time" content={post.publishedAt} />{/if}
		{#if post.updatedAt}<meta property="article:modified_time" content={post.updatedAt} />{/if}
		{#each post.tags as tag (tag.slug)}<meta property="article:tag" content={tag.name} />{/each}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- built by jsonLd(), which escapes < -->
		{@html structured}
	{/if}
</svelte:head>
