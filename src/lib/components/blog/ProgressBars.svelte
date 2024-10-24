<script lang="ts">
  import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<div class="progress-card">
  {@render children()}
</div>

<style lang="scss">
*, ::after, ::before {
  margin: 0;
  padding: 0;
  box-sizing: inherit; }

a {
  text-decoration: none; }

ul {
  list-style: none; }

.center-text {
  text-align: center; }

/* --------------------------------- Card Server(<meter>) --------------------------------- */
.progress-card {
color: white;
text-align: start;
    :global(> progress) {
        inline-size: 75%;
    }
    :global(> label) {
        display: block; }
    :global(> progress::-webkit-progress-value) {
        background-color: yellow;
    }
}
</style>