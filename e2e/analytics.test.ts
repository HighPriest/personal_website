import { expect, test, type Page } from '@playwright/test';

// Umami (src/lib/components/Analytics.svelte) against a stand-in for its script: it reports
// each call through a function the test exposes (which survives navigations), and records
// clicks on [data-umami-event] elements the way the real tracker does.
type Call = { name?: string; data?: Record<string, string>; url?: string };

const TRACKER = `
	window.umami = {
		track(event, data) {
			const call = typeof event === 'function' ? event({}) : { name: event, data };
			window.__umami(call);
		}
	};
	document.addEventListener('click', (event) => {
		const element = event.target.closest('[data-umami-event]');
		if (!element) return;
		const data = {};
		for (const name of element.getAttributeNames()) {
			const match = name.match(/^data-umami-event-([\\w-]+)$/);
			if (match) data[match[1]] = element.getAttribute(name);
		}
		window.umami.track(element.getAttribute('data-umami-event'), data);
	}, true);
`;

async function withUmami(page: Page) {
	const calls: Call[] = [];
	await page.exposeFunction('__umami', (call: Call) => calls.push(call));
	await page
		.context()
		.route('**/s/script.js', (route) =>
			route.fulfill({ contentType: 'text/javascript', body: TRACKER })
		);
	// Followed links (new tabs or not) load nothing real.
	await page
		.context()
		.route(/github\.com|ko-fi\.com|youtube\.com|linkedin\.com|discord\.gg|t\.me/, (route) =>
			route.fulfill({ contentType: 'text/html', body: '<title>away</title>' })
		);
	return calls;
}

const pageViews = (calls: Call[]) => calls.filter((call) => !call.name).map((call) => call.url);

test('one page view on arrival and one per client-side navigation, with no reload', async ({
	page
}) => {
	const calls = await withUmami(page);
	await page.goto('/tools');
	await page.waitForLoadState('networkidle');
	await expect.poll(() => pageViews(calls)).toEqual(['/tools']);

	await page.evaluate(() => ((window as unknown as { marker: number }).marker = 1));
	await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Blog' }).click();
	await page.waitForURL((url) => url.pathname === '/blog');
	await expect.poll(() => pageViews(calls)).toEqual(['/tools', '/blog']);
	// The same document: the navigation was client-side, not a reload.
	expect(await page.evaluate(() => (window as unknown as { marker?: number }).marker)).toBe(1);
});

test('the contact channels report as contact events, by channel and place', async ({ page }) => {
	const calls = await withUmami(page);
	await page.goto('/');
	await page.waitForLoadState('networkidle');
	const contact = page.locator('[data-door="contact"]');
	await contact.hover();
	await Promise.all([
		page.waitForEvent('popup'),
		contact.getByRole('link', { name: 'Telegram' }).click()
	]);

	await page.goto('/tools');
	await page.waitForLoadState('networkidle');
	const footer = page.locator('body > app > footer');
	await Promise.all([
		page.waitForEvent('popup'),
		footer.getByRole('link', { name: 'Telegram' }).click()
	]);
	await Promise.all([
		page.waitForEvent('popup'),
		footer.getByRole('link', { name: 'GitHub' }).click()
	]);

	const events = calls.filter((call) => call.name);
	expect(events).toEqual([
		{ name: 'contact', data: { channel: 'telegram', place: 'door' } },
		{ name: 'contact', data: { channel: 'telegram', place: 'footer' } },
		{ name: 'outbound', data: { target: 'github' } }
	]);
});

test('the installer download and the Ko-fi order report as outbound links', async ({ page }) => {
	const calls = await withUmami(page);
	await page.goto('/tools/virtual-codriver-installer');
	await page.waitForLoadState('networkidle');
	const own = page.getByRole('button', { name: 'Order your co-driver on Ko-fi' });
	await own.evaluate((link) => link.setAttribute('target', '_blank')); // stay on the page
	await Promise.all([page.waitForEvent('popup'), own.click()]);
	await page.getByRole('button', { name: 'Download the installer' }).first().click();
	await expect
		.poll(() => calls.filter((call) => call.name))
		.toEqual([
			{ name: 'outbound', data: { target: 'ko-fi' } },
			{ name: 'outbound', data: { target: 'installer-download' } }
		]);
});
