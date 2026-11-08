import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { expectNoNewA11yViolations } from './a11y.ts';

test('home page renders', async ({ page }) => {
	const response = await page.goto('/');
	expect(response?.status()).toBe(200);
	await expect(page.getByRole('heading', { level: 1, name: 'Amun' })).toBeVisible();
	await expectNoNewA11yViolations(page, 'home');
});

test('blog index renders', async ({ page }) => {
	const response = await page.goto('/blog');
	expect(response?.status()).toBe(200);
	await expect(page.getByRole('heading', { level: 1, name: 'Field notes' })).toBeVisible();
	await expectNoNewA11yViolations(page, 'blog');
});

test('tools page renders', async ({ page }) => {
	const response = await page.goto('/tools');
	expect(response?.status()).toBe(200);
	// A link styled as a button (Pico's role="button" pattern).
	await expect(page.getByRole('button', { name: 'Open the translator' })).toBeVisible();
	await expectNoNewA11yViolations(page, 'tools');
});

test('translator page is prerendered, listing the standards but carrying no mapping data', async ({
	request
}) => {
	// The local build's files only when testing it, not a deployed site (BASE_URL).
	if (!process.env.BASE_URL) {
		expect(existsSync('build/prerendered/tools/pacenotes-translator.html')).toBe(true);
	}
	const response = await request.get('/tools/pacenotes-translator');
	expect(response.status()).toBe(200);
	const html = await response.text();
	// The calls arrive in the browser (e2e/translator.test.ts), so the HTML has no call fields.
	expect(html).not.toMatch(/aria-label="FilipekMod call for /);
	// The mapping data is private and absent from the public repository: no standards there.
	const standards = html.match(/<option value="[^"]+"/g)?.length ?? 0;
	if (existsSync('src/lib/pacenotes/data')) expect(standards).toBeGreaterThan(5);
	else expect(standards).toBe(0);
});

test('healthz answers ok and is never cached', async ({ request }) => {
	const response = await request.get('/healthz');
	expect(response.status()).toBe(200);
	expect(await response.text()).toBe('ok');
	expect(response.headers()['cache-control']).toBe('no-store');
});

test('unknown path renders the 404 page', async ({ page }) => {
	const response = await page.goto('/no-such-page');
	expect(response?.status()).toBe(404);
	await expect(page.getByText('404')).toBeVisible();
	await expectNoNewA11yViolations(page, 'not-found');
});
