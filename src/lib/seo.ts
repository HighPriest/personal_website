/**
 * What the <Seo> component and the sitemap share: absolute URLs (always on
 * SITE_URL, so prerendered and server-rendered pages agree), the locale alternates of a page,
 * and the pages that exist in every locale.
 */
import { baseLocale, localizeHref, locales, type Locale } from '#lib/paraglide/runtime.js';
import { SITE_URL } from '#lib/site.js';

/** The pages without parameters, in their unprefixed form (seo.test.ts checks src/routes). */
export const STATIC_ROUTES = [
	'/',
	'/blog',
	'/tools',
	'/tools/pacenotes-translator',
	'/tools/virtual-codriver-installer'
];

/** Open Graph's names for the locales. */
export const OG_LOCALES: Record<Locale, string> = { en: 'en_GB', pl: 'pl_PL', de: 'de_DE' };

/** The share image of pages without their own: the eye of Ra (a small square card). */
export const DEFAULT_IMAGE = `${SITE_URL}/eye-of-ra.png`;

/** The longest description a page gives; search results and previews show about this much. */
export const DESCRIPTION_LENGTH = 200;

/**
 * `text` as a meta description: whitespace collapsed (Ghost's excerpts keep line breaks), cut at
 * a word boundary with an ellipsis when longer than DESCRIPTION_LENGTH.
 */
export function metaDescription(text: string): string {
	const flat = text.replace(/\s+/g, ' ').trim();
	if (flat.length <= DESCRIPTION_LENGTH) return flat;
	const cut = flat.slice(0, DESCRIPTION_LENGTH - 1);
	return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,.;:–-]+$/, '')}…`;
}

/** `path` on the public site. */
export const absolute = (path: string): string => new URL(path, SITE_URL).href;

/**
 * The public URL of `path` (unprefixed) in `locale`. Without a trailing slash (Paraglide gives
 * `/pl/` for the front page), as SvelteKit serves pages: `/pl/` redirects to `/pl`.
 */
export const localized = (path: string, locale: Locale): string =>
	absolute(localizeHref(path, { locale }).replace(/(.)\/$/, '$1'));

/**
 * A JSON-LD script element for `data`, for {@html}. `<` is escaped (as \u003c, which JSON reads
 * back as `<`), so no string in the data can end the element early.
 */
export const jsonLd = (data: Record<string, unknown>): string =>
	`<script type="application/ld+json">${JSON.stringify(data).replaceAll('<', '\\u003c')}</script>`;

export type Alternate = { hreflang: Locale | 'x-default'; href: string };

/**
 * The page at `path` (unprefixed) in every locale, plus x-default: the unprefixed address, where
 * the early language redirect sends each visitor to their own language.
 */
export function alternates(path: string): Alternate[] {
	return [
		...locales.map((locale) => ({ hreflang: locale, href: localized(path, locale) })),
		{ hreflang: 'x-default', href: localized(path, baseLocale) }
	];
}
