<script>
	import Tag from "$lib/components/Blog-Tag.svelte";
	import Header from "$lib/components/header/Blog-Header.svelte";

	/** @type {import('./$types').PageData} */
	export let data;
</script>

<svelte:head>
	<title>Amun - Blog</title>
	<meta name="description" content="Welcome to my tech blog, our go-to source for insights on computer tech, cybersecurity & vehicular automation! Lets talk about artificial intelligence, machine learning, and the Internet of Things (IoT). Stay informed about network security, data protection, and the latest innovations in smart technology and autonomous vehicles. Join us as we dissect the future of tech and empower your digital journey with essential knowledge and buzzworthy updates!" />
</svelte:head>
<Header />
<h2>Topics</h2>
<section id="tags">
{#each data.tags ?? [] as tag}
	<Tag {...tag} />
{/each}
</section>

<style>
	#tags {
		display: flex;
		flex-wrap: wrap;
		flex-direction: row;
		justify-content: center;
	}
</style>