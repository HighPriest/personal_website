import type { Page, TestInfo } from '@playwright/test';

/**
 * Visual stability checks: layout shift, the footer
 * never covering the page, and screenshots for the owner to review.
 */

type StabilityWindow = Window & { __cls?: number; __overlaps?: string[] };

/** Starts summing layout shifts (excluding those right after user input) before the page loads. */
export async function recordLayoutShift(page: Page) {
	await page.addInitScript(() => {
		const w = window as StabilityWindow;
		w.__cls = 0;
		new PerformanceObserver((list) => {
			for (const entry of list.getEntries() as PerformanceEntry[]) {
				const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
				if (!shift.hadRecentInput) w.__cls = (w.__cls ?? 0) + shift.value;
			}
		}).observe({ type: 'layout-shift', buffered: true });
	});
}

/** The cumulative layout shift from load until the page has been idle for a moment. */
export async function layoutShiftWhenIdle(page: Page) {
	await page.waitForLoadState('load');
	// A page that streams media (the old front page's video) never goes network-idle, so wait
	// for idle only up to a few seconds.
	await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
	await page.waitForTimeout(500);
	return page.evaluate(() => (window as StabilityWindow).__cls ?? 0);
}

/**
 * Watches every animation frame for the site footer covering page content (a heading, article
 * or section in <main>) and records each overlap. The site footer is the last <footer> that
 * isn't part of an article, dialog or quote.
 */
export async function watchFooterOverlap(page: Page) {
	await page.evaluate(() => {
		const w = window as StabilityWindow;
		w.__overlaps = [];
		const siteFooter = () =>
			[...document.querySelectorAll('footer')]
				.filter((f) => !f.closest('article, dialog, blockquote'))
				.at(-1);
		const check = () => {
			const footer = siteFooter();
			const f = footer?.getBoundingClientRect();
			if (footer && f && f.height > 0) {
				for (const el of document.querySelectorAll('main :is(h1, h2, h3, article, section)')) {
					if (footer.contains(el)) continue;
					const r = el.getBoundingClientRect();
					const covers =
						r.height > 0 &&
						r.bottom > f.top + 1 &&
						r.top < f.bottom - 1 &&
						r.right > f.left &&
						r.left < f.right;
					if (covers) {
						w.__overlaps!.push(
							`${location.pathname}: ${el.tagName.toLowerCase()} under the footer`
						);
					}
				}
			}
			requestAnimationFrame(check);
		};
		check();
	});
}

export async function footerOverlaps(page: Page) {
	return page.evaluate(() => [...new Set((window as StabilityWindow).__overlaps ?? [])]);
}

/** Client-side navigation through a same-origin link, as a visitor's click would do it. */
export async function navigateClientSide(page: Page, path: string) {
	await page.evaluate((href) => {
		const link = document.createElement('a');
		link.href = href;
		document.body.append(link);
		link.click();
		link.remove();
	}, path);
	await page.waitForURL((url) => url.pathname === path);
}

/**
 * Screenshots as a visitor sees the page: the first screen, and the last one when the page
 * scrolls. Full-page capture stretches the viewport to the whole page, which distorts full-screen
 * layouts and moves fixed elements (dock, pyramid, viewport-fixed gradients).
 */
export async function attachScreenshot(page: Page, testInfo: TestInfo, name: string) {
	await testInfo.attach(`${name}-top`, { body: await page.screenshot(), contentType: 'image/png' });
	const scrolls = await page.evaluate(() => document.documentElement.scrollHeight > innerHeight);
	if (!scrolls) return;
	await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
	await page.waitForTimeout(200);
	await testInfo.attach(`${name}-bottom`, {
		body: await page.screenshot(),
		contentType: 'image/png'
	});
}
