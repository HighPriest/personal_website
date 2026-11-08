import type { Handle } from '@sveltejs/kit/hooks';
import { getTextDirection } from '#lib/paraglide/runtime.js';
import { paraglideMiddleware } from '#lib/paraglide/server.js';
import { earlyRedirectCode, earlyRedirectScript } from '#lib/i18n/redirect.js';
import { allowScript, scriptHash } from '#lib/server/csp.js';

/** The CSP source that lets the early redirect script run (SvelteKit hashes only its own). */
const redirectSource = scriptHash(earlyRedirectCode);

/** SvelteKit's CSP <meta> on prerendered pages; server-rendered ones get the header instead. */
const CSP_META = /(<meta http-equiv="content-security-policy" content=")([^"]*)/;

const handleParaglide: Handle = async ({ event, resolve }) => {
	// SvelteKit 3 makes event.request read-only. Routing of localized URLs is done by the
	// reroute hook in hooks.ts, so only the resolved locale is needed here. The locale comes
	// from the address (strategy 'url' first), so the middleware never redirects; the early
	// redirect script sends unprefixed visits on to a saved or preferred language instead. This
	// hook also runs while pages are prerendered, so every page gets the same <html> and script.
	const response = await paraglideMiddleware(event.request, ({ locale }) =>
		resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
					.replace('%amun.language-redirect%', earlyRedirectScript)
					.replace(CSP_META, (_, start, policy) => start + allowScript(policy, redirectSource))
		})
	);
	const policy = response.headers.get('content-security-policy');
	if (policy) response.headers.set('content-security-policy', allowScript(policy, redirectSource));
	return response;
};

export const handle: Handle = handleParaglide;
