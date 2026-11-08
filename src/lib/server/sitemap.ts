/**
 * The sitemap: every static page and tag page in every locale, each with its
 * alternates, and every post once, at its unprefixed address (its canonical, §5.3).
 */
import { locales } from '#lib/paraglide/runtime.js';
import { absolute, alternates, localized, STATIC_ROUTES } from '#lib/seo.js';

export type SitemapPost = { slug: string; updatedAt: string | null };

const escape = (value: string) => value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

function entry(loc: string, extra: string[] = []) {
	return ['\t<url>', `\t\t<loc>${escape(loc)}</loc>`, ...extra, '\t</url>'].join('\n');
}

/** The page at `path` in each locale, each entry listing all of them. */
function everyLocale(path: string) {
	const links = alternates(path).map(
		({ hreflang, href }) =>
			`\t\t<xhtml:link rel="alternate" hreflang="${hreflang}" href="${escape(href)}"/>`
	);
	return locales.map((locale) => entry(localized(path, locale), links));
}

export function buildSitemap({ tags, posts }: { tags: string[]; posts: SitemapPost[] }): string {
	const urls = [
		...STATIC_ROUTES.flatMap(everyLocale),
		...tags.flatMap((slug) => everyLocale(`/blog/tag/${slug}`)),
		...posts.map(({ slug, updatedAt }) =>
			entry(
				absolute(`/blog/post/${slug}`),
				updatedAt ? [`\t\t<lastmod>${escape(updatedAt)}</lastmod>`] : []
			)
		)
	];
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
		...urls,
		'</urlset>',
		''
	].join('\n');
}
