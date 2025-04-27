<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { PageData } from "./$types";

	import '$lib/components/Ghost/Post.scss';

	import { trackPageView } from '@lukulent/svelte-umami';
	let { data }: { data: PageData } = $props();

	// Create Tags List
	/*data.post?.tags.forEach(tag => {
			addTag(tag);
	});*/

	console.log("Post Read data: ", data);

	onMount(() => {
		const script = document.createElement("script");
		script.src = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js";
		script.integrity = "sha512-9khQRAUBYEJDCDVP2yw3LRUQvjJ0Pjx0EShmaQjcHa6AXiOv6qHQu9lCAIR8O+/D8FtaCoJ2c0Tf9Xo7hYH01Q==";
		script.crossOrigin = "anonymous";
		script.referrerPolicy="no-referrer";
		document.head.appendChild(script);

		const script2 = document.createElement("script");
		script2.src = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js";
		script2.integrity = "sha512-SkmBfuA2hqjzEVpmnMt/LINrjop3GKWqsuLSSB3e7iBmYK7JuWw4ldmmxwD9mdm2IRTTi0OxSAfEGvgEi0i2Kw==";
		script2.crossOrigin = "anonymous";
		script2.referrerPolicy="no-referrer";
		document.head.appendChild(script2);

		trackPageView({url: page.url.pathname });
	})

	// TODO: ?Add this type of fancy content list?
</script>
<style lang="scss">
	//@import '$lib/components/Ghost/Post.css';
	//@import '$lib/components/Ghost/Prism-tomorrow-default.css';
</style>
<!--Prism is for code snippets -->
<svelte:head>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" integrity="sha512-vswe+cgvic/XBoF1OcM/TeJ2FW0OofqAVdCZiEYkd6dwGXthvkSFWOoGGJgS2CW70VK5dQM5Oh+7ne47s74VTg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
	{#await data.post}
	{:then post}
	<title>{post?.title}</title>
	<meta name="description" content="{post?.excerpt}"/>
	{/await}
</svelte:head>

{#await data.post}
<p>...loading</p>
{:then post}
<h1>{post?.title ?? ''}</h1>
{@html post?.html ?? ''}
{#if post && post.tags}
<!-- TODO: Create tags creation -->
{/if}
{/await}

<!-- TODO: Add comments section-->