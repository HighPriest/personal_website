import { describe, expect, it, vi } from 'vitest';
import { createGhostApi } from './api.ts';
import { Cache } from './cache.ts';
import { createGhostClient, GhostUnavailable, type GhostClient } from './client.ts';
import { toSummary, type GhostPost } from './dto.ts';

const post = (slug: string, extra: Partial<GhostPost> = {}): GhostPost => ({
	slug,
	title: slug,
	excerpt: `excerpt of ${slug}`,
	published_at: '2026-01-01T00:00:00.000Z',
	tags: [{ slug: 'simracing', name: 'SimRacing', visibility: 'public' }],
	authors: [{ name: 'Kamil' }],
	...extra
});

describe('Cache', () => {
	it('serves a fresh entry without loading again, until the TTL passes', async () => {
		let now = 0;
		const cache = new Cache({ ttlMs: 60_000, now: () => now });
		const load = vi.fn(async () => 'value');
		await cache.get('k', load);
		now = 59_999;
		await cache.get('k', load);
		expect(load).toHaveBeenCalledTimes(1);
		now = 60_000;
		await cache.get('k', load);
		expect(load).toHaveBeenCalledTimes(2);
	});

	it('serves a stale entry while loading fails, for up to 24 h', async () => {
		let now = 0;
		const cache = new Cache({ ttlMs: 60_000, staleMs: 24 * 3600_000, now: () => now });
		await cache.get('k', async () => 'old');
		const failing = async (): Promise<string> => {
			throw new GhostUnavailable('down');
		};
		now = 60_000 + 23 * 3600_000;
		expect(await cache.get('k', failing)).toBe('old');
		now = 60_000 + 24 * 3600_000;
		await expect(cache.get('k', failing)).rejects.toThrow(GhostUnavailable);
	});

	it('keeps at most `max` entries, dropping the least recently used', async () => {
		const cache = new Cache({ max: 2 });
		const load = (value: string) => vi.fn(async () => value);
		await cache.get('a', load('a'));
		await cache.get('b', load('b'));
		await cache.get('a', load('a')); // a is now the most recently used
		await cache.get('c', load('c'));
		expect(cache.size).toBe(2);
		const again = load('a2');
		expect(await cache.get('a', again)).toBe('a');
		const bAgain = load('b2');
		expect(await cache.get('b', bAgain)).toBe('b2'); // b was evicted
	});

	it('shares one load between concurrent misses (single-flight)', async () => {
		const cache = new Cache();
		let resolve!: (value: string) => void;
		const load = vi.fn(() => new Promise<string>((done) => (resolve = done)));
		const first = cache.get('k', load);
		const second = cache.get('k', load);
		resolve('value');
		expect(await Promise.all([first, second])).toEqual(['value', 'value']);
		expect(load).toHaveBeenCalledTimes(1);
	});

	it('caches a missing result (null) like any other', async () => {
		const cache = new Cache();
		const load = vi.fn(async () => null);
		await cache.get('k', load);
		await cache.get('k', load);
		expect(load).toHaveBeenCalledTimes(1);
	});
});

describe('Ghost client', () => {
	const respond = (status: number, body: unknown = {}, headers: Record<string, string> = {}) =>
		vi.fn(async () => new Response(JSON.stringify(body), { status, headers }));

	it('asks the Content API with the key, version and forwarded protocol', async () => {
		const fetch = respond(200, { posts: [] });
		await createGhostClient({ url: 'http://ghost.example', key: 'k', fetch })('posts/', {
			limit: '5'
		});
		const [target, init] = fetch.mock.calls[0] as unknown as [URL, RequestInit];
		expect(target.href).toBe('http://ghost.example/ghost/api/content/posts/?key=k&limit=5');
		expect(init.headers).toMatchObject({
			'Accept-Version': 'v5.0',
			'X-Forwarded-Proto': 'https'
		});
		expect(init.redirect).toBe('manual');
	});

	it('turns 404 into null', async () => {
		const client = createGhostClient({ url: 'http://g', key: 'k', fetch: respond(404) });
		expect(await client('posts/slug/x/')).toBeNull();
	});

	it('turns a redirect, an error status or a failed request into GhostUnavailable', async () => {
		const redirect = respond(301, {}, { location: 'https://amun.pl/x' });
		await expect(
			createGhostClient({ url: 'http://g', key: 'k', fetch: redirect })('posts/')
		).rejects.toThrow(/redirected \(301\) to https:\/\/amun.pl\/x/);
		await expect(
			createGhostClient({ url: 'http://g', key: 'k', fetch: respond(500) })('posts/')
		).rejects.toThrow(GhostUnavailable);
		const offline = vi.fn(async () => {
			throw new TypeError('fetch failed');
		});
		await expect(
			createGhostClient({ url: 'http://g', key: 'k', fetch: offline })('posts/')
		).rejects.toThrow(/unreachable/);
	});
});

describe('post shapes', () => {
	it('prefers the custom excerpt, keeps the primary tag and leaves internal tags out', () => {
		const summary = toSummary(
			post('a', {
				custom_excerpt: 'custom',
				reading_time: 7,
				tags: [
					{ slug: 'hash-featured', name: '#featured', visibility: 'internal' },
					{ slug: 'network', name: 'Network', visibility: 'public' }
				]
			})
		);
		expect(summary.excerpt).toBe('custom');
		expect(summary.readingTime).toBe(7);
		expect(summary.tag).toEqual({ slug: 'network', name: 'Network' });
		expect(summary.tags).toHaveLength(1);
		expect(summary).not.toHaveProperty('html');
	});
});

describe('featured posts', () => {
	/** A fake Ghost that answers the two featured queries from a list of posts. */
	function fakeGhost(posts: GhostPost[]) {
		const calls: Record<string, string>[] = [];
		const client: GhostClient = async <T>(_path: string, params: Record<string, string> = {}) => {
			calls.push(params);
			const flagged = params.filter === 'featured:true';
			const matching = posts.filter((p) => (p.featured ?? false) === flagged);
			return { posts: matching.slice(0, Number(params.limit)) } as T;
		};
		return { client, calls };
	}

	it('fills with the newest other posts when fewer than five are flagged', async () => {
		const { client, calls } = fakeGhost([
			post('flagged', { featured: true }),
			post('n1'),
			post('n2'),
			post('n3'),
			post('n4'),
			post('n5')
		]);
		const featured = await createGhostApi(client, new Cache()).featuredPosts();
		expect(featured.map((p) => p.slug)).toEqual(['flagged', 'n1', 'n2', 'n3', 'n4']);
		expect(calls.map((c) => [c.filter, c.limit, c.order])).toEqual([
			['featured:true', '5', 'published_at DESC'],
			['featured:false', '4', 'published_at DESC']
		]);
	});

	it('asks for no fill when five are flagged', async () => {
		const flagged = ['a', 'b', 'c', 'd', 'e'].map((slug) => post(slug, { featured: true }));
		const { client, calls } = fakeGhost(flagged);
		await createGhostApi(client, new Cache()).featuredPosts();
		expect(calls).toHaveLength(1);
	});
});
