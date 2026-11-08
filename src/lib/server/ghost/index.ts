/**
 * The blog's only door to Ghost. Server-only: nothing Ghost-related reaches the
 * browser. One shared cache for the whole server process.
 */
import { GHOST_CONTENT_KEY, GHOST_URL } from '$app/env/private';
import { debug } from '#lib/debug.js';
import { createGhostApi } from './api.ts';
import { Cache, type CacheOptions } from './cache.ts';
import { createGhostClient } from './client.ts';
import { renderContent } from './content.ts';
import { createMedia, MEDIA_CACHE } from './media.ts';

export { GhostUnavailable } from './client.ts';
export { MediaUnavailable } from './media.ts';
export type { Pagination, Post, PostSummary, Tag, TagRef } from '#lib/blog/types.js';

const logTo =
	(scope: string): CacheOptions['onEvent'] =>
	(event) =>
		debug?.(scope, event.kind, {
			key: event.key,
			...('ageMs' in event ? { ageS: Math.round(event.ageMs / 1000) } : {})
		});

/** Third-party images from posts, served from /blog/media/<id>. */
export const media = createMedia({
	cache: new Cache({ ...MEDIA_CACHE, onEvent: logTo('media/cache') })
});

export const ghost = createGhostApi(
	createGhostClient({ url: GHOST_URL, key: GHOST_CONTENT_KEY }),
	new Cache({ onEvent: logTo('ghost/cache') }),
	(html) => renderContent(html, media)
);
