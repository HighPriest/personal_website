import { baseLocale, cookieName, locales } from '#lib/paraglide/runtime.js';

/**
 * The early language redirect. The address decides
 * the language, but a visitor who opens an unprefixed (English) address is sent on to their
 * language before the page paints:
 *
 * - the language they chose in the menu (Paraglide's cookie) wins, English included;
 * - with no saved choice, the first of the browser's preferred languages the site has.
 *
 * Most pages are prerendered files served without running server code, so this runs in the
 * browser: an inline script at the top of every page's <head>, added by hooks.server.ts (which
 * also runs while pages are prerendered). It reuses the Paraglide runtime's locale list and
 * cookie name, so it never drifts from them. Visitors without JavaScript get English.
 */
function redirect(locales: readonly string[], base: string, cookie: string) {
	const path = location.pathname;
	const others = locales.filter((locale) => locale !== base);
	if (others.some((locale) => path === `/${locale}` || path.startsWith(`/${locale}/`))) return;

	const saved = document.cookie.match(new RegExp(`(?:^|; )${cookie}=([^;]*)`))?.[1];
	let target = saved;
	if (!target) {
		for (const tag of navigator.languages ?? [navigator.language]) {
			const lower = tag.toLowerCase();
			const match = locales.find((locale) => locale === lower || locale === lower.split('-')[0]);
			if (match) {
				target = match;
				break;
			}
		}
	}
	if (target && target !== base && others.includes(target)) {
		// Same shape as Paraglide's localizeHref: the prefix goes in front of the whole path.
		location.replace(`/${target}${path}${location.search}${location.hash}`);
	}
}

/** The script's code; the CSP allows exactly this text by its hash (#lib/server/csp.ts). */
export const earlyRedirectCode = `(${redirect.toString()})(${JSON.stringify(locales)},${JSON.stringify(baseLocale)},${JSON.stringify(cookieName)})`;

/** The inline <script> element, ready to go first in <head>. */
export const earlyRedirectScript = `<script>${earlyRedirectCode}</script>`;
