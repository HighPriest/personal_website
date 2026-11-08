import { ghost } from '#lib/server/ghost/index.js';
import { fromGhost } from '#lib/server/ghost/load.js';
import type { LayoutServerLoad } from './$types';

// The blog is rendered per request from Ghost (cached on the server), so new posts appear without
// a rebuild and the build doesn't need Ghost.
export const prerender = false;

export const load: LayoutServerLoad = async () => ({
	tags: await fromGhost(() => ghost.listTags())
});
