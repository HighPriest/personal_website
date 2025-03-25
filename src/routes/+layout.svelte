<script lang="ts">
	import { UmamiAnalytics } from '@lukulent/svelte-umami';
	let { children } = $props();

	// Translation stuff
	import { locales, localizeHref, getLocale } from '$lib/paraglide/runtime';
	import { page } from '$app/state';
</script>

<UmamiAnalytics
	websiteID="e1237ef3-a2b6-4163-9057-fbde1c4faef4"
	srcURL="https://umami.amun.pl/script.js"
	configuration={{
		'data-domains': 'amun.pl',
		'data-auto-track': false
	}}
/>

{@render children()}
<!--<Background />-->
<div class="background"></div>

<div class="lang-switcher">
	<!-- Icon source https://cdn2.iconfinder.com/data/icons/world-flag-icons/128/Flag_of_Poland.png -->
	{#each locales as locale}
		<!-- the hreflang attribute decides which language the link points to -->
		<a
			href={localizeHref(page.url.pathname, { locale })}
			hreflang={locale}
			aria-label="language"
			aria-current={locale === getLocale() ? 'page' : undefined}
			class="lang-selector"
		>
			<img class="lang-flag" alt={locale} src={'/icons/i18n/' + locale + '.webp'} />
		</a>
	{/each}
</div>

<style lang="scss">
	@use '$lib/styles/theme';
	@use '$lib/styles/default';
	@use '$lib/styles/custom';

	.background {
		z-index: -1;
		position: absolute;
		top: 0;
		margin: -1rem; // This is to compensate 1rem of padding on body
		height: 100%;
		width: 100%;
		display: flex;
		justify-content: center;
		overflow: hidden;
		// Remember to have preserveAspectRatio='slice' in background-image
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xml:space='preserve' id='lines' x='0' y='0' class='background__lights' preserveAspectRatio='slice' version='1.1' viewBox='0 0 1920 1920'%3E%3Cstyle%3E@keyframes animateDown%7B0%25%7Btransform:translateY(-100%25)%7Dto%7Btransform:translateY(100%25)%7D%7D@keyframes animateUp%7B0%25%7Btransform:translateY(100%25)%7Dto%7Btransform:translateY(-100%25)%7D%7D.lines%7Bopacity:.05%7D.line%7Bfill-rule:evenodd;clip-rule:evenodd;fill:hsl(52, 100%, 34%);%7D.lights%7Bopacity:.9%7D.light%7Bfill-rule:evenodd;clip-rule:evenodd;fill:hsl(187, 98%, 60%);animation-timing-function:linear;animation-iteration-count:infinite%7D.lights .light:nth-child(1)%7Banimation-duration:98s%7D.lights .light:nth-child(2)%7Banimation-duration:100s%7D.lights .light:nth-child(3)%7Banimation-duration:30s%7D.lights .light:nth-child(4)%7Banimation-duration:128s%7D.lights .light:nth-child(5)%7Banimation-duration:135s%7D.lights .light:nth-child(6)%7Banimation-duration:75s%7D.lights .light:nth-child(7)%7Banimation-duration:72s%7D.lights .light:nth-child(8)%7Banimation-duration:60s%7D.lights .light:nth-child(9)%7Banimation-duration:84s%7D.lights .light:nth-child(10)%7Banimation-duration:35s%7D.lights .light:nth-child(11)%7Banimation-duration:42s%7D.lights .light:nth-child(12)%7Banimation-duration:149s%7D.lights .light:nth-child(13)%7Banimation-duration:88s%7D.lights .light:nth-child(14)%7Banimation-duration:74s%7D.lights .light:nth-child(15)%7Banimation-duration:46s%7D.lights .light:nth-child(16)%7Banimation-duration:78s%7D.lights .light:nth-child(17)%7Banimation-duration:148s%7D.light.down%7Banimation-name:animateDown%7D.light.up%7Banimation-name:animateUp%7D%3C/style%3E%3Cg class='lines'%3E%3Cpath d='M1253.6 0h4.5v1920h-4.5zM873.3 0h1.8v1920h-1.8zM1100 0h1.8v1920h-1.8zM1547.1 0h4.5v1920h-4.5zM615 0h4.5v1920H615zM684.6 0h1.8v1920h-1.8zM1369.4 0h1.8v1920h-1.8zM1310.2 0h.9v1920h-.9zM1233.4 0h.9v1920h-.9zM124.2 0h.9v1920h-.9zM1818.4 0h4.5v1920h-4.5zM70.3 0h4.5v1920h-4.5zM1618.6 0h1.8v1920h-1.8zM455.9 0h1.8v1920h-1.8zM328.7 0h1.8v1920h-1.8zM300.8 0h4.6v1920h-4.6zM1666.4 0h.9v1920h-.9z' class='line'/%3E%3C/g%3E%3Cg class='lights'%3E%3Cpath d='M619.5 298.4H615v19.5h4.5v-19.5zm0 376.4H615v9.8h4.5v-9.8zm0-539.7H615v5.6h4.5v-5.6zm0-79.6H615v68.7h4.5V55.5z' class='light up'/%3E%3Cpath d='M1258.2 531.9h-4.5v8.1h4.5v-8.1zm0-34h-4.5v17.9h4.5v-17.9zm0-497.9h-4.5v25.3h4.5V0zm0 252.2h-4.5v42.4h4.5v-42.4z' class='light down'/%3E%3Cpath d='M875.1 123.8h-1.8v4h1.8v-4zm0 165.6h-1.8v24.1h1.8v-24.1zm0-289.4h-1.8v31.4h1.8V0zm0 50.2h-1.8v11.5h1.8V50.2z' class='light up'/%3E%3Cpath d='M1101.8 983.8h-1.8v8.2h1.8v-8.2zm0 92.1h-1.8v4.1h1.8v-4.1zm0-202.2h-1.8v4.2h1.8v-4.2zm0-22.7h-1.8v18.2h1.8V851z' class='light down'/%3E%3Cpath d='M686.4 822.7h-1.8v3.8h1.8v-3.8zm0 105.7h-1.8v23h1.8v-23zm0 115.4h-1.8v36.2h1.8v-36.2z' class='light up'/%3E%3Cpath d='M1551.6 860.9h-4.4v-34.1h4.4v34.1zm0-327.4h-4.4v-13.9h4.4v13.9zm0 546.5h-4.4v-89.1h4.4v89.1z' class='light down'/%3E%3Cpath d='M1311.1 707.7h-.9V698h.9v9.7zm0-270.9h-.9v-58.9h.9v58.9zm0-296.1h-.9V48h.9v92.7z' class='light up'/%3E%3Cpath d='M125.1 514.5h-.9v-9.7h.9v9.7zm0-270.9h-.9v-58.9h.9v58.9z' class='light down'/%3E%3Cpath d='M305.4 806.7h-4.6v-42.5h4.6v42.5zm0-408.2h-4.6v-17.3h4.6v17.3zm0 681.5h-4.6V968.8h4.6V1920z' class='light up'/%3E%3Cpath d='M1822.9 170.7h-4.5v13.7h4.5v-13.7zm0 264.4h-4.5v6.8h4.5v-6.8zm0-379.2h-4.5v4h4.5v-4zm0-55.9h-4.5v48.3h4.5V0z' class='light down'/%3E%3Cpath d='M1666.4 331.5h.9v9.7h-.9v-9.7zm0 270.9h.9v58.9h-.9v-58.9zm0 296.1h.9v92.7h-.9v-92.7z' class='light up'/%3E%3Cpath d='M1620.4 200.7h-1.8v6.4h1.8v-6.4zm0 268.4h-1.8v39h1.8v-39zm0-469.1h-1.8v51h1.8V0zm0 81.3h-1.8V100h1.8V81.3z' class='light down'/%3E%3Cpath d='M74.8 201h-4.5v16.2h4.5V201zm0 311.3h-4.5v8.1h4.5v-8.1zm0-446.5h-4.5v4.6h4.5v-4.6zm0-65.8h-4.5v56.8h4.5V0z' class='light up'/%3E%3Cpath d='M1371.2 655.3h-1.8v6.3h1.8v-6.3zm0 174.4h-1.8v37.9h1.8v-37.9zm0 190.6h-1.8v59.7h1.8v-59.7z' class='light down'/%3E%3Cpath d='M1234.3 898.1h-.9v-4.9h.9v4.9zm0-135.6h-.9V733h.9v29.5zm0-148.1h-.9V568h.9v46.4z' class='light up'/%3E%3Cpath d='M457.7 1010.8h-1.8v-18.1h1.8v18.1zm0-503.3h-1.8V398h1.8v109.5z' class='light down'/%3E%3Cpath d='M330.5 170.7h-1.8v13.7h1.8v-13.7zm0 264.4h-1.8v6.8h1.8v-6.8zm0-379.2h-1.8v4h1.8v-4zm0-55.9h-1.8v48.3h1.8V0z' class='light up'/%3E%3C/g%3E%3C/svg%3E");
		background-repeat: repeat-y;
	}

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

			&[aria-current='page'] {
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
