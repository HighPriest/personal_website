export const prerender = true;
import type { PageLoad } from "./$types";
import { TSGhostContentAPI, type Post } from "@ts-ghost/content-api";

// TODO: Don't load all posts immediately. Make them load only on hover of a tag
export const load = (async ({ params }) => {
	const GHOST_URL = 'https://ghost.amun.pl';
	const GHOST_KEY = 'e701b4bd9cb5352d3dc49c381b';
	const GHOST_VERSION = 'v5.0';

	const api = new TSGhostContentAPI(GHOST_URL, GHOST_KEY, GHOST_VERSION);
	let result = await api.posts.browse({
		filter: `tags:${params.slug}`,
		limit: 10
		//order: 'updated_at DESC'
	}).include({
		authors: true,
		tags: true
	}).fetch();

	if (result.success) {
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
		console.log(result.errors.map((e) => e.message).join("\n"));
	}
}) satisfies PageLoad;