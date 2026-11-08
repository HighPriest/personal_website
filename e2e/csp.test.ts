import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

// The Content Security Policy (vite.config.ts `csp`, hooks.server.ts): present on every page,
// and nothing the site does runs into it.

/** Records every CSP violation in the page, across navigations. */
async function violations(page: Page) {
	const seen: string[] = [];
	await page.exposeFunction('__csp', (entry: string) => seen.push(entry));
	await page.addInitScript(() => {
		document.addEventListener('securitypolicyviolation', (event) =>
			(window as unknown as { __csp: (entry: string) => void }).__csp(
				`${event.effectiveDirective} ${event.blockedURI} on ${location.pathname}`
			)
		);
	});
	return seen;
}

test('prerendered pages carry the policy in a meta tag, server-rendered ones in a header', async ({
	request
}) => {
	const prerendered = readFileSync('build/prerendered/index.html', 'utf8');
	expect(prerendered).toMatch(
		/<meta http-equiv="content-security-policy" content="[^"]*script-src 'self'/
	);

	const response = await request.get('/blog');
	const policy = response.headers()['content-security-policy'];
	expect(policy).toContain("default-src 'self'");
	// Umami is served from the site itself (/s/), so no other origin may run script or be called.
	expect(policy).toMatch(/script-src 'self'( 'sha256-[^']+')+;/);
	expect(policy).toContain("connect-src 'self';");
	expect(policy).toContain("frame-ancestors 'none'");
	// SvelteKit's own inline script and the early language redirect: two hashes.
	expect(policy.match(/'sha256-/g)?.length).toBeGreaterThanOrEqual(2);
});

test('the pages, a post, the players and the language redirect run without a violation', async ({
	page
}) => {
	const seen = await violations(page);
	await page
		.context()
		.route(/youtube-nocookie\.com/, (route) =>
			route.fulfill({ contentType: 'text/html', body: '<title>player</title>' })
		);

	// The early redirect script runs on an unprefixed address with a saved choice. A server-rendered
	// page gets the policy as a header, which covers the script from the first byte, so only its
	// hash lets it run. (On prerendered pages the policy's <meta> comes after the script.)
	await page
		.context()
		.addCookies([{ name: 'PARAGLIDE_LOCALE', value: 'pl', url: 'http://127.0.0.1:4173' }]);
	await page.goto('/blog');
	await page.waitForURL((url) => url.pathname === '/pl/blog');
	await page.context().clearCookies();

	for (const path of ['/', '/blog', '/tools/pacenotes-translator', '/no-such-page']) {
		await page.goto(path);
		await page.waitForLoadState('networkidle');
	}

	// A post with code, images and a click-to-load player.
	await page.goto('/blog/post/pilot-rajdowy-richard-burns-rally');
	await page.waitForLoadState('networkidle');
	await page.locator('a.kg-embed-facade').first().click();
	await expect(page.locator('iframe.kg-embed-player')).toBeAttached();

	// The landing page's video.
	await page.goto('/tools/virtual-codriver-installer');
	await page.waitForLoadState('networkidle');
	await page.getByRole('link', { name: /^Play the video/ }).click();
	await expect(page.locator('iframe[src*="youtube-nocookie.com"]')).toBeAttached();

	expect(seen).toEqual([]);
});
