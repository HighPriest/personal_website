<!--
	@component
	The first focusable element on every page: hidden until it has keyboard focus, then it jumps
	to <main id="content"> (which takes focus with tabindex="-1").
-->
<script lang="ts">
	import * as m from '#lib/paraglide/messages.js';
</script>

<a href="#content">{m.skip_to_content()}</a>

<style>
	a {
		position: fixed;
		z-index: 40;
		top: max(0.75rem, env(safe-area-inset-top, 0px));
		left: max(16px, env(safe-area-inset-left, 0px));
		padding: 0.6rem 1rem;
		font-family: var(--f-mono);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-decoration: none;
		color: var(--c-btn-ink);
		background: var(--c-btn);
		transform: translateY(calc(-100% - 2rem));
	}
	a:focus {
		transform: none;
	}
</style>
