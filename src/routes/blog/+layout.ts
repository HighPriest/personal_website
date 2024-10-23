export const prerender = true;
import type { LayoutLoad } from './$types'
import GhostContentAPI from '@tryghost/content-api';

/*export const load = (async () => {
	const GHOST_URL = 'https://ghost.amun.pl';
	const GHOST_KEY = 'e701b4bd9cb5352d3dc49c381b';
	const GHOST_VERSION = 'v5.0';

	const api = GhostContentAPI({
		url: GHOST_URL,
		key: GHOST_KEY,
		version: GHOST_VERSION
	});

	try {
		const postsJson = await api.posts.browse({
			limit: 20,
			include: ['tags', 'authors'],
			order: 'updated_at DESC'
		});

		return {
			posts: postsJson.map((post) => ({
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
	} catch (error) {
		console.error(error);
	}
}) satisfies LayoutLoad;
*/