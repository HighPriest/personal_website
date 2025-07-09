import { paraglideVitePlugin } from '@inlang/paraglide-js';
import devtoolsJson from 'vite-plugin-devtools-json'; // Used for integration with Chrome DevTools
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		devtoolsJson(),
		paraglideVitePlugin({ 
            project: './project.inlang',
            outdir: './src/lib/paraglide',
            strategy: ["cookie", "preferredLanguage", "baseLocale"] }),
		sveltekit()
	],
	css: {
		preprocessorOptions: {
			scss: {
			}
		}
	}
});
