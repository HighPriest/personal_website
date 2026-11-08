import { expect, test } from '@playwright/test';

/** The shell around every page: skip link, error page, loading sign, language menu, motion. */

test('the skip link is the first stop and moves focus to the content', async ({ page }) => {
	await page.goto('/blog');
	await page.keyboard.press('Tab');
	const skip = page.getByRole('link', { name: 'Skip to content' });
	await expect(skip).toBeFocused();
	await expect(skip).toBeInViewport();
	await page.keyboard.press('Enter');
	await expect(page.locator('main#content')).toBeFocused();
});

test('an unknown address renders the error page in the shell', async ({ page }) => {
	const response = await page.goto('/no-such-page');
	expect(response?.status()).toBe(404);
	await expect(page).toHaveTitle('404 · Amun');
	await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible();
	await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
	await expect(page.getByRole('link', { name: /Back to the start/ })).toHaveAttribute('href', '/');
});

/** Records whether the pyramid ever showed as the loading sign. */
async function watchLoadingSign(page: import('@playwright/test').Page) {
	await page.evaluate(() => {
		const w = window as Window & { __loadingSeen?: boolean };
		w.__loadingSeen = false;
		const pyramid = document.querySelector('.pyr')!;
		new MutationObserver(() => {
			if (pyramid.classList.contains('loading')) w.__loadingSeen = true;
		}).observe(pyramid, { attributes: true, attributeFilter: ['class'] });
	});
	return () => page.evaluate(() => (window as Window & { __loadingSeen?: boolean }).__loadingSeen);
}

test('the pyramid shows as the loading sign on a slow navigation only', async ({ page }) => {
	await page.goto('/tools');
	await page.waitForLoadState('networkidle');
	const loadingSeen = await watchLoadingSign(page);

	// Fast: the installer page needs no data, and hovering its link preloads its code (the
	// site preloads on hover), so the navigation itself takes no time.
	const installer = page.getByRole('link', { name: /About the installer/ });
	await installer.hover();
	await page.waitForLoadState('networkidle');
	await installer.click();
	await page.waitForURL((url) => url.pathname === '/tools/virtual-codriver-installer');
	expect(await loadingSeen()).toBe(false);

	// Slow: the blog's data (a server load) arrives after a second.
	await page.route('**/blog/__data.json*', async (route) => {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		await route.continue();
	});
	await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Blog' }).click();
	await expect(page.locator('.pyr')).toHaveClass(/\bloading\b/);
	await page.waitForURL((url) => url.pathname === '/blog');
	await expect(page.locator('.pyr')).not.toHaveClass(/\bloading\b/);
	expect(await loadingSeen()).toBe(true);
});

test('the language menu opens, links to this page in each language, and closes on Escape', async ({
	page
}) => {
	await page.goto('/blog');
	// The menu opens natively before hydration, but Escape needs the page's script.
	await page.waitForLoadState('networkidle');
	const summary = page.locator('summary', { hasText: 'Language: English' });
	const menu = page.locator('details', { has: summary });
	await summary.click();
	await expect(menu).toHaveAttribute('open', '');
	await expect(menu.getByRole('link', { name: /Polski/ })).toHaveAttribute('href', '/pl/blog');
	await expect(menu.getByRole('link', { name: /Deutsch/ })).toHaveAttribute('href', '/de/blog');
	await expect(menu.getByRole('link', { name: /English/ })).toHaveAttribute('aria-current', 'true');
	await page.keyboard.press('Escape');
	await expect(menu).not.toHaveAttribute('open', '');
});

test('nothing animates with reduced motion', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	for (const path of ['/', '/blog', '/tools/pacenotes-translator']) {
		await page.goto(path);
		await page.waitForTimeout(300);
		const running = await page.evaluate(() =>
			document.getAnimations().map((animation) => (animation as CSSAnimation).animationName)
		);
		expect(running, `animations on ${path}`).toEqual([]);
	}
});
