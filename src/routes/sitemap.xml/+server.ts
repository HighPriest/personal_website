import { ghost } from '#lib/server/ghost/index.js';
import { fromGhost } from '#lib/server/ghost/load.js';
import { buildSitemap } from '#lib/server/sitemap.js';
import type { RequestHandler } from './$types';

/** Every page, locale, tag and post (#lib/server/sitemap.ts); Ghost's lists come from its cache. */
export const GET: RequestHandler = async () => {
	const [tags, posts] = await fromGhost(() =>
		Promise.all([ghost.listTags(), ghost.sitemapPosts()])
	);
	return new Response(buildSitemap({ tags: tags.map((tag) => tag.slug), posts }), {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
};
