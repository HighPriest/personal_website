<!-- Source: https://github.com/navneetsharmaui/sveltekit-blog/blob/main/src/lib/shared/ui/components/route-transition/RouteTransition.svelte -->
<!-- Used in: https://github.com/navneetsharmaui/sveltekit-blog/blob/main/src/routes/__layout.svelte -->
<script lang="ts">
	import { crossfade } from 'svelte/transition';
	import type { NavigationTarget } from '@sveltejs/kit';
	import type { Snippet } from 'svelte'; // setup crossfade with custom options
	const [send, receive] = crossfade({
		duration: (d) => Math.sqrt(d * 100), // example easing by distance
		fallback(node, params) {
			// fallback for elements that can't crossfade
			return { duration: 300, easing: (t) => t, css: (t) => `opacity: ${t}` };
		}
	});
	let {
		children,
		pageout,
		pagein
	}: { children: Snippet; pageout: NavigationTarget | null; pagein: NavigationTarget | null } =
		$props();

    function makeAbsolute(e: Event) {
		const el = e.currentTarget as HTMLElement;
		el.style.position = 'absolute';
		el.style.top = '6rem';
		el.style.left = '0';
		el.style.width = '100%';
	}
</script>

{#key pagein}
	<span in:receive={{ key: pagein ?? 'default' }} onoutrostart={makeAbsolute} out:send={{ key: pageout ?? 'default' }}>
		{@render children()}
    </span>
{/key}
