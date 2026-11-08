import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';
import { MOCK_KEY, MOCK_PORT } from './e2e/ghost-fixture.ts';

// BASE_URL points the suite at a deployed site instead, for the smoke tests after a deploy:
// `BASE_URL=https://amun.pl pnpm test:e2e e2e/smoke.test.ts`. Nothing is started locally then.
const remote = process.env.BASE_URL;

// Otherwise the suite runs against the production server (`node build`), so the build must exist.
if (!remote && !existsSync('build/index.js')) {
	throw new Error('No production build found. Run `pnpm build` before `pnpm test:e2e`.');
}

const port = 4173;
const baseURL = remote ?? `http://127.0.0.1:${port}`;
const mockURL = `http://127.0.0.1:${MOCK_PORT}`;

// The same permission flags as the Dockerfile's CMD, so the suite proves every route works under
// them. Node 25 and later also restrict the network (`--allow-net`); older Node rejects that flag.
const nodeMajor = Number(process.versions.node.split('.')[0]);
const permission = [
	'--permission',
	'--allow-fs-read=build',
	'--allow-fs-read=package.json',
	...(nodeMajor >= 25 ? ['--allow-net'] : [])
];

export default defineConfig({
	testDir: 'e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	// CI runs on a small ARM machine, which also hosts the servers under test: rendering the
	// translator's 337-row call map or a translation can outlast the default 5 s there. Local runs
	// keep the tight defaults, so slowness still shows early.
	...(process.env.CI ? { timeout: 60_000, expect: { timeout: 15_000 } } : {}),
	reporter: [['list'], ['html', { open: 'never' }]],
	use: {
		baseURL,
		trace: 'retain-on-failure'
	},
	webServer: remote
		? []
		: [
				// The blog reads a local Ghost stand-in with recorded posts, never the live site.
				{
					command: `"${process.execPath}" e2e/ghost-mock.ts`,
					url: `${mockURL}/ghost/api/content/posts/?key=${MOCK_KEY}`,
					reuseExistingServer: !process.env.CI
				},
				{
					command: `"${process.execPath}" ${permission.join(' ')} build/index.js`,
					url: baseURL,
					env: {
						PORT: String(port),
						HOST: '127.0.0.1',
						GHOST_URL: mockURL,
						GHOST_CONTENT_KEY: MOCK_KEY
					},
					reuseExistingServer: !process.env.CI
				}
			],
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
