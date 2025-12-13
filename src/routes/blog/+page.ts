import type { PageLoad } from './$types';
import { TSGhostContentAPI, type Post } from '@ts-ghost/content-api';
import { postStore } from '$lib';
import { get } from 'svelte/store';

const GHOST_URL = 'https://amun.pl';
const GHOST_KEY = 'e701b4bd9cb5352d3dc49c381b';
const GHOST_VERSION = 'v5.0';

const api = new TSGhostContentAPI(GHOST_URL, GHOST_KEY, GHOST_VERSION);

export const load = (async () => {
	const postStore_ = get(postStore);

	// Check if we already have 5 valid cached posts
	// THIS ONLY CHECKS IF WE HAVE 5 POSTS! They don't have to be the latest posts
	if (postStore_.length > 5) {
		console.debug('Using cache for latest posts');
		return {
			posts: postStore_.map((post: Post) => ({
				title: post.title ?? 'No title',
				slug: post.slug!,
				published_at: post.published_at!,
				feature_image: post.feature_image ?? 'https://amun.pl/media/cyberpunk.jpg',
				feature_image_alt: post.feature_image_alt ?? '',
				authors: post.authors?.map((a) => a.name) || ['Unknown author']
			})).sort(
					(a, b) =>
						new Date(b.published_at!).getTime() -
						new Date(a.published_at!).getTime()
				)
		};
	}

	console.debug('Fetching latest posts from GhostCMS');
	const result = await api.posts
		.browse({
			limit: 5,
			order: 'updated_at DESC'
		})
		.include({
			authors: true,
			tags:true
		})
		.fetch();

	if (result.success) {
		// Update store with new posts
		postStore.update((posts) => {
			// Merge without duplicates (by id)
			const existingIds = new Set(posts.map((p) => p.id));
			const fresh = result.data
        		.filter((p) => !existingIds.has(p.id))
        		.map((p) => ({ ...p, tags: [] })); // Ensure tags is []
			return [...posts, ...fresh];
		});

		return {
			posts: result.data.map((post: Post) => ({
				title: post.title ?? 'No title',
				slug: post.slug!,
				published_at: post.published_at!,
				feature_image: post.feature_image ?? 'https://amun.pl/media/cyberpunk.jpg',
				feature_image_alt: post.feature_image_alt ?? '',
				tags: [], // Wipe tags, so that they can be loaded by hover
				authors: post.authors?.map((a) => a.name) || ['Unknown author']
			}))
		};
	} else {
		console.error(result.errors.map((e) => e.message).join('\n'));
		return { posts: [] };
	}
}) satisfies PageLoad;
