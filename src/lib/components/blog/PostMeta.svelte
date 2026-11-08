<!--
	@component
	A post's meta line in HUD style: the date (with a small tick in the viewport-fixed gradient),
	then the reading time and authors when known. `small` is the card size.
-->
<script lang="ts">
	import { getLocale } from '#lib/paraglide/runtime.js';
	import * as m from '#lib/paraglide/messages.js';

	let {
		date,
		readingTime,
		authors = [],
		small = false
	}: { date?: string; readingTime?: number; authors?: string[]; small?: boolean } = $props();

	const formatted = $derived(
		date
			? new Intl.DateTimeFormat(getLocale(), {
					day: 'numeric',
					month: 'short',
					year: 'numeric'
				}).format(new Date(date))
			: ''
	);
</script>

<p class={{ small }}>
	{#if date}<time datetime={date}>{formatted}</time>{/if}
	{#if readingTime}<span>{m.blog_reading_time({ minutes: readingTime })}</span>{/if}
	{#if authors.length}<span>{authors.join(', ')}</span>{/if}
</p>

<style>
	p {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin: 0 0 0.5rem;
		font-family: var(--f-mono);
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--pico-muted-color);
	}
	.small {
		font-size: 0.625rem;
		letter-spacing: 0.08em;
	}
	time::before {
		content: '';
		display: inline-block;
		width: 0.4rem;
		height: 0.4rem;
		margin-right: 0.45rem;
		background: var(--fx) fixed;
		clip-path: polygon(0 0, 100% 0, 100% 100%);
	}
	* + span::before {
		content: '·';
		margin-right: 0.5rem;
	}
</style>
