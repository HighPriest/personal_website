/**
 * The media cache: third-party images in posts (bookmark thumbnails and icons,
 * YouTube posters) are fetched by the server and served from /blog/media/<id>, so visitors make
 * no requests to other sites and those sites aren't asked once per visitor.
 *
 * Not an open proxy: only URLs registered while rendering Ghost posts (owner-authored content)
 * can be fetched. Ids are a hash of the URL, so they stay the same across restarts; after one,
 * an image works again once its post has been rendered. Held in memory (the server may not
 * write files), bounded by the shared Cache.
 */
import { createHash } from 'node:crypto';
import { debug } from '#lib/debug.js';
import { Cache } from './cache.ts';

/** The largest image the cache keeps. */
export const MAX_BYTES = 2 * 1024 * 1024;
/** Images rarely change: fresh for a week, served stale for a month while the source fails. */
export const MEDIA_CACHE = { max: 100, ttlMs: 7 * 24 * 3600_000, staleMs: 30 * 24 * 3600_000 };
export const ID = /^[0-9a-f]{24}$/;

export type MediaFile = { type: string; body: Uint8Array<ArrayBuffer> };

/** A source that didn't answer with an image (or answered with one too big to keep). */
export class MediaUnavailable extends Error {}

type Options = {
	fetch?: typeof globalThis.fetch;
	timeoutMs?: number;
	cache?: Cache;
};

export function createMedia({
	fetch = globalThis.fetch,
	timeoutMs = 5000,
	cache = new Cache(MEDIA_CACHE)
}: Options = {}) {
	const sources = new Map<string, string>();

	async function download(id: string, url: string): Promise<MediaFile> {
		let response: Response;
		try {
			response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
		} catch {
			throw new MediaUnavailable(`${url} unreachable`);
		}
		const type = response.headers.get('content-type') ?? '';
		const declared = Number(response.headers.get('content-length') ?? 0);
		if (!response.ok || !type.startsWith('image/') || declared > MAX_BYTES) {
			await response.body?.cancel();
			throw new MediaUnavailable(`${url} answered ${response.status} ${type}`);
		}
		const body = new Uint8Array(await response.arrayBuffer());
		if (body.byteLength > MAX_BYTES) throw new MediaUnavailable(`${url} is too big`);
		debug?.('media', 'fetched', {
			id,
			status: response.status,
			kB: Math.round(body.byteLength / 1024)
		});
		return { type, body };
	}

	return {
		/** The local path for a third-party image URL; from now on the cache may fetch it. */
		register(url: string): string {
			const id = createHash('sha256').update(url).digest('hex').slice(0, 24);
			sources.set(id, url);
			return `/blog/media/${id}`;
		},

		/** The image for `id`, `null` for an id no post has registered. */
		async get(id: string): Promise<MediaFile | null> {
			const url = ID.test(id) ? sources.get(id) : undefined;
			if (!url) return null;
			return cache.get(id, () => download(id, url));
		}
	};
}

export type Media = ReturnType<typeof createMedia>;
