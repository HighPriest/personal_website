import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildSitemap } from '#lib/server/sitemap.js';
import { alternates, metaDescription, DESCRIPTION_LENGTH, jsonLd, STATIC_ROUTES } from './seo.ts';

describe('STATIC_ROUTES', () => {
	it('lists every page without parameters, so the sitemap misses none', () => {
		const pages = readdirSync('src/routes', { recursive: true, encoding: 'utf8' })
			.map((file) => file.replaceAll('\\', '/'))
			.filter((file) => file.endsWith('+page.svelte') && !file.includes('['))
			.map((file) => {
				const route = file
					.replace(/\/?\+page\.svelte$/, '')
					.split('/')
					.filter((segment) => segment && !/^\(.*\)$/.test(segment)) // route groups
					.join('/');
				return `/${route}`;
			});
		expect([...STATIC_ROUTES].sort()).toEqual(pages.sort());
	});
});

describe('alternates', () => {
	it('gives the page in every locale, and x-default at the unprefixed address', () => {
		expect(alternates('/tools')).toEqual([
			{ hreflang: 'en', href: 'https://amun.pl/tools' },
			{ hreflang: 'pl', href: 'https://amun.pl/pl/tools' },
			{ hreflang: 'de', href: 'https://amun.pl/de/tools' },
			{ hreflang: 'x-default', href: 'https://amun.pl/tools' }
		]);
		expect(alternates('/').map((alternate) => alternate.href)).toEqual([
			'https://amun.pl/',
			'https://amun.pl/pl',
			'https://amun.pl/de',
			'https://amun.pl/'
		]);
	});
});

describe('metaDescription', () => {
	it('collapses whitespace and keeps short text whole', () => {
		expect(metaDescription('Line one\n\nline  two ')).toBe('Line one line two');
	});

	it('cuts long text at a word boundary, within the limit, with an ellipsis', () => {
		const long = `${'word '.repeat(60)}end`;
		const cut = metaDescription(long);
		expect(cut.length).toBeLessThanOrEqual(DESCRIPTION_LENGTH);
		expect(cut).toMatch(/word…$/);
	});
});

describe('jsonLd', () => {
	it('escapes < so a string in the data cannot end the script element', () => {
		const html = jsonLd({ headline: 'a </script><script>alert(1)</script>' });
		expect(html.match(/<\/script>/g)).toHaveLength(1);
		const json = html.slice(html.indexOf('>') + 1, html.lastIndexOf('<'));
		expect(JSON.parse(json).headline).toBe('a </script><script>alert(1)</script>');
	});
});

describe('buildSitemap', () => {
	const xml = buildSitemap({
		tags: ['simracing'],
		posts: [
			{ slug: 'a-post', updatedAt: '2026-01-02T03:04:05.000Z' },
			{ slug: 'no-date', updatedAt: null }
		]
	});
	const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

	it('lists every static page and tag page in every locale, and every post once', () => {
		expect(locs).toContain('https://amun.pl/');
		expect(locs).toContain('https://amun.pl/de/tools/pacenotes-translator');
		expect(locs).toContain('https://amun.pl/pl/blog/tag/simracing');
		expect(locs.filter((loc) => loc.includes('/blog/post/'))).toEqual([
			'https://amun.pl/blog/post/a-post',
			'https://amun.pl/blog/post/no-date'
		]);
		expect(locs).toHaveLength((STATIC_ROUTES.length + 1) * 3 + 2);
		expect(xml).not.toContain('prerendered');
	});

	it('gives localized pages their alternates and posts their last update', () => {
		const tools = xml.match(/<url>\s*<loc>https:\/\/amun\.pl\/pl\/tools<\/loc>[\s\S]*?<\/url>/)![0];
		expect(tools.match(/xhtml:link rel="alternate"/g)).toHaveLength(4);
		expect(tools).toContain('hreflang="x-default" href="https://amun.pl/tools"');
		expect(xml).toContain('<lastmod>2026-01-02T03:04:05.000Z</lastmod>');
		expect(xml.match(/<lastmod>/g)).toHaveLength(1);
	});
});
