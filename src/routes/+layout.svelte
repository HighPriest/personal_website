<script lang="ts">
	import AmunTheme from '$lib/styles/theme.svelte';
	import Background from '$lib/components/Background.svelte';
	let { children } = $props();

	// Translation stuff
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { availableLanguageTags, languageTag } from '$lib/paraglide/runtime.js';
	import { page } from '$app/state';
</script>

<AmunTheme>
	<ParaglideJS {i18n}>
		{@render children()}
	</ParaglideJS>
</AmunTheme>
<Background />

<div class="lang-switcher">
	<!-- Icon source https://cdn2.iconfinder.com/data/icons/world-flag-icons/128/Flag_of_Poland.png -->
	{#each availableLanguageTags as lang}
		<!-- the hreflang attribute decides which language the link points to -->
		<a
			href={i18n.resolveRoute(i18n.route(page.url.pathname), lang)}
			hreflang={lang}
			aria-label="language"
			aria-current={lang === languageTag() ? 'page' : undefined}
			class="lang-selector"
		>
			<img class="lang-flag" alt={lang} src={'/icons/i18n/' + lang + '.webp'} />
		</a>
	{/each}
</div>

<style lang="scss">
	.lang-switcher {
		text-align: left;
		cursor: pointer;
		position: fixed;
		transition: 1s linear;
		top: 20px;
		right: 20px;
		.current-lang {
			z-index: 2;
			position: relative;
		}
		.lang-selector {
			display: block;
			position: relative;
			height: 0;
			cursor: pointer;

			&[aria-current="page"] {
				z-index: 1;
			}
		}
	}

	.lang-switcher:hover {
		.lang-selector {
			height: auto;
		}
		.lang-dropdown {
			height: auto;
			margin-top: 0;
		}
	}

	.switcher-link {
		color: #fff;
	}
	.switcher-link:hover {
		color: #fff;
	}
	.lang-flag {
		width: 20px;
		display: inline-block;
	}
	.lang-dropdown {
		position: relative;
		z-index: 1;
		margin-top: -24px;
	}
</style>
