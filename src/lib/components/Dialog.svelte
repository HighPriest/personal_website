<!--
	@component
	A modal dialog on the native `<dialog>` (A11Y-3): `showModal()` keeps focus inside, Escape and
	the close button close it, and the browser returns focus to where it was. `open` is bindable.
	Content comes as snippets and renders as text (SEC-5): never `{@html}` in here.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		title,
		closeLabel,
		children,
		actions
	}: {
		open?: boolean;
		title: string;
		closeLabel: string;
		children: Snippet;
		/** Buttons or links before the close button; the first one takes focus. */
		actions?: Snippet;
	} = $props();

	const titleId = $props.id();

	/** Keeps the element in step with `open` (closing by Escape updates `open` through onclose). */
	function modal(dialog: HTMLDialogElement) {
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}
</script>

<dialog {@attach modal} aria-labelledby={titleId} onclose={() => (open = false)}>
	<article>
		<header>
			<h2 id={titleId}>{title}</h2>
		</header>
		{@render children()}
		<footer>
			{@render actions?.()}
			<button type="button" onclick={() => (open = false)}>{closeLabel}</button>
		</footer>
	</article>
</dialog>

<style>
	h2 {
		margin: 0;
		font-size: 1.25rem;
	}
	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 0.75rem;
	}
	footer :global(:is(a, button)) {
		margin: 0;
	}
</style>
