<script lang="ts">
import { onMount } from "svelte";

onMount(() => {
	// const app = document.getElementById("app");
	const script = document.createElement("script");
	script.type = "module";
	script.src = "/livematrix/livematrix.js";
	document.head.appendChild(script);
});
</script>

<svelte:head>
    <link rel="stylesheet" href="/livematrix/livematrix.css">
</svelte:head>

<aside id="app" class="tw-fixed"></aside>

<style>
#app *{
	font-family:"Roboto",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
}
#app {
	right: 0;
	bottom: 0;
	width: 0;
}
</style>