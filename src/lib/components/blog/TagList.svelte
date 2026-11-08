<!--
	@component
	The blog's tag chips: notched HUD tabs with a post count. Hover sends
	a light sweep across and lights the border in the viewport-fixed gradient; the current tag
	(or "All" on the index) stays lit.
-->
<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import * as m from '#lib/paraglide/messages.js';

	let {
		tags,
		current = null
	}: { tags: { name: string; slug: string; count?: number }[]; current?: string | null } = $props();
</script>

<ul aria-label={m.blog_tags()}>
	<li>
		<a href={localizeHref('/blog')} aria-current={current === null ? 'true' : undefined}>
			{m.blog_all()}
		</a>
	</li>
	{#each tags as tag (tag.slug)}
		<li>
			<a
				href={localizeHref(`/blog/tag/${tag.slug}`)}
				aria-current={current === tag.slug ? 'true' : undefined}
			>
				{tag.name}
				{#if tag.count}
					<span class="count">
						<span class="vh">{m.blog_posts_count({ count: tag.count })}</span>
						<span aria-hidden="true">{tag.count}</span>
					</span>
				{/if}
			</a>
		</li>
	{/each}
</ul>

<style>
	ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 0;
		margin: 0 0 2rem;
	}
	li {
		list-style: none;
		margin: 0;
	}
	a {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		min-height: 1.75rem;
		padding: 0.3rem 0.35rem 0.3rem 0.65rem;
		font-family: var(--f-mono);
		font-size: 0.6875rem;
		font-weight: 600;
		line-height: 1.2;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--c-text);
		text-decoration: none;
		border: 1px solid transparent;
		background:
			linear-gradient(var(--c-bg2), var(--c-bg2)) padding-box,
			linear-gradient(var(--c-line), var(--c-line)) border-box;
		clip-path: polygon(
			0 0,
			calc(100% - 0.5rem) 0,
			100% 0.5rem,
			100% 100%,
			0.5rem 100%,
			0 calc(100% - 0.5rem)
		);
		overflow: hidden;
	}
	a::before {
		content: '#';
		margin-right: -0.25rem;
		background: var(--fx-text) fixed;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	/* The light sweep. */
	a::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			100deg,
			transparent 35%,
			color-mix(in srgb, var(--c-neon-b) 28%, transparent) 50%,
			transparent 65%
		);
		transform: translateX(-110%);
		pointer-events: none;
	}
	a:is(:hover, :focus-visible)::after {
		transform: translateX(110%);
		transition: transform 0.55s ease-out;
	}
	a:is(:hover, :focus-visible, [aria-current='true']) {
		background:
			linear-gradient(var(--c-bg3), var(--c-bg3)) padding-box,
			var(--fx) fixed border-box;
	}
	a[aria-current='true'] {
		color: var(--c-head);
	}
	.count {
		min-width: 1.6em;
		padding: 0.15rem 0.3rem;
		text-align: center;
		font-size: 0.625rem;
		letter-spacing: 0.02em;
		color: var(--c-muted);
		background: var(--c-bg3);
	}
	a:is(:hover, :focus-visible, [aria-current='true']) .count {
		color: var(--c-btn-ink);
		background: var(--c-btn);
	}
	.vh {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
