<!-- TODO: Add visit tracking -->
<script lang="ts">
	// import Header from '$lib/header/Header.svelte';
	import Card from './Card.svelte';
	import LiveMatrix from '$lib/components/LiveMatrix.svelte';

	import * as m from '$lib/paraglide/messages.js';
</script>

<svelte:head>
	<title>{m.landing_title()}</title>
	<meta
		name="description"
		content="{m.landing_description()}"
	/>
</svelte:head>

<video autoplay muted id="background">
	<source src="media/background.mp4" type="video/mp4" />
</video>
<main>
	<Card>
		{#snippet company()}
			<h1>Amun</h1>
			<p>Tech & Software Development</p>
		{/snippet}

		{#snippet contact()}
			<h2>contactⓐⓣamun.pl</h2>
			<p>{@html m.card_contact_guide()}</p>
		{/snippet}
	</Card>
</main>
<LiveMatrix />

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 1024px;
		height: 100vh;
		margin: 0 auto;
		box-sizing: border-box;
	}

	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	#background {
		position: fixed;
		right: 0;
		bottom: 0;
		min-width: 100%;
		min-height: 100%;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	}
</style>
