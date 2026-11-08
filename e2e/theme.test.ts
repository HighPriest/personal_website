import { expect, test } from '@playwright/test';

/**
 * Text contrast of the theme (src/lib/styles/theme.scss), read from the computed styles in each
 * colour scheme. Every pair must reach WCAG AA for body text (4.5:1). Gradient text (list
 * numbers, kickers) is sampled along the path the browser paints it: the long way round in OKLCH
 * where supported, a straight sRGB blend otherwise.
 */
const pairs: [name: string, text: string, background: string][] = [
	['text', '--pico-color', '--pico-background-color'],
	['text on a card', '--pico-color', '--pico-card-background-color'],
	['muted', '--pico-muted-color', '--pico-background-color'],
	['muted on a card', '--pico-muted-color', '--pico-card-background-color'],
	['muted on a card header', '--pico-muted-color', '--pico-card-sectioning-background-color'],
	['link', '--pico-primary', '--pico-background-color'],
	['link on a card', '--pico-primary', '--pico-card-background-color'],
	['link hover', '--pico-primary-hover', '--pico-background-color'],
	['heading', '--pico-h1-color', '--pico-background-color'],
	['heading on a card', '--pico-h3-color', '--pico-card-background-color'],
	['button', '--pico-primary-inverse', '--pico-primary-background'],
	['button hover', '--pico-primary-inverse', '--pico-primary-hover-background'],
	['secondary button', '--pico-secondary-inverse', '--pico-secondary-background'],
	['form field', '--pico-form-element-color', '--pico-form-element-background-color'],
	['placeholder', '--pico-form-element-placeholder-color', '--pico-form-element-background-color'],
	['code', '--pico-code-color', '--pico-code-background-color'],
	['mark', '--pico-mark-color', '--pico-mark-background-color'],
	// Highlighted code (Shiki's CSS-variables theme).
	...[
		'foreground',
		'token-keyword',
		'token-string',
		'token-string-expression',
		'token-comment',
		'token-constant',
		'token-changed',
		'token-function',
		'token-parameter',
		'token-punctuation',
		'token-link',
		'token-inserted',
		'token-deleted'
	].map((token): [string, string, string] => [
		`code ${token}`,
		`--code-${token}`,
		'--code-background'
	])
];
const gradientStops = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

for (const scheme of ['light', 'dark'] as const) {
	test(`theme text contrast is at least 4.5:1 in the ${scheme} scheme`, async ({ page }) => {
		await page.emulateMedia({ colorScheme: scheme });
		await page.goto('/tools');

		const results = await page.evaluate(
			({ pairs, gradientStops }) => {
				const space = CSS.supports('background-image', 'linear-gradient(in oklch, red, blue)')
					? 'oklch longer hue'
					: 'srgb';
				const gradient = (stop: number) =>
					`color-mix(in ${space}, var(--c-fx-1), var(--c-fx-2) ${stop}%)`;
				const all: [string, string, string][] = [
					...pairs,
					...gradientStops.flatMap((stop): [string, string, string][] => [
						[`gradient text at ${stop}%`, gradient(stop), '--pico-background-color'],
						[`gradient text at ${stop}% on a card`, gradient(stop), '--pico-card-background-color']
					])
				];

				// Resolve any CSS colour to the sRGB pixel the screen shows, through a 1×1 canvas.
				const probe = document.createElement('span');
				document.body.append(probe);
				const context = document.createElement('canvas').getContext('2d', {
					willReadFrequently: true
				})!;
				const rgb = (value: string) => {
					probe.style.color = value.startsWith('--') ? `var(${value})` : value;
					context.clearRect(0, 0, 1, 1);
					context.fillStyle = getComputedStyle(probe).color;
					context.fillRect(0, 0, 1, 1);
					return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
				};
				const luminance = (c: number[]) => {
					const [r, g, b] = c.map((v) => {
						v /= 255;
						return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
					});
					return 0.2126 * r + 0.7152 * g + 0.0722 * b;
				};
				const ratio = (a: number[], b: number[]) => {
					const [x, y] = [luminance(a), luminance(b)];
					return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
				};
				const out = all.map(([name, text, background]) => ({
					name,
					ratio: ratio(rgb(text), rgb(background))
				}));
				const page = rgb('--pico-background-color');
				probe.remove();
				return { out, page };
			},
			{ pairs, gradientStops }
		);

		// The theme is the one in effect: Neon night's page colour for this scheme.
		expect(results.page).toEqual(scheme === 'dark' ? [7, 8, 13] : [243, 244, 248]);
		expect(results.out).toHaveLength(pairs.length + gradientStops.length * 2);
		const failing = results.out
			.filter((r) => r.ratio < 4.5)
			.map((r) => `${r.name}: ${r.ratio.toFixed(2)}:1`);
		expect(failing, 'text pairs under 4.5:1').toEqual([]);
	});
}
