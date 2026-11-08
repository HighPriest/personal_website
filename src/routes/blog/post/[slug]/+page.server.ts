import { error } from '@sveltejs/kit';
import { ghost } from '#lib/server/ghost/index.js';
import { BLOG_CACHE_CONTROL, fromGhost, isSlug } from '#lib/server/ghost/load.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	if (!isSlug(params.slug)) error(404, 'No such post');
	const post = await fromGhost(() => ghost.getPost(params.slug));
	if (!post) error(404, 'No such post');
	setHeaders({ 'cache-control': BLOG_CACHE_CONTROL });
	return { post };
};
