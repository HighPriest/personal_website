import { expect, test, type Page } from '@playwright/test';

// The self-hosted fonts (src/lib/styles/fonts.scss) and the third parties the old site used.

/** The fonts the page downloaded, by file name, with their transfer size. */
function fontTransfers(page: Page) {
	return page.evaluate(() =>
		performance
			.getEntriesByType('resource')
			.filter((entry) => entry.name.endsWith('.woff2'))
			.map((entry) => ({
				file: new URL(entry.name).pathname.split('/').pop()!,
				bytes: (entry as PerformanceResourceTiming).transferSize
			}))
	);
}

test('the home page uses the design fonts, within 120 KB of font downloads', async ({ page }) => {
	await page.goto('/');
	await page.waitForLoadState('networkidle');
	await page.evaluate(() => document.fonts.ready);
	for (const font of [
		'600 1em "Chakra Petch"',
		'400 1em "IBM Plex Sans"',
		'600 1em "JetBrains Mono"'
	]) {
		expect(await page.evaluate((spec) => document.fonts.check(spec), font), font).toBe(true);
	}
	const fonts = await fontTransfers(page);
	expect(fonts.length).toBeGreaterThan(0);
	expect(fonts.every((font) => font.file.includes('-latin-'))).toBe(true);
	const total = fonts.reduce((sum, font) => sum + font.bytes, 0);
	expect(total).toBeLessThanOrEqual(120 * 1024);
});

test('a Polish page also loads the latin-ext faces for its letters', async ({ page }) => {
	await page.goto('/pl/tools');
	await page.waitForLoadState('networkidle');
	await page.evaluate(() => document.fonts.ready);
	const fonts = await fontTransfers(page);
	expect(fonts.some((font) => font.file.includes('-latin-ext-'))).toBe(true);
});

test('no page asks codepen or cdnjs for anything', async ({ page }) => {
	const thirdParty: string[] = [];
	page.on('request', (request) => {
		const host = new URL(request.url()).host;
		if (host === 'assets.codepen.io' || host === 'cdnjs.cloudflare.com') {
			thirdParty.push(request.url());
		}
	});
	for (const path of [
		'/',
		'/blog',
		'/tools',
		'/tools/pacenotes-translator',
		'/tools/virtual-codriver-installer'
	]) {
		await page.goto(path);
		await page.waitForLoadState('networkidle');
	}
	expect(thirdParty).toEqual([]);
});
