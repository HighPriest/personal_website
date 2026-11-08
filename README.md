# amun.pl

Source of [amun.pl](https://amun.pl): a front page, a blog, and tool pages for the
[RBR CoPilot](https://github.com/HighPriest/RBR_copilot_installer) project, such as the
pacenotes translator and the Virtual CoDriver installer.

Built with SvelteKit and `@sveltejs/adapter-node`, translated into English, Polish and German with
[Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs), and drawing blog content from
a Ghost CMS instance through its Content API.

## Develop

Requirements: Node.js 22.17 or newer, and pnpm (`corepack enable` picks up the version pinned in
`package.json`).

```sh
pnpm install
pnpm dev          # dev server on http://localhost:5173
pnpm check        # svelte-check (types)
pnpm lint         # prettier + eslint
pnpm build        # production build into ./build
node build        # run the production build
pnpm test         # unit tests (Vitest)
pnpm test:e2e     # end-to-end + accessibility tests against ./build (Playwright)
```

Translations live in `messages/{en,pl,de}.json`; Paraglide compiles them into `src/lib/paraglide`
on build.

The end-to-end tests need a production build and a Playwright browser: run `pnpm build` and, once,
`pnpm exec playwright install chromium`. Known accessibility violations are listed in
`e2e/a11y-baseline.ts`; the tests fail on any new one, and on any listed one that has been fixed.

## Deployment

Images are built in CI and pulled by the server; the server never builds. The deployment setup
(CI, the container and the server) is kept outside the public repository.
