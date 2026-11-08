import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { DOWN_SLUG, FLAGGED } from './ghost-fixture.ts';

// The blog against the Ghost mock (e2e/ghost-mock.ts), which serves the recorded posts.
type FixturePost = {
	slug: string;
	title: string;
	published_at: string;
	tags: { slug: string }[];
};
const fixture: FixturePost[] = JSON.parse(
	readFileSync(new URL('./fixtures/ghost/posts.json', import.meta.url), 'utf8')
);
const newestFirst = fixture.toSorted((a, b) => b.published_at.localeCompare(a.published_at));

/** The post slugs the page's cards link to, in order. */
async function cardSlugs(page: Page) {
	const hrefs = await page
		.locator('main a[href^="/blog/post/"]')
		.evaluateAll((links) => links.map((link) => link.getAttribute('href')!));
	return [...new Set(hrefs.map((href) => href.replace('/blog/post/', '')))];
}

test('the featured section shows the flagged post, then the four newest others', async ({
	page
}) => {
	await page.goto('/blog');
	const others = newestFirst.filter((post) => post.slug !== FLAGGED).slice(0, 4);
	expect(await cardSlugs(page)).toEqual([FLAGGED, ...others.map((post) => post.slug)]);
});

test("a tag page lists that tag's posts, newest first", async ({ page }) => {
	await page.goto('/blog/tag/simracing');
	const tagged = newestFirst.filter((post) => post.tags.some((tag) => tag.slug === 'simracing'));
	expect(await cardSlugs(page)).toEqual(tagged.map((post) => post.slug));
});

test('a post page renders the post', async ({ page }) => {
	const [post] = newestFirst;
	const response = await page.goto(`/blog/post/${post.slug}`);
	expect(response?.status()).toBe(200);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(post.title);
	await expect(page.locator('article p').first()).toBeVisible();
});

for (const path of ['/blog/tag/no-such-tag', '/blog/post/no-such-post', '/blog/post/Not_A_Slug']) {
	test(`${path} is a 404`, async ({ page }) => {
		const response = await page.goto(path);
		expect(response?.status()).toBe(404);
	});
}

test('an unreachable Ghost with nothing cached gives a 503 page', async ({ page }) => {
	const response = await page.goto(`/blog/post/${DOWN_SLUG}`);
	expect(response?.status()).toBe(503);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('503');
	await expect(page.getByText("The blog can't be reached right now")).toBeVisible();
});

test('blog responses may be cached for a minute', async ({ request }) => {
	for (const path of ['/blog', '/blog/tag/simracing', `/blog/post/${newestFirst[0].slug}`]) {
		const response = await request.get(path);
		expect(response.headers()['cache-control'], path).toBe(
			'public, max-age=60, stale-while-revalidate=600'
		);
	}
});

test('no Ghost client or content processing ships to the browser', () => {
	const files = readdirSync('build/client', { recursive: true, encoding: 'utf8' })
		.filter((file) => file.endsWith('.js'))
		.map((file) => readFileSync(join('build/client', file), 'utf8'));
	expect(files.length).toBeGreaterThan(0);
	for (const marker of [
		'@ts-ghost',
		'ZodError',
		'ghost/api/content',
		'source.powershell',
		'eof-in-tag'
	]) {
		expect(
			files.some((source) => source.includes(marker)),
			marker
		).toBe(false);
	}
});
