import { expect, test } from '@playwright/test';

/** The navigation dock (src/lib/components/Dock.svelte). */

const areas = [
	['/', 'Home'],
	['/blog', 'Blog'],
	['/tools/virtual-codriver-installer', 'Simracing'],
	['/tools', 'Simracing'],
	['/tools/pacenotes-translator', 'Simracing']
] as const;

for (const [path, current] of areas) {
	test(`the dock marks ${current} as the current area on ${path}`, async ({ page }) => {
		await page.goto(path);
		const dock = page.getByRole('navigation', { name: 'Main' });
		await expect(dock.locator('a[aria-current="page"]')).toHaveCount(1);
		await expect(dock.getByRole('link', { name: current })).toHaveAttribute('aria-current', 'page');
	});
}

test('the dock works by keyboard', async ({ page }) => {
	await page.goto('/tools');
	const blog = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Blog' });
	await blog.focus();
	await expect(blog).toBeFocused();
	await page.keyboard.press('Enter');
	await page.waitForURL((url) => url.pathname === '/blog');
	await expect(blog).toHaveAttribute('aria-current', 'page');
});

test('on a phone the dock is a bar at the bottom with large targets', async ({ page }) => {
	await page.setViewportSize({ width: 375, height: 800 });
	await page.goto('/blog');
	const dock = page.getByRole('navigation', { name: 'Main' });
	const bar = (await dock.boundingBox())!;
	expect(bar.y + bar.height, 'the bar sits inside the bottom of the screen').toBeLessThanOrEqual(
		800
	);
	expect(bar.y + bar.height).toBeGreaterThan(800 - 40);
	expect(bar.width, 'the bar spans the screen within the gutters').toBeGreaterThan(375 - 40);
	for (const link of await dock.getByRole('link').all()) {
		const target = (await link.boundingBox())!;
		expect(target.width).toBeGreaterThanOrEqual(44);
		expect(target.height).toBeGreaterThanOrEqual(44);
	}
});
