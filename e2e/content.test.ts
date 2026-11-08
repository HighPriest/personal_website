import { expect, test } from '@playwright/test';

// Post content against the Ghost mock (e2e/ghost-mock.ts): highlighting, the media cache and the
// click-to-load embeds (#lib/server/ghost/content.ts).
const CODE_POST = '/blog/post/running-svelte-5-projects-using-deno-in-2024';
const BOOKMARK_POST = '/blog/post/working-on-windows-with-keyboard-only';
const VIDEO_POST = '/blog/post/pilot-rajdowy-richard-burns-rally';

test('code blocks are highlighted on the server, in the theme colours', async ({ page }) => {
	await page.goto(CODE_POST);
	const blocks = page.locator('article pre.shiki');
	expect(await blocks.count()).toBeGreaterThan(5);
	await expect(blocks.first().locator('span[style*="--code-token-"]').first()).toBeAttached();
});

test("bookmark images are the site's own or come from the media cache, and load", async ({
	page
}) => {
	await page.goto(BOOKMARK_POST);
	const sources = await page
		.locator('.kg-bookmark-card img')
		.evaluateAll((images) => images.map((img) => img.getAttribute('src')!));
	const cached = /^\/blog\/media\/[0-9a-f]{24}$/;
	expect(sources.filter((src) => !cached.test(src) && !src.startsWith('https://amun.pl/'))).toEqual(
		[]
	);
	// The fixtures' third-party images are the mock's 1×1 pixel (scripts/record-ghost-fixtures.mjs).
	const images = page.locator('.kg-bookmark-card img[src^="/blog/media/"]');
	expect(await images.count()).toBeGreaterThan(0);
	for (const image of await images.all()) {
		await image.scrollIntoViewIfNeeded();
		await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1);
	}
});

test('the media route serves registered images only, sandboxed and cacheable', async ({
	page,
	request
}) => {
	expect((await request.get('/blog/media/0123456789abcdef01234567')).status()).toBe(404);

	await page.goto(BOOKMARK_POST);
	const src = await page.locator('img[src^="/blog/media/"]').first().getAttribute('src');
	const response = await request.get(src!);
	expect(response.status()).toBe(200);
	expect(response.headers()).toMatchObject({
		'content-type': 'image/png',
		'cache-control': 'public, max-age=604800',
		'x-content-type-options': 'nosniff',
		'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox"
	});
});

test('a video post asks no third party for anything until the visitor plays the video', async ({
	page,
	baseURL
}) => {
	const hosts = new Set<string>();
	page.on('request', (request) => hosts.add(new URL(request.url()).host));
	await page.route('https://www.youtube-nocookie.com/**', (route) =>
		route.fulfill({ contentType: 'text/html', body: '<title>player</title>' })
	);

	await page.goto(VIDEO_POST);
	await page.waitForLoadState('networkidle');
	const own = new URL(baseURL!).host;
	// The site's own hosts only: the app (analytics included, under /s/) and Ghost's images on amun.pl.
	const firstParty = new Set([own, 'amun.pl']);
	expect([...hosts].filter((host) => !firstParty.has(host))).toEqual([]);

	const facade = page.locator('a.kg-embed-facade').first();
	await expect(facade).toHaveAttribute('href', /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/);
	await expect(facade.locator('img')).toHaveAttribute('src', /^\/blog\/media\/[0-9a-f]{24}$/);
	await facade.click();

	const player = page.locator('iframe.kg-embed-player');
	await expect(player).toHaveAttribute(
		'src',
		/^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}\?autoplay=1$/
	);
	await expect(player).toBeFocused();
	await expect(facade).toHaveCount(0);
});
