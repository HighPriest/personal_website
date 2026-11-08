import { error } from '@sveltejs/kit';
import { ghost } from '#lib/server/ghost/index.js';
import { BLOG_CACHE_CONTROL, fromGhost, isSlug } from '#lib/server/ghost/load.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent, setHeaders }) => {
	if (!isSlug(params.slug)) error(404, 'No such tag');
	const { tags } = await parent();
	const tag = tags.find((candidate) => candidate.slug === params.slug);
	if (!tag) error(404, 'No such tag');
	setHeaders({ 'cache-control': BLOG_CACHE_CONTROL });
	const { posts, pagination } = await fromGhost(() => ghost.listPosts({ tag: tag.slug }));
	return { tag, posts, pagination };
};
