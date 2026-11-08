// Records the e2e suite's Ghost fixtures from a live Ghost (public posts only), so the browser
// tests run against a local mock instead of the live site. Re-run when the fixtures should change:
//   node --env-file=.env scripts/record-ghost-fixtures.mjs
import { writeFileSync } from 'node:fs';
import { MOCK_PORT } from '../e2e/ghost-fixture.ts';

const { GHOST_URL, GHOST_CONTENT_KEY } = process.env;
if (!GHOST_URL || !GHOST_CONTENT_KEY) throw new Error('Set GHOST_URL and GHOST_CONTENT_KEY');

const url = new URL(
	'ghost/api/content/posts/',
	GHOST_URL.endsWith('/') ? GHOST_URL : `${GHOST_URL}/`
);
url.searchParams.set('key', GHOST_CONTENT_KEY);
url.searchParams.set('limit', '8');
url.searchParams.set('order', 'published_at DESC');
url.searchParams.set('include', 'tags,authors');
const response = await fetch(url, { headers: { 'Accept-Version': 'v5.0' } });
if (!response.ok) throw new Error(`Ghost answered ${response.status}`);
const { posts } = await response.json();

// Keep only the fields the blog reads (src/lib/server/ghost/dto.ts).
const fields = [
	'slug',
	'title',
	'excerpt',
	'custom_excerpt',
	'feature_image',
	'feature_image_alt',
	'published_at',
	'updated_at',
	'reading_time',
	'featured',
	'html'
];
// Third-party images (bookmark thumbnails and icons) point at the mock instead, so the media
// cache is tested without the internet: http://127.0.0.1:<port>/external/<host>/<path>.
const site = new URL(GHOST_URL).host;
const offline = (html) =>
	html?.replace(/(<img[^>]*\ssrc=")https?:\/\/([^/"]+)([^"]*)"/g, (tag, start, host, path) =>
		host === site ? tag : `${start}http://127.0.0.1:${MOCK_PORT}/external/${host}${path}"`
	);

const recorded = posts.map((post) => ({
	...Object.fromEntries(fields.map((field) => [field, post[field] ?? null])),
	html: offline(post.html),
	tags: post.tags.map(({ slug, name, visibility }) => ({ slug, name, visibility })),
	authors: post.authors.map(({ name }) => ({ name }))
}));
writeFileSync(
	new URL('../e2e/fixtures/ghost/posts.json', import.meta.url),
	`${JSON.stringify(recorded, null, '\t')}\n`
);
process.stdout.write(`Recorded ${recorded.length} posts\n`);
