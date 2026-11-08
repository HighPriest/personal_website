import { expect, test, type Page } from '@playwright/test';
import { expectNoNewA11yViolations } from './a11y.ts';

/**
 * Language switching: the address decides the language, a choice in the
 * menu is remembered, and unprefixed addresses follow the saved or the browser's language.
 */

const titles = {
	blog: { en: 'Field notes', pl: 'Notatki z warsztatu', de: 'Feldnotizen' },
	tools: { en: 'Rally tools', pl: 'Narzędzia rajdowe', de: 'Rallye-Werkzeuge' }
};
const menuLabel = { en: 'Language: English', pl: 'Język: Polski', de: 'Sprache: Deutsch' };
const languageName = { en: 'English', pl: 'Polski', de: 'Deutsch' };
type Locale = keyof typeof menuLabel;

async function openMenu(page: Page, current: Locale) {
	await page.locator('summary', { hasText: menuLabel[current] }).click();
}

async function choose(page: Page, current: Locale, target: Locale) {
	await openMenu(page, current);
	await page.getByRole('link', { name: new RegExp(`^${languageName[target]}`) }).click();
}

/** Marks the document, so a full reload (which loses the mark) can be detected. */
const markDocument = (page: Page) =>
	page.evaluate(() => ((window as Window & { __mark?: boolean }).__mark = true));
const sameDocument = (page: Page) =>
	page.evaluate(() => (window as Window & { __mark?: boolean }).__mark === true);

test('every locale is prerendered in its own language', async ({ request }) => {
	for (const [path, lang, text] of [
		['/pl', 'pl', 'Technologia i tworzenie oprogramowania'],
		['/de', 'de', 'Technik und Softwareentwicklung'],
		['/pl/blog', 'pl', titles.blog.pl],
		['/de/tools', 'de', titles.tools.de]
	]) {
		const html = await (await request.get(path)).text();
		expect(html, path).toContain(`<html lang="${lang}"`);
		expect(html, path).toContain(text);
	}
});

for (const [area, path] of [
	['blog', '/blog'],
	['tools', '/tools']
] as const) {
	test(`switching languages on ${path} stays on the page, without a reload`, async ({ page }) => {
		await page.goto(path);
		await page.waitForLoadState('networkidle');
		await markDocument(page);
		for (const [from, to] of [
			['en', 'pl'],
			['pl', 'de'],
			['de', 'en']
		] as const) {
			await choose(page, from, to);
			const expected = to === 'en' ? path : `/${to}${path}`;
			await page.waitForURL((url) => url.pathname === expected);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(titles[area][to]);
			await expect(page.locator('html')).toHaveAttribute('lang', to);
		}
		expect(await sameDocument(page), 'no full reload').toBe(true);
	});
}

test('switching on a post keeps the post and translates the interface', async ({ page }) => {
	await page.goto('/blog');
	const post = await page.locator('a[href^="/blog/post/"]').first().getAttribute('href');
	await page.goto(post!);
	await page.waitForLoadState('networkidle');
	await choose(page, 'en', 'pl');
	await page.waitForURL((url) => url.pathname === `/pl${post}`);
	await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
	await expect(page.getByRole('navigation', { name: 'Menu główne' })).toBeVisible();
});

test('the menu works by keyboard alone', async ({ page }) => {
	await page.goto('/tools');
	await page.waitForLoadState('networkidle');
	await page.locator('summary', { hasText: menuLabel.en }).focus();
	await page.keyboard.press('Enter');
	await page.keyboard.press('Tab'); // English
	await page.keyboard.press('Tab'); // Polski
	await expect(page.getByRole('link', { name: /^Polski/ })).toBeFocused();
	await page.keyboard.press('Enter');
	await page.waitForURL((url) => url.pathname === '/pl/tools');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(titles.tools.pl);
});

test.describe('on a touch screen', () => {
	test.use({ viewport: { width: 375, height: 800 }, hasTouch: true, isMobile: true });

	test('the menu works by tap', async ({ page }) => {
		await page.goto('/blog');
		await page.waitForLoadState('networkidle');
		await page.locator('summary', { hasText: menuLabel.en }).tap();
		await page.getByRole('link', { name: /^Deutsch/ }).tap();
		await page.waitForURL((url) => url.pathname === '/de/blog');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(titles.blog.de);
	});
});

test('a choice in the menu is remembered for unprefixed addresses', async ({ page, context }) => {
	await page.goto('/blog');
	await page.waitForLoadState('networkidle');
	await choose(page, 'en', 'pl');
	await page.waitForURL((url) => url.pathname === '/pl/blog');
	const cookie = (await context.cookies()).find((c) => c.name === 'PARAGLIDE_LOCALE');
	expect(cookie?.value).toBe('pl');

	await page.goto('/tools');
	await page.waitForURL((url) => url.pathname === '/pl/tools');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(titles.tools.pl);
});

test.describe('a first visit with a German browser', () => {
	test.use({ locale: 'de-DE' });

	test('goes to German', async ({ page }) => {
		await page.goto('/blog');
		await page.waitForURL((url) => url.pathname === '/de/blog');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(titles.blog.de);
	});

	test('stays in English once English was chosen', async ({ page, context, baseURL }) => {
		await context.addCookies([{ name: 'PARAGLIDE_LOCALE', value: 'en', url: baseURL! }]);
		await page.goto('/blog');
		await page.waitForLoadState('networkidle');
		expect(new URL(page.url()).pathname).toBe('/blog');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(titles.blog.en);
	});
});

for (const locale of ['pl', 'de'] as const) {
	for (const [name, path] of [
		['home', ''],
		['blog', '/blog'],
		['tools', '/tools']
	]) {
		test(`axe passes on ${name} in ${locale}`, async ({ page }) => {
			await page.goto(`/${locale}${path}`);
			await page.waitForLoadState('networkidle');
			await expectNoNewA11yViolations(page, `${name}-${locale}`);
		});
	}
}
