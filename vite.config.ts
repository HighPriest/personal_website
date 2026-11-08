import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import devtoolsJson from 'vite-plugin-devtools-json'; // Used for integration with Chrome DevTools
import { defineConfig } from 'vitest/config';
import paraglideOptions from './paraglide.config.js';

export default defineConfig({
	plugins: [
		devtoolsJson(),
		sveltekit({
			preprocess: vitePreprocess(),
			adapter: adapter(),
			// The Content Security Policy: in a header on server-rendered pages,
			// a <meta> on prerendered ones. SvelteKit hashes its own inline scripts; the hook adds
			// the early language redirect's hash (#lib/server/csp.ts).
			csp: {
				mode: 'hash',
				directives: {
					'default-src': ['self'],
					// Umami's tracker and its reports are served from the site itself (/s/).
					'script-src': ['self'],
					'connect-src': ['self'],
					'style-src': ['self'],
					// Style attributes: Ghost's header-card colours, Shiki's token colours, the embed
					// facades' aspect ratio. They can't run script.
					'style-src-attr': ['unsafe-inline'],
					// Ghost's images on the site's own domain, and Pico's data: icons. Images from
					// other sites come through the media cache (/blog/media).
					'img-src': ['self', 'data:', 'https://amun.pl'],
					'font-src': ['self'],
					// The players that load on click (posts, the installer page).
					'frame-src': ['https://www.youtube-nocookie.com', 'https://www.desmos.com'],
					'object-src': ['none'],
					'base-uri': ['self'],
					'form-action': ['self'],
					'frame-ancestors': ['none']
				}
			}
		}),
		paraglideVitePlugin(paraglideOptions)
	],
	test: {
		// Unit tests live next to the code; end-to-end tests live in e2e/ and run with Playwright
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'node',
		// Console output (including #lib/debug) is shown only for failing tests
		silent: 'passed-only'
	},
	css: {
		preprocessorOptions: {
			scss: {
				// Silences deprecation warnings from dependencies only (Pico 2.1.1 still uses the
				// old Sass if() function); the project's own stylesheets keep their warnings.
				quietDeps: true
			}
		}
	}
});
