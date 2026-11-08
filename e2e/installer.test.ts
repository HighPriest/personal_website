import { expect, test } from '@playwright/test';
import { expectNoNewA11yViolations } from './a11y.ts';

// The Virtual CoDriver landing page: the first view sells and downloads, the translator
// is advertised right below it, the video asks YouTube for nothing until played.
const PAGE = '/tools/virtual-codriver-installer';

test.use({ viewport: { width: 1280, height: 800 } });

test('the first view shows what it is, the download, and the translator advert', async ({
	page
}) => {
	await page.goto(PAGE);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Virtual CoDriver');
	const download = page.getByRole('button', { name: 'Download the installer' }).first();
	await expect(download).toBeInViewport();
	await expect(download).toHaveAttribute(
		'href',
		'https://github.com/HighPriest/RBR_copilot_installer/releases/latest'
	);
	const upgrade = page.getByRole('complementary', {
		name: 'Upgrade your co-driver without losing your old pacenotes'
	});
	await expect(upgrade).toBeInViewport();
	await expect(upgrade.getByRole('button', { name: 'Open the translator' })).toHaveAttribute(
		'href',
		'/tools/pacenotes-translator'
	);
	// The video sits where the artwork used to; the artwork is the page's faint background.
	await expect(page.getByRole('link', { name: /^Play the video/ })).toBeInViewport();
	await expect(page.locator('.backdrop .radio')).toBeAttached();
});

test('a co-driver of your own has its section, with the Ko-fi order', async ({ page }) => {
	await page.goto(PAGE);
	const own = page.getByRole('region', { name: 'Your own voice as the co-driver' });
	await expect(own).toContainText('Record 30 minutes of your voice');
	await expect(own.getByRole('button', { name: 'Order your co-driver on Ko-fi' })).toHaveAttribute(
		'href',
		'https://ko-fi.com/c/34010be854'
	);
});

test('on the tools hub, a click anywhere on a card opens its tool', async ({ page }) => {
	await page.goto('/tools');
	await page.waitForLoadState('networkidle');
	const card = page.locator('article', { hasText: 'Virtual CoDriver' });
	const box = (await card.boundingBox())!;
	await page.mouse.click(box.x + box.width / 2, box.y + 24); // the card's top line, not its link
	await page.waitForURL((url) => url.pathname === PAGE);
});

test('the video loads nothing from YouTube until it is played', async ({ page }) => {
	const youtube: string[] = [];
	page.on('request', (request) => {
		if (/youtube|ytimg|google/.test(new URL(request.url()).host)) youtube.push(request.url());
	});
	await page.route('https://www.youtube-nocookie.com/**', (route) =>
		route.fulfill({ contentType: 'text/html', body: '<title>player</title>' })
	);
	await page.goto(PAGE);
	await page.waitForLoadState('networkidle');
	const play = page.getByRole('link', { name: /^Play the video \(loads from YouTube\)/ });
	await play.scrollIntoViewIfNeeded();
	await page.waitForLoadState('networkidle');
	expect(youtube).toEqual([]);

	await play.click();
	const player = page.locator('iframe[src^="https://www.youtube-nocookie.com/embed/fZ3FEQRCJog"]');
	await expect(player).toBeVisible();
	await expect(player).toBeFocused();
});

test('the installation steps are listed in order', async ({ page }) => {
	await page.goto(PAGE);
	const steps = page.locator('ol.steps > li h3');
	await expect(steps).toHaveText([
		'See what gets installed',
		'Check the server',
		'Choose where to install',
		'Choose what to download',
		'Download',
		'Pick your setup'
	]);
});

for (const [prefix, key] of [
	['', 'installer'],
	['/pl', 'installer-pl'],
	['/de', 'installer-de']
] as const) {
	test(`axe passes on the landing page${prefix ? ` in ${prefix.slice(1)}` : ''}`, async ({
		page
	}) => {
		await page.goto(`${prefix}${PAGE}`);
		await page.waitForLoadState('networkidle');
		await expectNoNewA11yViolations(page, key);
	});
}
