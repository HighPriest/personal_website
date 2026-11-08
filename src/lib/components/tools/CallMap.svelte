<!--
	@component
	The translator's call map, the side column: for each call of the
	source standard, the call(s) of the target standard it becomes. It's a preview, read-only until
	"Edit map" is pressed. The page keeps the edits (per pair) and passes them back in `edits`;
	`onedit` reports each change. Rows in `invalid` (by slot) are marked as invalid (Pico shows
	them). The list scrolls inside the column, with a sticky head, so the page around it never
	grows.
-->
<script lang="ts">
	import * as m from '#lib/paraglide/messages.js';

	let {
		from,
		to,
		rows,
		targets,
		edits = {},
		invalid = [],
		onedit
	}: {
		from: string;
		to: string;
		/** One row per source call: its slot name and the target call(s) joined with "+". */
		rows: { slot: string; target: string }[];
		/** The target standard's call names, offered while editing. */
		targets: string[];
		/** The visitor's changes, by source slot. */
		edits?: Record<string, string>;
		/** Source slots whose target names a call the target standard doesn't have. */
		invalid?: string[];
		onedit: (slot: string, value: string) => void;
	} = $props();

	let editing = $state(false);
</script>

<aside aria-labelledby="call-map-title">
	<header>
		<h2 id="call-map-title">{m.tr_map()}</h2>
		<button type="button" aria-pressed={editing} onclick={() => (editing = !editing)}>
			{editing ? m.tr_map_done() : m.tr_map_edit()}
		</button>
		<p>{m.tr_map_summary({ from, to, count: rows.length })}</p>
	</header>
	<!-- The list scrolls on its own, so it is a focusable region keyboards can scroll (axe's
		scrollable-region-focusable rule asks for exactly this). -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div class="scroll" tabindex="0" role="region" aria-labelledby="call-map-title">
		<table>
			<thead>
				<tr><th scope="col">{from}</th><th scope="col">{to}</th></tr>
			</thead>
			<tbody>
				{#each rows as row, i (i)}
					<tr>
						<td>{row.slot}</td>
						<td>
							<input
								aria-label={m.tr_map_target({ standard: to, slot: row.slot })}
								list="call-map-targets"
								readonly={!editing}
								value={edits[row.slot] ?? row.target}
								aria-invalid={invalid.includes(row.slot) ? 'true' : undefined}
								oninput={(event) => onedit(row.slot, event.currentTarget.value)}
							/>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<datalist id="call-map-targets">
			{#each targets as target (target)}
				<option value={target}></option>
			{/each}
		</datalist>
	</div>
</aside>

<style>
	aside {
		display: flex;
		flex-direction: column;
		min-width: 0;
		padding: 1rem 1rem 0.5rem;
		background: color-mix(in srgb, var(--c-bg2) 80%, transparent);
		border: 1px solid var(--c-line);
		clip-path: polygon(0 0, calc(100% - var(--cut)) 0, 100% var(--cut), 100% 100%, 0 100%);
	}
	header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem 1rem;
		margin-bottom: 0.75rem;
	}
	h2 {
		margin: 0;
		font-size: 1.15rem;
	}
	p {
		order: 3;
		width: 100%;
		margin: 0;
		font-family: var(--f-mono);
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--pico-muted-color);
	}
	button {
		width: auto;
		margin: 0;
		padding: 0.35rem 0.8rem;
		font-size: 0.6875rem;
		--pico-background-color: var(--c-bg3);
		--pico-border-color: var(--c-line);
		--pico-color: var(--c-text);
	}
	button[aria-pressed='true'] {
		--pico-background-color: var(--c-btn);
		--pico-color: var(--c-btn-ink);
	}
	.scroll {
		max-height: 24rem;
		overflow: auto;
		overscroll-behavior: contain;
	}
	table {
		margin: 0;
	}
	th {
		position: sticky;
		top: 0;
		z-index: 1;
		background: var(--c-bg2);
	}
	td,
	th {
		padding: 0.35rem 0.5rem;
		font-family: var(--f-mono);
		font-size: 0.8125rem;
	}
	input {
		margin: 0;
		padding: 0.3rem 0.5rem;
		height: auto;
		font-family: var(--f-mono);
		font-size: 0.8125rem;
	}
	input[readonly] {
		padding-inline: 0;
		border-color: transparent;
		background: transparent;
		box-shadow: none;
		cursor: default;
	}
	/* Beside the controls on wide screens: capped to the screen, the list scrolls inside. */
	@media (min-width: 960px) {
		aside {
			max-height: max(18rem, min(44rem, calc(100dvh - 21rem)));
		}
		.scroll {
			max-height: none;
			flex: 1;
			min-height: 0;
		}
	}
</style>
