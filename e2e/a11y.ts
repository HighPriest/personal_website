import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';
import { knownViolations } from './a11y-baseline.ts';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const GATED_IMPACTS = new Set(['serious', 'critical']);

/**
 * Accessibility gate (a ratchet): fails on any serious/critical axe violation that isn't listed in
 * e2e/a11y-baseline.ts for this page, and on any listed violation that no longer occurs, so the
 * baseline can only shrink.
 */
export async function expectNoNewA11yViolations(page: Page, pageKey: string) {
	const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
	const gated = results.violations.filter((v) => GATED_IMPACTS.has(v.impact ?? ''));
	const found = gated.map((v) => v.id);
	const known = Object.keys(knownViolations[pageKey] ?? {});

	const unexpected = gated.filter((v) => !known.includes(v.id));
	const fixed = known.filter((id) => !found.includes(id));

	expect(
		unexpected.map((v) => `${v.id} (${v.impact}, ${v.nodes.length} nodes): ${v.help}`),
		`new serious/critical axe violations on "${pageKey}"`
	).toEqual([]);
	expect(
		fixed,
		`fixed violations still listed for "${pageKey}" in e2e/a11y-baseline.ts; remove them`
	).toEqual([]);
}
