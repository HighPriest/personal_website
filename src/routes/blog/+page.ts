export const prerender = true;
import type { PageLoad } from './$types'
import GhostContentAPI from '@tryghost/content-api';

export const load = (async () => {
	const GHOST_URL = 'https://ghost.amun.pl';
	const GHOST_KEY = 'e701b4bd9cb5352d3dc49c381b';
	const GHOST_VERSION = 'v5.0';

	const api = GhostContentAPI({
		url: GHOST_URL,
		key: GHOST_KEY,
		version: GHOST_VERSION
	});

	try {
		const tagsJson = await api.tags.browse({
			limit: 'all',
			include: ['count.posts'],
			order: 'count.posts DESC'
		});

		return {
			tags: tagsJson.map((tag) => ({
				name: tag.name ? tag.name : 'No title',
				slug: tag.slug!,
				feature_image: tag.feature_image ? tag.feature_image : 'https://amun.pl/eye-of-ra.webp',
				description: tag.description ? tag.description : '',
				count: tag.count?.posts || 0
			}))
		};
	} catch (error) {
		console.error(error);
	}
}) satisfies PageLoad;
