<script lang="ts">
	import { goto } from '$app/navigation';
	import Nav from '$lib/components/navigation/nav.svelte';
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();

	import { Breadcrumbs, type Crumb } from 'svelte-breadcrumbs';
	import { page } from '$app/state';
</script>

<Breadcrumbs url={page.url} routeId={page.route.id} crumbs={page.data.crumbs ? page.data.crumbs : null}>
	{#snippet children({ crumbs })}
    <div>
      <span><a href="/">Home</a></span>
      <!--
      Loop over the generated crumbs array
      -->
      {#each crumbs as c}
        <span>></span>
		<div style="display: inline-table">
		{#if c.metadata !== undefined}
		<span>
			{#if c.url}
          	<a href={c.url}>
            {c.title}</a>
			{:else}
			<span>{c.title}</span>
			{/if}
        </span>
		{#each c.metadata.altRoutes as alt}
				<br>
				{#if alt.url}
				<a href={alt.url}>
				{alt.title}</a>
				{:else}
				<span>{alt.title}</span>
				{/if}
		{/each}
		{:else}
        <span>
			{#if c.url}
          	<a href={c.url}>
            {c.title}</a>
			{:else}
			<span>{c.title}</span>
			{/if}
        </span>
		{/if}
		</div>
      {/each}
    </div>
  {/snippet}
</Breadcrumbs>

<main id="tool">
	{@render children()}
</main>
<Nav />

<style lang="scss">
	main {
		max-width: 100rem;
	}
</style>