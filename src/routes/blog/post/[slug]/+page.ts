export const prerender = true;
import type { PageLoad } from "./$types";
import { TSGhostContentAPI, type Post } from "@ts-ghost/content-api";

import { postStore } from '$lib';
import { get } from 'svelte/store';

const GHOST_URL = 'https://ghost.amun.pl';
const GHOST_KEY = 'e701b4bd9cb5352d3dc49c381b';
const GHOST_VERSION = 'v5.0';

const api = new TSGhostContentAPI(GHOST_URL, GHOST_KEY, GHOST_VERSION);

export const load = (async ({ params }) => {
	const posts = get(postStore);
	if (posts && posts.some(post => post.slug === params.slug) && posts.find(post => post.slug === params.slug)?.html) {
		console.log("No fetch post");
		const post = posts.find(post => post.slug === params.slug);
		return {
			post:
				 {
					title: post?.title ? post.title : 'No title',
					slug: post?.slug!,
					feature_image: post?.feature_image ? post.feature_image : 'https://amun.pl/eye-of-ra.webp',
					feature_image_alt: post?.feature_image_alt ? post.feature_image_alt : '',
					updated_at: post?.updated_at!,
					tags: post?.tags!.map((tag) => tag.name),
					authors: post?.authors!.map((author) => author.name),
					excerpt: post?.excerpt ?? '',
					html: post?.html ?? ''
				}
		};
	} else {
		console.log("Fetch post");
		let result = await api.posts.read({
			slug: params.slug,
			//order: 'updated_at DESC'
		}).include({
			authors: true,
			tags: true
		}).fetch();

		if (result.success) {
			postStore.update(existingPosts => {
				const index = existingPosts.findIndex(post => post.slug === params.slug);
				if (index !== -1) {
					existingPosts[index] = result.data;
				} else {
					existingPosts.push(result.data);
				}
				return existingPosts;
			})
			return {
				post:
				{
					title: result.data.title || 'No title',
					slug: result.data.slug,
					feature_image: result.data.feature_image
						?? 'https://amun.pl/eye-of-ra.webp',
					feature_image_alt: result.data.feature_image_alt ?? '',
					updated_at: result.data.updated_at,
					tags: result.data.tags!.map((tag) => tag.name),
					authors: result.data.authors!.map((author) => author.name),
					excerpt: result.data.excerpt ?? '',
					html: result.data.html ?? ''
				}
			};
		} else {
			// errors array of objects
			console.log(result.errors.map((e) => e.message).join("\n"));
		}
	}
}) satisfies PageLoad;