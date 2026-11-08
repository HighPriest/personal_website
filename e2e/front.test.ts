import { expect, test, type Locator, type Page } from '@playwright/test';

/** The front page's hidden doors (src/lib/components/front/Door.svelte) and its shell rules. */

const door = (page: Page, name: string) => page.locator(`[data-door="${name}"]`);
const cardOpacity = (target: Locator) =>
	target.locator('[data-card]').evaluate((card) => Number(getComputedStyle(card).opacity));

test.describe('with a mouse', () => {
	test.use({ viewport: { width: 1280, height: 900 } });

	test('hovering a door reveals its card, and a click follows the link', async ({ page }) => {
		await page.goto('/');
		const blog = door(page, 'blog');
		expect(await cardOpacity(blog)).toBe(0);
		await blog.hover();
		await expect.poll(() => cardOpacity(blog)).toBe(1);
		await blog.locator('[data-card]').click();
		await page.waitForURL((url) => url.pathname === '/blog');
	});

	test('the dock waits below the edge until the pointer comes near the bottom', async ({
		page
	}) => {
		await page.goto('/');
		// The pointer is tracked once the page has hydrated.
		await page.waitForLoadState('networkidle');
		const dock = page.getByRole('navigation', { name: 'Main' });
		await page.mouse.move(640, 300);
		await expect.poll(() => dock.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
		await page.mouse.move(640, 880);
		await expect.poll(() => dock.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
	});

	test('the front page has no footer, other pages do', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('body > app > footer')).toHaveCount(0);
		await page.goto('/tools');
		await expect(page.locator('body > app > footer')).toHaveCount(1);
	});
});

test('Tab moves through the doors left to right, revealing each, and Enter follows', async ({
	page
}) => {
	await page.goto('/');
	await page.keyboard.press('Tab'); // the skip link
	await page.keyboard.press('Tab');
	const tools = door(page, 'tools'); // Simracing, on the left
	await expect(tools).toBeFocused();
	await expect.poll(() => cardOpacity(tools)).toBe(1);
	await page.keyboard.press('Tab'); // the contact door's two channels, in the middle
	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');
	const blog = door(page, 'blog'); // Blog, on the right
	await expect(blog).toBeFocused();
	await expect.poll(() => cardOpacity(blog)).toBe(1);
	await page.keyboard.press('Enter');
	await page.waitForURL((url) => url.pathname === '/blog');
});

const CHANNELS = {
	Discord: 'https://discord.gg/RxC5jwTUwS',
	Telegram: 'https://t.me/+zULM_zTFApgxZTc8'
};

/** Answers the channels' sites locally, so following a link loads nothing from them. */
async function stubChannels(page: Page) {
	await page
		.context()
		.route(/discord\.gg|t\.me/, (route) =>
			route.fulfill({ contentType: 'text/html', body: '<title>channel</title>' })
		);
}

test('the contact door links to Discord and Telegram, each in a new tab', async ({ page }) => {
	await page.goto('/');
	const contact = door(page, 'contact');
	await expect(contact).toHaveAttribute('role', 'group');
	for (const [name, href] of Object.entries(CHANNELS)) {
		const link = contact.getByRole('link', { name });
		await expect(link).toHaveAttribute('href', href);
		await expect(link).toHaveAttribute('target', '_blank');
		await expect(link).toHaveAttribute('rel', 'noopener');
	}
});

test('a channel opens by mouse and by keyboard', async ({ page }) => {
	await stubChannels(page);
	await page.goto('/');
	await page.waitForLoadState('networkidle');
	const contact = door(page, 'contact');
	await contact.hover();
	const [byMouse] = await Promise.all([
		page.waitForEvent('popup'),
		contact.getByRole('link', { name: 'Discord' }).click()
	]);
	expect(byMouse.url()).toBe(CHANNELS.Discord);

	await contact.getByRole('link', { name: 'Telegram' }).focus();
	const [byKeyboard] = await Promise.all([
		page.waitForEvent('popup'),
		page.keyboard.press('Enter')
	]);
	expect(byKeyboard.url()).toBe(CHANNELS.Telegram);
});

test('the footer links to Telegram', async ({ page }) => {
	await page.goto('/blog');
	const link = page.locator('body > app > footer').getByRole('link', { name: 'Telegram' });
	await expect(link).toHaveAttribute('href', CHANNELS.Telegram);
});

test('the home page transfers at most 500 KB before any interaction', async ({ page }) => {
	await page.goto('/');
	await page.waitForLoadState('networkidle');
	const bytes = await page.evaluate(() =>
		performance
			.getEntriesByType('navigation')
			.concat(performance.getEntriesByType('resource'))
			.reduce((sum, entry) => sum + (entry as PerformanceResourceTiming).transferSize, 0)
	);
	expect(bytes).toBeGreaterThan(0);
	expect(bytes).toBeLessThanOrEqual(500 * 1024);
});

test('no page asks for the retired LiveMatrix chat', async ({ page }) => {
	const requested: string[] = [];
	page.on('request', (request) => {
		const url = new URL(request.url());
		if (url.pathname.startsWith('/livematrix/')) {
			requested.push(request.url());
		}
	});
	for (const path of ['/', '/blog', '/tools', '/tools/pacenotes-translator']) {
		await page.goto(path);
		await page.waitForLoadState('networkidle');
	}
	expect(requested).toEqual([]);
});

test.describe('on a touch screen', () => {
	test.use({ viewport: { width: 375, height: 800 }, hasTouch: true, isMobile: true });

	test('a tap opens the contact door, and a tap on a channel opens it', async ({ page }) => {
		await stubChannels(page);
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		const contact = door(page, 'contact');
		const box = (await contact.boundingBox())!;
		await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
		await expect(contact).toHaveClass(/\bopen\b/);
		const telegram = contact.getByRole('link', { name: 'Telegram' });
		await expect(telegram).toBeVisible();
		const target = (await telegram.boundingBox())!;
		const [popup] = await Promise.all([
			page.waitForEvent('popup'),
			page.touchscreen.tap(target.x + target.width / 2, target.y + target.height / 2)
		]);
		expect(popup.url()).toBe(CHANNELS.Telegram);
	});

	test('the first tap opens a door, a tap on its card follows the link', async ({ page }) => {
		await page.goto('/');
		// The tap guard is the page's script; before hydration a tap simply follows the link.
		await page.waitForLoadState('networkidle');
		const tools = door(page, 'tools');
		const box = (await tools.boundingBox())!;
		// The inner edge of the column, where the contact door's hidden card (centred, wider than
		// its column) also lies: it must not catch the tap.
		await page.touchscreen.tap(box.x + box.width * 0.85, box.y + box.height / 2);
		await expect(tools).toHaveClass(/\bopen\b/);
		await expect(door(page, 'contact')).not.toHaveClass(/\bopen\b/);
		expect(new URL(page.url()).pathname).toBe('/');

		await expect.poll(() => cardOpacity(tools)).toBe(1);
		const card = (await tools.locator('[data-card]').boundingBox())!;
		await page.touchscreen.tap(card.x + card.width / 2, card.y + card.height / 2);
		await page.waitForURL((url) => url.pathname === '/tools');
	});

	test('the dock is a bar at the bottom, also on the front page', async ({ page }) => {
		await page.goto('/');
		const dock = page.getByRole('navigation', { name: 'Main' });
		await expect(dock).toBeVisible();
		expect(await dock.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
	});
});
