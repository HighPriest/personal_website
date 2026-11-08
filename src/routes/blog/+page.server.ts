import { ghost } from '#lib/server/ghost/index.js';
import { BLOG_CACHE_CONTROL, fromGhost } from '#lib/server/ghost/load.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({ 'cache-control': BLOG_CACHE_CONTROL });
	return { posts: await fromGhost(() => ghost.featuredPosts()) };
};
