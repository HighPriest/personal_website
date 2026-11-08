<!--
	@component
	The contact door's two channels, Discord and Telegram (#lib/contact.ts), each opening in a new
	tab. The buttons start stacked in the middle and slide apart as the door opens (its --open
	property).
-->
<script lang="ts">
	import { discord, telegram } from '#lib/contact.js';

	const channels = [discord, telegram];
</script>

<span class="channels">
	{#each channels as channel (channel.name)}
		<!-- Umami records the click (#lib/components/Analytics.svelte). -->
		<a
			href={channel.href}
			target="_blank"
			rel="noopener"
			data-umami-event="contact"
			data-umami-event-channel={channel.name.toLowerCase()}
			data-umami-event-place="door"
		>
			<svg viewBox="0 0 24 24" aria-hidden="true"><path d={channel.icon} /></svg>
			{channel.name}
		</a>
	{/each}
</span>

<style>
	.channels {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.6rem;
		margin-top: 0.5rem;
	}
	.channels > a {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		width: auto;
		margin: 0;
		padding: 0.55rem 0.9rem;
		font-family: var(--f-mono);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		text-decoration: none;
		color: var(--c-text);
		border: 1px solid transparent;
		background:
			linear-gradient(var(--c-bg2), var(--c-bg2)) padding-box,
			var(--fx) fixed border-box;
		clip-path: polygon(
			0.5rem 0,
			100% 0,
			100% calc(100% - 0.5rem),
			calc(100% - 0.5rem) 100%,
			0 100%,
			0 0.5rem
		);
		box-shadow: none;
		transition:
			translate 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s,
			color var(--pico-transition);
	}
	/* Stacked in the middle while the door is closed; apart when it opens. */
	.channels > :first-child {
		translate: calc((1 - var(--open, 1)) * (50% + 0.3rem)) 0;
	}
	.channels > :last-child {
		translate: calc((1 - var(--open, 1)) * (-50% - 0.3rem)) 0;
	}
	.channels > a:is(:hover, :focus-visible) {
		color: var(--c-head);
		background:
			linear-gradient(var(--c-bg3), var(--c-bg3)) padding-box,
			var(--fx) fixed border-box;
	}
	svg {
		width: 1.1rem;
		height: 1.1rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.6;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
</style>
