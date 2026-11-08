import { debug, elapsed } from '#lib/debug.js';
import type { Cache } from './cache.ts';
import type { GhostClient } from './client.ts';
import {
	toPost,
	toSummary,
	toTag,
	type GhostPost,
	type GhostTag,
	type Pagination,
	type Post,
	type PostSummary,
	type Tag
} from './dto.ts';

/** The blog index's featured section: one big card and four smaller ones. */
export const FEATURED = 5;
/** Posts per page in post lists (tag pages). */
export const PAGE_SIZE = 24;

type PostsResponse = {
	posts: GhostPost[];
	meta?: { pagination?: Partial<Pagination> };
};

/**
 * The blog's read API over Ghost, cached. `render` post-processes a post's HTML
 * (content.ts) inside the cache fill, so the cache keeps the finished HTML.
 */
export function createGhostApi(
	client: GhostClient,
	cache: Cache,
	render: (html: string) => Promise<string> = async (html) => html
) {
	async function fetchPosts(params: Record<string, string>) {
		const started = performance.now();
		const response = await client<PostsResponse>('posts/', {
			include: 'tags,authors',
			order: 'published_at DESC',
			...params
		});
		debug?.('ghost', 'fetched posts', {
			filter: params.filter ?? 'none',
			posts: response?.posts.length ?? 0,
			ms: elapsed(started)
		});
		return response ?? { posts: [] };
	}

	return {
		/**
		 * The featured section: posts with Ghost's "Feature this post" flag, newest published first.
		 * While fewer than five carry the flag, the newest other posts fill the remaining places.
		 */
		featuredPosts(): Promise<PostSummary[]> {
			return cache.get('featured', async () => {
				const flagged = await fetchPosts({ filter: 'featured:true', limit: String(FEATURED) });
				let posts = flagged.posts;
				if (posts.length < FEATURED) {
					const fill = await fetchPosts({
						filter: 'featured:false',
						limit: String(FEATURED - posts.length)
					});
					posts = [...posts, ...fill.posts];
				}
				return posts.map(toSummary);
			});
		},

		/** One page of posts, optionally of one tag, newest published first. */
		listPosts({ tag, page = 1 }: { tag?: string; page?: number } = {}) {
			return cache.get(`posts:${tag ?? '*'}:${page}`, async () => {
				const response = await fetchPosts({
					limit: String(PAGE_SIZE),
					page: String(page),
					...(tag ? { filter: `tag:${tag}` } : {})
				});
				const meta = response.meta?.pagination;
				return {
					posts: response.posts.map(toSummary),
					pagination: {
						page: meta?.page ?? page,
						pages: meta?.pages ?? 1,
						total: meta?.total ?? response.posts.length
					} satisfies Pagination
				};
			});
		},

		/** A post with its HTML, or `null` when there's no post with that slug. */
		getPost(slug: string): Promise<Post | null> {
			return cache.get(`post:${slug}`, async () => {
				const started = performance.now();
				const response = await client<{ posts: GhostPost[] }>(
					`posts/slug/${encodeURIComponent(slug)}/`,
					{ include: 'tags,authors' }
				);
				const post = response?.posts[0];
				debug?.('ghost', 'fetched post', {
					slug,
					found: !!post,
					htmlKB: Math.round((post?.html?.length ?? 0) / 1024),
					ms: elapsed(started)
				});
				if (!post) return null;
				const rendering = performance.now();
				const html = await render(post.html ?? '');
				debug?.('ghost', 'rendered post', { slug, ms: elapsed(rendering) });
				return { ...toPost(post), html };
			});
		},

		/** Every post's slug and last update, for the sitemap. */
		sitemapPosts(): Promise<{ slug: string; updatedAt: string | null }[]> {
			return cache.get('sitemap', async () => {
				const started = performance.now();
				const response = await client<{ posts: Pick<GhostPost, 'slug' | 'updated_at'>[] }>(
					'posts/',
					{ fields: 'slug,updated_at', order: 'published_at DESC', limit: 'all' }
				);
				const posts = (response?.posts ?? []).map((post) => ({
					slug: post.slug,
					updatedAt: post.updated_at ?? null
				}));
				debug?.('ghost', 'fetched sitemap posts', { posts: posts.length, ms: elapsed(started) });
				return posts;
			});
		},

		/** The public tags that have posts, most used first. */
		listTags(): Promise<Tag[]> {
			return cache.get('tags', async () => {
				const started = performance.now();
				const response = await client<{ tags: GhostTag[] }>('tags/', {
					include: 'count.posts',
					filter: 'visibility:public',
					order: 'count.posts DESC',
					limit: 'all'
				});
				const tags = (response?.tags ?? []).map(toTag).filter((tag) => tag.count > 0);
				debug?.('ghost', 'fetched tags', { tags: tags.length, ms: elapsed(started) });
				return tags;
			});
		}
	};
}

export type GhostApi = ReturnType<typeof createGhostApi>;
