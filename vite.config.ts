import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import devtoolsJson from 'vite-plugin-devtools-json'; // Used for integration with Chrome DevTools
import { svelteSitemap } from 'svelte-sitemap/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
	return {
		plugins: [
			devtoolsJson(),
			sveltekit(),
			paraglideVitePlugin({
				project: './project.inlang',
				outdir: './src/lib/paraglide',
				strategy: ['cookie', 'preferredLanguage', 'baseLocale']
			}),
			svelteSitemap({ domain: 'https://amun.pl' })
		],
		esbuild: {
			pure: mode === 'production' ? ['console.debug'] : []
			// In production mode, this strips console.debug lines from the entire application
			// console.log is not stripped and can be used to show info in production
			// Source: https://github.com/vitejs/vite/discussions/7920
		},
		css: {
			preprocessorOptions: {
				scss: {}
			}
		}
	};
});
