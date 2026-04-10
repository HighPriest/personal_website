<script lang="ts">
	import { onMount } from 'svelte';

	let chatButton

	onMount(() => {
		const buttonElement = document.querySelector(
			'#app > div > div.bubble'
		);

		if (buttonElement) {
			//chatButton = buttonElement;
			//buttonElement.addEventListener('click', () => umami.track('Chat button'));
		}
	});
</script>

<svelte:head>
	<script type="module" src="/livematrix/livematrix.js"></script>
	<link rel="stylesheet" href="/livematrix/livematrix.css" />
</svelte:head>

<span id="livematrix" style="display: contents"></span>

<style>
/* 	#app * {
		font-family: 'Roboto', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
			'Noto Color Emoji';
	}
	#app {
		right: 0;
		bottom: 0;
		width: 0;
	} */
</style>
