<script lang="ts">
	import Tag from "$lib/components/blog/BlogCategoryCard.svelte";
	import Header from "$lib/components/blog/Blog-Header.svelte";

	import type { PageData } from "./$types";
	let { data }: { data: PageData } = $props();

	console.log("Tags data: ", data);
</script>

<svelte:head>
	<title>Amun - Blog</title>
	<meta name="description" content="Welcome to my tech blog, our go-to source for insights on computer tech, cybersecurity & vehicular automation! Lets talk about artificial intelligence, machine learning, and the Internet of Things (IoT). Stay informed about network security, data protection, and the latest innovations in smart technology and autonomous vehicles. Join us as we dissect the future of tech and empower your digital journey with essential knowledge and buzzworthy updates!" />
</svelte:head>
<Header title="Topics"/>
<section id="tags">
{#each data.tagCards ?? [] as tagCards}
	<Tag {...tagCards}/>
{/each}
</section>

<style lang="scss">
/*	@font-face {
		src: url("https://www.axis-praxis.org/fonts/webfonts/MetaVariableDemo-Set.woff2")
			format("woff2");
		font-family: "Meta";
		font-style: normal;
		font-weight: normal;
	}
	h2 {
		transition: all 0.5s;
		-webkit-text-stroke: 2px #d6f4f4;
		font-variation-settings: "wght" 900, "ital" 1;
		font-size: 10rem;
		text-align: center;
		color: transparent;
		font-family: "Meta", sans-serif;
		text-shadow: 10px 10px 0px #07bccc, 15px 15px 0px #e601c8,
			20px 20px 0px #e9019a, 25px 25px 0px #f40468, 45px 45px 18px #482896;
		cursor: default;
		&:hover {
			font-variation-settings: "wght" 300, "ital" 1;
			text-shadow: 4px 4px 0px #07bccc;
		}
	}*/
	/*h2 {
		font-family: cursive;
		text-align: left;
		font-weight: normal;
		font-size: 5rem;
		color: var(--heading-color);
	}*/
	#tags {
		display: flex;
		flex-wrap: wrap;
		flex-direction: row;
		justify-content: center;
	}
</style>
