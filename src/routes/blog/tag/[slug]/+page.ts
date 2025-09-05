import type { PageLoad } from "./$types";
import { TSGhostContentAPI, type Post } from "@ts-ghost/content-api";

import { postStore } from '$lib';
import { get } from 'svelte/store';

const GHOST_URL = 'https://ghost.amun.pl';
const GHOST_KEY = 'e701b4bd9cb5352d3dc49c381b';
const GHOST_VERSION = 'v5.0';

const api = new TSGhostContentAPI(GHOST_URL, GHOST_KEY, GHOST_VERSION);

// TODO: Don't load all posts immediately. Make them load only on hover of a tag
export const load = (async ({ params }) => {
	const postStore_ = get(postStore);
	console.debug("postStore_: ", postStore_);
	// FIX: Checking if there are posts with current tag in the store, IS A BUG!
	// Because every post can have many tags, it is possible that only some posts with select tag are in the store
	// Tags either have to be unique, or there needs to be a separate, unique, category value for posts
	// TODO: It is probably going to be much better, to always load what is in the store and then always query the API for new posts (after some interval)

	// FIX: Checking if there is more than one post with the tag, IS A BUG!
	// If there is only one post in a category, it is going to always miss the cache
	// This check is done, because if we load directly into a blog post, only this single post is going to be loaded into the postCards view.
	// TODO: Maybe it is a good idea to do this length > 1 check in the post reader script and querying the API for the postCards there.
	// This is going to fix the issue with the cache, but is still not elegant.

	// The correct way to do cache invalidation here, would be to keep timestamp of the last check for latest posts
		// Then, only check if the delay expires
		// And first ask the API only for one, latest updated post and check if it matches existence and update time of our cache
		// And only then invalidate the cache and download entire set of new data
	if (postStore_ && postStore_.some(post => post.tags?.some(tag => tag.slug == params.slug)) && postStore_.length > 1) {
		console.debug("Using cache! No fetch posts cards!\n", "Tags: ", postStore_[0].tags);
		return {
			posts:
				postStore_.filter(posts => posts.tags?.some(tag => tag.slug == params.slug)).map((post: Post) => ({
					title: post.title ? post.title : 'No title',
					slug: post.slug!,
					updated_at: post.updated_at!,
					feature_image: post.feature_image ? post.feature_image : 'https://amun.pl/eye-of-ra.webp',
					feature_image_alt: post.feature_image_alt ? post.feature_image_alt : '',
					excerpt: post.excerpt ? post.excerpt : '',
					tags: post.tags!.map((tag) => tag.slug),
					authors: post.authors?.map((author) => author.name) || ['Unknown author']
				}))
		};
	} else {
		console.debug("Fetch posts cards");
		let result = await api.posts.browse({
			filter: `tags:${params.slug}`,
			limit: 10,
			order: 'updated_at DESC'
		}).include({
			authors: true,
			tags: true,
		}).fetch();

		if (result.success) {
			postStore.update(posts => {
				// posts.push(...result.data.filter(post_ => posts.some(post => post.id != post_.id)))
				// Alt approach, which is going to recreate the posts store every time a new tag is hovered
				// Seems like a cleaner approach, which guarantees new content is always loaded on fetch.
				// But it is going to be slower in JS & is used after we've already checked for posts existence.
				// Wipe all posts which match current tag
				posts = posts.filter(post => post.tags?.some(tag => tag.slug != params.slug));
				// Wipe all posts which have id of one of the posts
				posts = posts.filter(post => result.data.some(post_ => post_.id != post.id));
				posts.push(...result.data);
				return posts;
			});
			return {
				posts: result.data.map((post: Post) => ({
					title: post.title ? post.title : 'No title',
					slug: post.slug!,
					updated_at: post.updated_at!,
					feature_image: post.feature_image ? post.feature_image : 'https://amun.pl/eye-of-ra.webp',
					feature_image_alt: post.feature_image_alt ? post.feature_image_alt : '',
					excerpt: post.excerpt ? post.excerpt : '',
					tags: post.tags!.map((tag) => tag.slug),
					authors: post.authors?.map((author) => author.name) || ['Unknown author']
				}))
			};
		} else {
			// errors array of objects
			console.error(result.errors.map((e) => e.message).join("\n"));
		}
	}
}) satisfies PageLoad;