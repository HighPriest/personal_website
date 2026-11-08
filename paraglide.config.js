/**
 * Paraglide compiler options, shared by the Vite plugin (dev and build) and
 * `pnpm i18n:compile` (type checks on a fresh checkout, before Vite has run).
 *
 * @type {import('@inlang/paraglide-js').CompilerOptions}
 */
export default {
	project: './project.inlang',
	outdir: './src/lib/paraglide',
	// Physical message files, as `pnpm i18n:compile` writes them for svelte-check. Paraglide 3's
	// Vite plugin defaults to virtual modules, whose Windows handling before 3.2.1 could make
	// prerendered pages fall back to the base locale.
	outputStructure: 'message-modules',
	strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale']
};
