<!-- Source: https://github.com/navneetsharmaui/sveltekit-blog/blob/main/src/lib/shared/ui/components/route-transition/RouteTransition.svelte -->
<!-- Used in: https://github.com/navneetsharmaui/sveltekit-blog/blob/main/src/routes/__layout.svelte -->
<script lang="ts">
    import { blur } from 'svelte/transition';
    import type { NavigationTarget } from '@sveltejs/kit';
    import type { Snippet } from 'svelte';

    let { children, pageout, pagein }: { children: Snippet, pageout: NavigationTarget | null, pagein: NavigationTarget | null } = $props();
</script>

{#key pagein}
	<span in:blur="{{ duration: 600, delay: 50, amount: 5 }}" out:blur="{{ duration: 100 }}">
		{@render children()}
	</span>
{/key}