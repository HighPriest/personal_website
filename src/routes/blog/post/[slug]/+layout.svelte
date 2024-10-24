<script lang="ts">
	export let data;
	console.log("Post Layout Data:");
	console.log(data);
</script>

<article>
	<slot />
</article>

<style>

article {
	min-width: 20ch;
	max-width: 80ch;
	color: white;
}
</style>