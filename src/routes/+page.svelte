<!-- TODO: Add visit tracking -->
<script lang="ts">
// import Header from '$lib/header/Header.svelte';
import Card2 from "./Card2.svelte";
import LiveMatrix from "$lib/components/LiveMatrix.svelte";

</script>

<!-- <Header /> -->
<!-- TODO: Improve and adapt the import header -->
<svelte:head>
	<title>Amun - Information Technology</title>
	<meta name="description" content="Unlock the enigma. Delve into layers of knowledge, where technology intertwines with mystery. Discover the unseen. Are you ready, for a new quest?" />
</svelte:head>

<video autoplay muted id="background">
	<source src="media/background.mp4" type="video/mp4" />
</video>
<main>
    <Card2 />
</main>
<LiveMatrix />

<!--
<footer>
	<p>visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit</p>
</footer>
-->

<style>
main {
	flex: 1;
	display: flex;
	flex-direction: column;
	padding: 1rem;
	width: 100%;
	max-width: 1024px;
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
