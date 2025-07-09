<script>
	// import { setContext } from "svelte";
	// setContext("theme", "amun");

	let { children } = $props();
</script>

{#if children}
	<div style="height:100%">
		{@render children()}
	</div>
{/if}

<!--<svelte:head>
	{#if fonts}
		<link rel="preconnect" href="https://cdn.svar.dev" crossorigin />
		<FontOpenSans />
		<link
			rel="stylesheet"
			href="https://cdn.svar.dev/fonts/wxi/wx-icons.css"
		/>
	{/if}
</svelte:head>-->

<style>

</style>