import { readFileSync } from 'node:fs';
import { expect, test, type APIRequestContext } from '@playwright/test';

// What crawlers and link previews read: the sitemap, and each page's head as
// the server sends it. The pages come from the sitemap, so these checks cover every page it lists.
const SITE = 'https://amun.pl';
const STATIC_PAGES = 5; // src/lib/seo.ts STATIC_ROUTES (unit-tested against src/routes)
const LOCALES = ['en', 'pl', 'de'];

type FixturePost = { slug: string; title: string; tags: { slug: string; visibility?: string }[] };
const fixture: FixturePost[] = JSON.parse(
	readFileSync(new URL('./fixtures/ghost/posts.json', import.meta.url), 'utf8')
);
const fixtureTags = new Set(
	fixture.flatMap((post) =>
		post.tags.filter((tag) => tag.visibility !== 'internal').map((tag) => tag.slug)
	)
);

const local = (loc: string) => new URL(loc).pathname;

async function sitemap(request: APIRequestContext) {
	const response = await request.get('/sitemap.xml');
	expect(response.status()).toBe(200);
	return { response, xml: await response.text() };
}

/** The head tags this suite checks, read from the server's HTML. */
function head(html: string) {
	const all = (pattern: RegExp) => [...html.matchAll(pattern)];
	const meta = (attribute: 'property' | 'name', key: string) =>
		all(new RegExp(`<meta ${attribute}="${key}" content="([^"]*)"`, 'g')).map((match) => match[1]);
	return {
		canonical: all(/<link rel="canonical" href="([^"]+)"/g).map((match) => match[1]),
		alternates: all(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g).map(
			([, hreflang, href]) => ({ hreflang, href })
		),
		og: (key: string) => meta('property', `og:${key}`),
		twitter: meta('name', 'twitter:card'),
		jsonLd: all(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g).map((match) =>
			JSON.parse(match[1])
		)
	};
}

test('the sitemap lists every page in every locale, every tag page and every post', async ({
	request,
	page
}) => {
	const { response, xml } = await sitemap(request);
	expect(response.headers()['content-type']).toBe('application/xml; charset=utf-8');
	expect(response.headers()['cache-control']).toBe('public, max-age=3600');

	await page.goto('/');
	const parsed = await page.evaluate((text) => {
		const document = new DOMParser().parseFromString(text, 'application/xml');
		return {
			error: document.querySelector('parsererror')?.textContent ?? null,
			locs: [...document.getElementsByTagName('loc')].map((loc) => loc.textContent!)
		};
	}, xml);
	expect(parsed.error).toBeNull();
	expect(xml).not.toContain('/prerendered');

	const { locs } = parsed;
	expect(locs.every((loc) => loc.startsWith(`${SITE}/`))).toBe(true);
	expect(locs).toHaveLength((STATIC_PAGES + fixtureTags.size) * LOCALES.length + fixture.length);
	for (const tag of fixtureTags) {
		for (const prefix of ['', '/pl', '/de']) {
			expect(locs).toContain(`${SITE}${prefix}/blog/tag/${tag}`);
		}
	}
	for (const post of fixture) expect(locs).toContain(`${SITE}/blog/post/${post.slug}`);
});

test('every page in the sitemap answers, with its canonical, alternates and preview tags', async ({
	request
}) => {
	const { xml } = await sitemap(request);
	const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

	for (const loc of locs) {
		const response = await request.get(local(loc), { maxRedirects: 0 });
		expect(response.status(), loc).toBe(200);
		const tags = head(await response.text());
		const post = loc.includes('/blog/post/');

		expect(tags.canonical, loc).toEqual([loc]);
		expect(tags.og('url'), loc).toEqual([loc]);
		expect(tags.og('title')[0], loc).toBeTruthy();
		expect(tags.og('description')[0], loc).toBeTruthy();
		expect(tags.og('image')[0], loc).toMatch(/^https:\/\//);
		expect(tags.og('type'), loc).toEqual([post ? 'article' : 'website']);
		expect(tags.twitter, loc).toHaveLength(1);

		if (post) {
			expect(tags.alternates, loc).toEqual([]);
		} else {
			// The same page in each locale, plus x-default at the unprefixed address.
			expect(
				tags.alternates.map((alternate) => alternate.hreflang),
				loc
			).toEqual([...LOCALES, 'x-default']);
			expect(locs, loc).toEqual(
				expect.arrayContaining(tags.alternates.map((alternate) => alternate.href))
			);
			expect(tags.alternates.map((alternate) => alternate.href)).toContain(loc);
		}
	}
});

test("a post in another locale points at the post's one address, with structured data", async ({
	request
}) => {
	const [post] = fixture;
	for (const prefix of ['/pl', '/de']) {
		const tags = head(await (await request.get(`${prefix}/blog/post/${post.slug}`)).text());
		expect(tags.canonical).toEqual([`${SITE}/blog/post/${post.slug}`]);
		expect(tags.alternates).toEqual([]);
		expect(tags.jsonLd).toHaveLength(1);
		expect(tags.jsonLd[0]).toMatchObject({
			'@type': 'BlogPosting',
			headline: post.title,
			mainEntityOfPage: `${SITE}/blog/post/${post.slug}`
		});
	}
});

test('error pages ask not to be indexed', async ({ request }) => {
	const response = await request.get('/no-such-page');
	expect(response.status()).toBe(404);
	expect(await response.text()).toContain('<meta name="robots" content="noindex"');
});

test('the build leaves no generated sitemap behind (the route serves it)', () => {
	expect(() => readFileSync('build/client/sitemap.xml')).toThrow();
	expect(() => readFileSync('build/sitemap.xml')).toThrow();
});
