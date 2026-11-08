/**
 * A stand-in for the Ghost Content API, so the e2e suite never depends on the live site. It
 * serves the recorded posts in e2e/fixtures/ghost/posts.json (scripts/record-ghost-fixtures.mjs)
 * and answers the queries #lib/server/ghost makes: posts filtered by featured flag or tag, a
 * post by slug, and the tags with their counts.
 *
 * - One older post is flagged as featured, to exercise the featured section's ordering.
 * - /external/<host>/<path> stands in for every third-party image (the media cache's sources).
 * - The slug `ghost-is-down` drops the connection, as an unreachable Ghost would (503 test).
 */
import { readFileSync } from 'node:fs';
import { createServer, type ServerResponse } from 'node:http';
import { DOWN_SLUG, FLAGGED, MOCK_KEY, MOCK_PORT } from './ghost-fixture.ts';

type FixturePost = {
	slug: string;
	published_at: string;
	featured: boolean | null;
	tags: { slug: string; name: string; visibility?: string }[];
	[field: string]: unknown;
};

const posts: FixturePost[] = (
	JSON.parse(
		readFileSync(new URL('./fixtures/ghost/posts.json', import.meta.url), 'utf8')
	) as FixturePost[]
)
	.map((post) => ({ ...post, featured: post.slug === FLAGGED }))
	.sort((a, b) => b.published_at.localeCompare(a.published_at));

function send(response: ServerResponse, status: number, body: unknown) {
	response.writeHead(status, { 'content-type': 'application/json' });
	response.end(JSON.stringify(body));
}

/** A 1×1 PNG: every third-party image in the fixtures (scripts/record-ghost-fixtures.mjs). */
const PIXEL = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
	'base64'
);

const server = createServer((request, response) => {
	const url = new URL(request.url ?? '/', 'http://mock');
	if (url.pathname.startsWith('/external/')) {
		response.writeHead(200, { 'content-type': 'image/png' });
		return response.end(PIXEL);
	}
	if (url.searchParams.get('key') !== MOCK_KEY) return send(response, 401, { errors: [] });
	const path = url.pathname.replace(/^\/ghost\/api\/content\//, '');

	const bySlug = path.match(/^posts\/slug\/([^/]+)\/$/);
	if (bySlug) {
		if (bySlug[1] === DOWN_SLUG) return request.socket.destroy();
		const post = posts.find((candidate) => candidate.slug === bySlug[1]);
		return post ? send(response, 200, { posts: [post] }) : send(response, 404, { errors: [] });
	}

	if (path === 'posts/') {
		const filter = url.searchParams.get('filter') ?? '';
		const page = Number(url.searchParams.get('page') ?? 1);
		const fields = url.searchParams.get('fields')?.split(',');
		const matching = posts.filter((post) => {
			if (filter === 'featured:true') return post.featured;
			if (filter === 'featured:false') return !post.featured;
			if (filter.startsWith('tag:')) return post.tags.some((tag) => tag.slug === filter.slice(4));
			return true;
		});
		const limit =
			url.searchParams.get('limit') === 'all'
				? Math.max(1, matching.length)
				: Number(url.searchParams.get('limit') ?? 15);
		const pick = (post: FixturePost) =>
			fields ? Object.fromEntries(fields.map((field) => [field, post[field]])) : post;
		return send(response, 200, {
			posts: matching.slice((page - 1) * limit, page * limit).map(pick),
			meta: {
				pagination: {
					page,
					limit,
					pages: Math.max(1, Math.ceil(matching.length / limit)),
					total: matching.length
				}
			}
		});
	}

	if (path === 'tags/') {
		const counts = new Map<string, { slug: string; name: string; count: { posts: number } }>();
		for (const tag of posts.flatMap((post) => post.tags)) {
			if (tag.visibility === 'internal') continue;
			const entry = counts.get(tag.slug) ?? { slug: tag.slug, name: tag.name, count: { posts: 0 } };
			entry.count.posts++;
			counts.set(tag.slug, entry);
		}
		const tags = [...counts.values()].sort((a, b) => b.count.posts - a.count.posts);
		return send(response, 200, { tags });
	}

	send(response, 404, { errors: [] });
});

server.listen(MOCK_PORT, '127.0.0.1', () => process.stdout.write(`Ghost mock on ${MOCK_PORT}\n`));
