/**
 * Mapping from the Ghost Content API onto the blog's shapes (#lib/blog/types.ts), so pages
 * don't depend on the API's format. Lists never carry HTML.
 */

import type { Post, PostSummary, Tag } from '#lib/blog/types.js';

export type { Pagination, Post, PostSummary, Tag, TagRef } from '#lib/blog/types.js';

/** The fields of a Ghost Content API post that the blog reads. */
export type GhostPost = {
	slug: string;
	title?: string | null;
	excerpt?: string | null;
	custom_excerpt?: string | null;
	feature_image?: string | null;
	feature_image_alt?: string | null;
	published_at?: string | null;
	updated_at?: string | null;
	reading_time?: number | null;
	featured?: boolean | null;
	html?: string | null;
	tags?: { slug: string; name: string; visibility?: string }[];
	authors?: { name: string }[];
};

export type GhostTag = {
	slug: string;
	name: string;
	visibility?: string;
	count?: { posts?: number };
};

export function toSummary(post: GhostPost): PostSummary {
	// Internal tags (#hash) are for Ghost's own use, not for readers.
	const tags = (post.tags ?? [])
		.filter((tag) => tag.visibility !== 'internal')
		.map(({ slug, name }) => ({ slug, name }));
	return {
		slug: post.slug,
		title: post.title || 'Untitled',
		excerpt: (post.custom_excerpt || post.excerpt || '').trim(),
		cover: post.feature_image || null,
		coverAlt: post.feature_image_alt ?? '',
		publishedAt: post.published_at ?? null,
		updatedAt: post.updated_at ?? null,
		readingTime: post.reading_time ?? null,
		tag: tags[0] ?? null,
		tags,
		authors: (post.authors ?? []).map((author) => author.name),
		featured: post.featured ?? false
	};
}

export function toPost(post: GhostPost): Post {
	return { ...toSummary(post), html: post.html ?? '' };
}

export function toTag(tag: GhostTag): Tag {
	return { slug: tag.slug, name: tag.name, count: tag.count?.posts ?? 0 };
}
