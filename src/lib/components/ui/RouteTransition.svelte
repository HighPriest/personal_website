<!-- Source: https://github.com/navneetsharmaui/sveltekit-blog/blob/main/src/lib/shared/ui/components/route-transition/RouteTransition.svelte -->
<!-- Used in: https://github.com/navneetsharmaui/sveltekit-blog/blob/main/src/routes/__layout.svelte -->
<script lang="ts">
	import { crossfade } from 'svelte/transition';
	import type { NavigationTarget } from '@sveltejs/kit';
	import type { Snippet } from 'svelte';

	// Crossfade setup
	const [send, receive] = crossfade({
		duration: 800,
		fallback(node, params) {
			// Fly + Fade combo
			return {
				duration: 400,
				css: (t) => `
					opacity: ${t};
					transform: translateX(${(1 - t) * 6}rem);
				`
			};
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
        const portrait = window.matchMedia('(orientation: portrait)').matches;

		el.style.position = 'absolute';
		el.style.top = portrait ? '0' : '6rem';
		el.style.left = '0';
		el.style.width = '100%';
	}
</script>

{#key pagein}
	<span
		in:receive={{ key: pagein ?? 'default' }}
		out:send={{ key: pageout ?? 'default' }}
		onoutrostart={makeAbsolute}
	>
		{@render children()}
    </span>
{/key}

<style>
	span {
		padding-top: 6rem; /* space below fixed header */
	}
	@media (orientation: portrait) {
		span {
			padding-top: 0;
			margin-bottom: 6rem;
			padding-bottom: 2rem;
		}
	}
</style>

