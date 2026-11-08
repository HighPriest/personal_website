import { error } from '@sveltejs/kit';
import { media, MediaUnavailable } from '#lib/server/ghost/index.js';
import type { RequestHandler } from './$types';

/** A cached third-party image from a post (#lib/server/ghost/media.ts). */
export const GET: RequestHandler = async ({ params }) => {
	let file;
	try {
		file = await media.get(params.id);
	} catch (cause) {
		if (!(cause instanceof MediaUnavailable)) throw cause;
		return new Response(null, { status: 502, headers: { 'cache-control': 'no-store' } });
	}
	if (!file) error(404, 'Not found');

	return new Response(file.body, {
		headers: {
			'content-type': file.type,
			'cache-control': 'public, max-age=604800',
			'x-content-type-options': 'nosniff',
			// Some cached icons are SVG: opened on their own, they must not run script on amun.pl.
			'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox"
		}
	});
};
