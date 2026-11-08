<!--
	@component
	The language menu in the dock: a disclosure showing a globe and the current
	language code; its list opens upward with each language in its own name. The links are plain
	links to the same page in the other locale, so they work without JavaScript. Choosing one also
	saves it in Paraglide's cookie, so later visits to unprefixed addresses come back to it (the
	early redirect, #lib/i18n/redirect.ts). It closes on selection, a click outside and Escape.
-->
<script lang="ts">
	import { page } from '$app/state';
	import {
		baseLocale,
		cookieMaxAge,
		cookieName,
		deLocalizeHref,
		extractLocaleFromUrl,
		localizeHref,
		locales,
		type Locale
	} from '#lib/paraglide/runtime.js';
	import * as m from '#lib/paraglide/messages.js';

	const names: Record<Locale, string> = { en: 'English', pl: 'Polski', de: 'Deutsch' };

	// The address decides the language.
	const current = $derived(extractLocaleFromUrl(page.url.href) ?? baseLocale);
	const path = $derived(deLocalizeHref(page.url.pathname));

	/** Remembers an explicit choice; the link then navigates as usual (no reload). */
	function remember(locale: Locale) {
		document.cookie = `${cookieName}=${locale}; path=/; max-age=${cookieMaxAge}; samesite=lax`;
	}

	/** Closes the menu on a choice, a click outside, and Escape (focus returns to the summary). */
	function dismissable(menu: HTMLDetailsElement) {
		const close = (returnFocus: boolean) => {
			if (!menu.open) return;
			menu.open = false;
			if (returnFocus) menu.querySelector('summary')?.focus();
		};
		const onClick = (event: MouseEvent) => {
			const target = event.target as Element;
			if (!menu.contains(target) || target.closest('a')) close(false);
		};
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') close(true);
		};
		document.addEventListener('click', onClick);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('click', onClick);
			document.removeEventListener('keydown', onKey);
		};
	}
</script>

<details {@attach dismissable}>
	<!-- The name is the hidden text ("Language: English"); the visible code is decoration. -->
	<summary>
		<span class="vh">{m.lang_menu_label({ language: names[current] })}</span>
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0 M3 12h18 M12 3c3 3.2 3 14.8 0 18 M12 3c-3 3.2-3 14.8 0 18"
			/>
		</svg>
		<span aria-hidden="true">{current.toUpperCase()}</span>
	</summary>
	<ul>
		{#each locales as locale (locale)}
			<li>
				<a
					href={localizeHref(path, { locale })}
					hreflang={locale}
					lang={locale}
					aria-current={locale === current ? 'true' : undefined}
					onclick={() => remember(locale)}
				>
					{names[locale]} <span aria-hidden="true">{locale.toUpperCase()}</span>
				</a>
			</li>
		{/each}
	</ul>
</details>

<style>
	details {
		position: relative;
		margin: 0;
		padding: 0;
		border: 0;
	}
	summary {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.3rem;
		min-width: 4.5rem;
		height: 100%;
		padding: 0.45rem 0.7rem 0.4rem;
		list-style: none;
		cursor: pointer;
		font-family: var(--f-mono);
		font-size: 0.625rem;
		font-weight: 600;
		line-height: 1;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--c-text);
	}
	.vh {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	/* Pico's accordion chevron. */
	summary::after {
		display: none;
	}
	svg {
		width: 1.2rem;
		height: 1.2rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.6;
		stroke-linejoin: round;
		stroke-linecap: round;
		transition:
			transform var(--pico-transition),
			filter var(--pico-transition);
	}
	summary:is(:hover, :focus-visible) svg {
		stroke: var(--c-neon-y);
		filter: drop-shadow(0 0 0.35rem var(--c-neon-y));
		transform: translateY(-2px);
	}
	ul {
		position: absolute;
		right: 0;
		bottom: calc(100% + 0.75rem);
		display: flex;
		flex-direction: column;
		min-width: 10rem;
		margin: 0;
		padding: 0.35rem;
		background: var(--c-bg2);
		border: 1px solid var(--c-line);
		box-shadow: 0 0 1.5rem color-mix(in srgb, var(--c-neon-b) 20%, transparent);
	}
	li {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	a {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		margin: 0;
		padding: 0.65rem 0.75rem;
		font-family: var(--f-mono);
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-decoration: none;
		color: var(--c-text);
	}
	a:is(:hover, :focus-visible) {
		color: var(--c-link-hover);
	}
	a[aria-current='true'] {
		color: var(--c-head);
		box-shadow: inset 2px 0 0 var(--c-neon-y);
	}

	@media (max-width: 767.98px) {
		summary {
			min-width: 0;
			min-height: 3.5rem;
			padding: 0.5rem 0.25rem;
			font-size: 0.6875rem;
			letter-spacing: 0.1em;
		}
		svg {
			width: 1.35rem;
			height: 1.35rem;
		}
	}
</style>
