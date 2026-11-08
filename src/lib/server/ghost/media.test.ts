import { describe, expect, it, vi } from 'vitest';
import { Cache } from './cache.ts';
import { createMedia, MAX_BYTES, MediaUnavailable } from './media.ts';

const png = (bytes = 3, headers: Record<string, string> = {}) =>
	new Response(new Uint8Array(bytes), { headers: { 'content-type': 'image/png', ...headers } });
const idOf = (path: string) => path.slice('/blog/media/'.length);

describe('media cache', () => {
	it('serves only URLs registered from posts', async () => {
		const fetch = vi.fn(async () => png());
		const media = createMedia({ fetch });
		expect(await media.get('0123456789abcdef01234567')).toBeNull();
		expect(await media.get('../../etc/passwd')).toBeNull();
		expect(fetch).not.toHaveBeenCalled();
	});

	it('gives a URL the same id every time, and fetches it once for many requests', async () => {
		const fetch = vi.fn(async () => png(5));
		const media = createMedia({ fetch });
		const path = media.register('https://example.com/a.png');
		expect(path).toMatch(/^\/blog\/media\/[0-9a-f]{24}$/);
		expect(createMedia().register('https://example.com/a.png')).toBe(path);

		const [first, second] = await Promise.all([media.get(idOf(path)), media.get(idOf(path))]);
		await media.get(idOf(path));
		expect(first).toEqual({ type: 'image/png', body: new Uint8Array(5) });
		expect(second).toEqual(first);
		expect(fetch).toHaveBeenCalledTimes(1);
	});

	it('refuses an answer that is not an image, failed, or is too big', async () => {
		const answers = [
			new Response('<html>', { headers: { 'content-type': 'text/html' } }),
			new Response(null, { status: 429 }),
			png(3, { 'content-length': String(MAX_BYTES + 1) }),
			png(MAX_BYTES + 1)
		];
		for (const answer of answers) {
			const media = createMedia({ fetch: async () => answer });
			const path = media.register('https://example.com/x');
			await expect(media.get(idOf(path))).rejects.toThrow(MediaUnavailable);
		}
		const offline = createMedia({
			fetch: async () => {
				throw new TypeError('fetch failed');
			}
		});
		await expect(offline.get(idOf(offline.register('https://example.com/y')))).rejects.toThrow(
			/unreachable/
		);
	});

	it('keeps serving a cached image while its source fails', async () => {
		let now = 0;
		let up = true;
		const media = createMedia({
			fetch: async () => (up ? png(4) : new Response(null, { status: 429 })),
			cache: new Cache({ ttlMs: 1000, staleMs: 10_000, now: () => now })
		});
		const id = idOf(media.register('https://example.com/b.png'));
		await media.get(id);
		up = false;
		now = 5000;
		expect((await media.get(id))?.body).toHaveLength(4);
	});
});
