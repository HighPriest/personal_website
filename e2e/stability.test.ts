import { expect, test, type Page } from '@playwright/test';
import {
	attachScreenshot,
	footerOverlaps,
	layoutShiftWhenIdle,
	navigateClientSide,
	recordLayoutShift,
	watchFooterOverlap
} from './stability.ts';

/** A path, or how to find one: the first post and tag linked from the blog index. */
const pages: [name: string, path: string | ((page: Page) => Promise<string>)][] = [
	['home', '/'],
	['blog', '/blog'],
	['tag', (page) => firstLink(page, '/blog/tag/')],
	['post', (page) => firstLink(page, '/blog/post/')],
	['tools', '/tools'],
	['translator', '/tools/pacenotes-translator'],
	['installer', '/tools/virtual-codriver-installer'],
	['not-found', '/no-such-page']
];

async function firstLink(page: Page, prefix: string) {
	await page.goto('/blog');
	const href = await page.locator(`a[href^="${prefix}"]`).first().getAttribute('href');
	expect(href, `a ${prefix} link on the blog index`).toBeTruthy();
	return href!;
}

for (const [name, target] of pages) {
	for (const scheme of ['dark', 'light'] as const) {
		for (const width of [375, 1280]) {
			test(`${name} at ${width} px (${scheme}) loads without layout shift`, async ({
				page
			}, testInfo) => {
				const path = typeof target === 'string' ? target : await target(page);
				await page.emulateMedia({ colorScheme: scheme });
				// Any error in the browser fails the page: the server can render HTML that the client
				// then fails to hydrate (it happened with duplicate keys in a list). Loads from other
				// origins are content, not the site: images missing on the Ghost server, or blocked
				// by the browser's private-network rules where amun.pl resolves to a local address.
				// The 404 page's own status is the point of that page.
				const errors: string[] = [];
				const origin = String(testInfo.project.use.baseURL);
				page.on('pageerror', (error) => errors.push(String(error)));
				page.on('console', (message) => {
					if (message.type() !== 'error') return;
					const resource =
						message.text().match(/https?:\/\/[^\s'"]+/)?.[0] ?? message.location().url;
					if (!resource.startsWith(origin)) return;
					const ownStatus = new URL(resource).pathname === path;
					if (message.text().startsWith('Failed to load resource') && ownStatus) return;
					errors.push(message.text());
				});

				await page.setViewportSize({ width, height: width < 768 ? 800 : 900 });
				await recordLayoutShift(page);
				// Fonts arrive late, as on a first visit over a real network: the text is first set in
				// the fallback faces, and the swap to the web fonts must not move the page.
				await page.route('**/*.woff2', async (route) => {
					await new Promise((resolve) => setTimeout(resolve, 400));
					await route.continue();
				});
				// Umami's tracker is served by the reverse proxy in front of the site,
				// not by the app, which would answer it with a 404.
				await page.route('**/s/script.js', (route) =>
					route.fulfill({ contentType: 'text/javascript', body: '' })
				);
				await page.goto(path);
				const cls = await layoutShiftWhenIdle(page);
				await attachScreenshot(page, testInfo, `${name}-${width}px-${scheme}`);
				expect(cls, 'cumulative layout shift from load until idle').toBeLessThanOrEqual(0.1);
				expect(errors, 'errors in the browser').toEqual([]);
			});
		}
	}
}

test('the footer never covers the page during or after client-side navigation', async ({
	page
}) => {
	await page.goto('/blog');
	await page.waitForLoadState('networkidle');
	await page.evaluate(
		() => ((window as Window & { __sameDocument?: boolean }).__sameDocument = true)
	);
	await watchFooterOverlap(page);

	// Across every area and back to where it started.
	for (const path of ['/tools', '/tools/pacenotes-translator', '/', '/blog']) {
		await navigateClientSide(page, path);
		await page.waitForTimeout(1000); // longer than any transition
	}

	const sameDocument = await page.evaluate(
		() => (window as Window & { __sameDocument?: boolean }).__sameDocument
	);
	expect(sameDocument, 'navigation stayed client-side (no full reload)').toBe(true);
	expect(await footerOverlaps(page)).toEqual([]);
});
