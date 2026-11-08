/**
 * The Content Security Policy. SvelteKit writes the policy (the
 * `csp` option in vite.config.ts, hash mode) and hashes the inline scripts it adds itself. The
 * early language redirect is added by hooks.server.ts instead, so its hash goes in there.
 */
import { createHash } from 'node:crypto';

/** The CSP source for an inline script with exactly this text: `'sha256-…'`. */
export const scriptHash = (code: string): string =>
	`'sha256-${createHash('sha256').update(code, 'utf8').digest('base64')}'`;

/** `policy` with `source` added to its script-src (which SvelteKit always writes). */
export function allowScript(policy: string, source: string): string {
	return policy
		.split(';')
		.map((directive) => {
			const trimmed = directive.trim();
			return /^script-src\s/.test(trimmed) ? ` ${trimmed} ${source}` : directive;
		})
		.join(';')
		.trim();
}
