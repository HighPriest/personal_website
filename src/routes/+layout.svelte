<script lang="ts">
	// Global styles (Pico, the theme, the basic rules), imported here once so they are linked in
	// the server-rendered <head> instead of arriving with a component.
	import '../lib/styles/app.scss';
	// The latin faces every first view uses, preloaded (src/lib/styles/fonts.scss): headings, text,
	// and the dock's HUD labels. The same files the stylesheet names, so they download once.
	import displayFont from '#lib/fonts/chakra-petch-latin-600-normal.woff2?url';
	import bodyFont from '#lib/fonts/ibm-plex-sans-latin-400-normal.woff2?url';
	import hudFont from '#lib/fonts/jetbrains-mono-latin-600-normal.woff2?url';

	import { browser } from '$app/env';
	import { onNavigate } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import { prefersReducedMotion } from 'svelte/motion';
	import {
		baseLocale,
		deLocalizeHref,
		extractLocaleFromUrl,
		getTextDirection,
		overwriteGetLocale
	} from '#lib/paraglide/runtime.js';
	import Analytics from '#lib/components/Analytics.svelte';
	import Dock from '#lib/components/Dock.svelte';
	import Pyramid from '#lib/components/Pyramid.svelte';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import SkipLink from '#lib/components/SkipLink.svelte';

	let { children } = $props();

	// The address decides the language.
	const locale = $derived(extractLocaleFromUrl(page.url.href) ?? baseLocale);
	// In the browser, messages read the locale from SvelteKit's current URL: Paraglide's default
	// reads window.location, which a client-side navigation may not have updated yet when the new
	// page renders. (The server keeps Paraglide's per-request locale.)
	if (browser) overwriteGetLocale(() => extractLocaleFromUrl(page.url.href) ?? baseLocale);
	// Client-side language switches keep <html lang> and dir right (the server sets them on load).
	$effect(() => {
		document.documentElement.lang = locale;
		document.documentElement.dir = getTextDirection(locale);
	});

	const front = $derived(deLocalizeHref(page.url.pathname) === '/');

	// The loading sign: the pyramid appears only when a navigation takes longer than 150 ms, so
	// fast page changes don't flash it. Time-based, so it can't be a $derived: the effect owns
	// the timer and clears it when the navigation ends.
	let loading = $state(false);
	$effect(() => {
		if (!navigating.to) {
			loading = false;
			return;
		}
		const timer = setTimeout(() => (loading = true), 150);
		return () => clearTimeout(timer);
	});

	// Page changes cross-fade through the View Transitions API (150 ms, app.scss). Both pages
	// stay in the normal flow, unlike the old crossfade that pushed the footer over the page.
	onNavigate((navigation) => {
		if (!document.startViewTransition || prefersReducedMotion.current) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	{#each [displayFont, bodyFont, hudFont] as font (font)}
		<link rel="preload" href={font} as="font" type="font/woff2" crossorigin="anonymous" />
	{/each}
</svelte:head>

<!-- Messages aren't reactive, so a client-side language switch re-renders the whole shell in the
	new language (no full reload). -->
{#key locale}
	<SkipLink />
	<!-- The shell: one <main> for every page, then the footer (not on the front page's scene)
		and the navigation dock, with the pyramid standing above it. -->
	<main id="content" tabindex="-1">
		{@render children()}
	</main>
	{#if !front}
		<SiteFooter />
	{/if}
	<Dock />
{/key}
<Pyramid shown={front || loading} {loading} halo={!front} />
<Analytics />
