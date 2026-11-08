<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import * as m from '#lib/paraglide/messages.js';
	import Kicker from '#lib/components/Kicker.svelte';
	import CallMap from '#lib/components/tools/CallMap.svelte';
	import FilePicker from '#lib/components/tools/FilePicker.svelte';
	import StandardSelect from '#lib/components/tools/StandardSelect.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import { onMount } from 'svelte';
	import { loadCalls, loadMapping, sourcesFor, STANDARDS } from '#lib/pacenotes/data.js';
	import { translate } from '#lib/pacenotes/engine.js';
	import { buildMapping } from '#lib/pacenotes/mapping.js';
	import type { CallSlot, PacenoteMapping } from '#lib/pacenotes/types.js';

	// The same defaults and data relations as the old page (tag legacy/old-ui): "to" is a
	// standard; "from" is one of the standards with a mapping into it.
	let to = $state('FilipekMod');
	let from = $state('Handwerker14');
	let files = $state<File[]>([]);
	let skipped = $state<string[]>([]);

	// The lists come from the data index, so they're in the prerendered page; the calls and the
	// mapping of the chosen pair are fetched in the browser (#lib/pacenotes/data.ts): once on
	// arrival, then whenever a select changes. Each load takes a number, so an older answer that
	// arrives late can't replace a newer one.
	const standards = STANDARDS;
	const sources = $derived(sourcesFor(to));
	let pair = $state<{ from: CallSlot[]; to: CallSlot[]; mapping: PacenoteMapping[] }>();
	let loadFailed = $state(false);
	let loads = 0;

	async function loadPair() {
		const load = ++loads;
		loadFailed = false;
		try {
			const [fromCalls, toCalls, mapping] = await Promise.all([
				loadCalls(from),
				loadCalls(to),
				loadMapping(from, to)
			]);
			if (load === loads) pair = { from: fromCalls, to: toCalls, mapping };
		} catch {
			if (load === loads) {
				pair = undefined;
				loadFailed = true;
			}
		}
	}
	onMount(loadPair);

	// The visitor's call map edits, kept per pair (switching back finds them again).
	let editsByPair = $state<Record<string, Record<string, string>>>({});
	const pairKey = $derived(`${from}→${to}`);
	const edits = $derived(editsByPair[pairKey] ?? {});
	let invalid = $state<string[]>([]);

	function edit(slot: string, value: string) {
		(editsByPair[pairKey] ??= {})[slot] = value;
		invalid = invalid.filter((other) => other !== slot);
	}

	// Names can repeat in the data (a slot name used by two calls), so the lists offered in the
	// form are de-duplicated.
	const unique = (names: string[]) => [...new Set(names)];
	const targets = $derived(unique(pair?.to.map((call) => call.slot) ?? []));
	const rows = $derived(
		(pair?.from ?? [])
			.filter((call) => !isNaN(call.id))
			.map((call) => ({
				call,
				slot: call.slot,
				target:
					pair?.mapping.find((entry) => entry.old_id === call.id)?.new_pacenote.join('+') ?? ''
			}))
	);
	const unmapped = $derived(rows.filter((row) => !(edits[row.slot] ?? row.target)).length);

	// The result of the last save, shown in the dialog: the translation and its download, or why
	// it couldn't be made.
	type Outcome =
		| {
				ok: true;
				url: string;
				files: number;
				mapped: number;
				unchanged: number;
				from: string;
				to: string;
		  }
		| { ok: false; message: string };
	let outcome = $state<Outcome>();
	let dialogOpen = $state(false);
	let busy = $state(false);

	function show(next: Outcome) {
		if (outcome?.ok) URL.revokeObjectURL(outcome.url);
		outcome = next;
		dialogOpen = true;
	}

	async function save(event: SubmitEvent) {
		event.preventDefault();
		if (busy) return;
		if (files.length === 0) return show({ ok: false, message: m.tr_error_no_files() });
		if (!pair) return show({ ok: false, message: m.tr_error_no_data() });

		// Only rows the visitor changed are rebuilt; the rest keep the data's ids.
		const changed = rows
			.filter((row) => row.slot in edits && edits[row.slot] !== row.target)
			.map((row) => ({ call: row.call, target: edits[row.slot] }));
		const { mapping, unknown } = buildMapping(pair.mapping, changed, pair.to);
		invalid = unknown;
		if (unknown.length) {
			return show({ ok: false, message: m.tr_error_unknown({ to, slots: unknown.join(', ') }) });
		}

		busy = true;
		try {
			const result = await translate(files, mapping, to);
			show({
				ok: true,
				url: URL.createObjectURL(result.zip),
				files: result.files,
				mapped: result.mapped,
				unchanged: result.unchanged,
				from,
				to
			});
		} catch (error) {
			const reason = error instanceof Error ? error.message : String(error);
			show({ ok: false, message: m.tr_error_failed({ reason }) });
		} finally {
			busy = false;
		}
	}

	function reset() {
		files = [];
		skipped = [];
		editsByPair = {};
		invalid = [];
	}
</script>

<Seo title="{m.tool_translator_title()} · Amun" description={m.tr_lead()} />

<header>
	<Kicker>
		<a href={localizeHref('/tools')}>{m.nav_simracing()}</a> / {m.tool_translator_title()}
	</Kicker>
	<h1>{m.tool_translator_title()}</h1>
</header>

<!-- Controls in one column, the call map in a side column. Nothing leaves
	the browser: the files are read and translated here. -->
<form class="translator" onsubmit={save}>
	<div class="controls">
		<FilePicker bind:files bind:skipped />
		<div class="pair">
			<StandardSelect
				id="translate-from"
				label={m.tr_from()}
				options={sources}
				bind:value={
					() => from,
					(value) => {
						from = value;
						loadPair();
					}
				}
			/>
			<StandardSelect
				id="translate-to"
				label={m.tr_to()}
				options={standards}
				bind:value={
					() => to,
					(value) => {
						to = value;
						loadPair();
					}
				}
			/>
		</div>
		<p class="status" role="status">
			<span>{m.tr_status_files()} <b>{files.length}</b></span>
			<span>{m.tr_status_calls()} <b>{rows.length}</b></span>
			<span>{m.tr_status_unmapped()} <b>{unmapped}</b></span>
			{#if loadFailed}<span class="warn">{m.tr_status_load_failed()}</span>{/if}
			{#if skipped.length}
				<span class="skipped"
					>{m.tr_skipped({ count: skipped.length, names: skipped.join(', ') })}</span
				>
			{/if}
		</p>
		<div class="actions">
			<button type="submit" aria-busy={busy}>{busy ? m.tr_busy() : m.tr_save()}</button>
			<button type="button" onclick={reset}>{m.tr_reset()}</button>
		</div>
	</div>

	<CallMap {from} {to} {rows} {targets} {edits} {invalid} onedit={edit} />
</form>

<Dialog
	bind:open={dialogOpen}
	title={outcome?.ok ? m.tr_done_title() : m.tr_error_title()}
	closeLabel={m.tr_close()}
>
	{#if outcome?.ok}
		<p>
			{m.tr_done_text({
				files: outcome.files,
				from: outcome.from,
				to: outcome.to,
				mapped: outcome.mapped,
				unchanged: outcome.unchanged
			})}
		</p>
	{:else if outcome}
		<p>{outcome.message}</p>
	{/if}
	{#snippet actions()}
		{#if outcome?.ok}
			<a role="button" href={outcome.url} download="translated_pacenotes.zip">{m.tr_download()}</a>
		{/if}
	{/snippet}
</Dialog>

<style>
	header {
		padding-top: 1rem;
	}
	.translator {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.5rem 2.5rem;
	}
	.controls {
		align-self: start;
	}
	.pair {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
		gap: 0 1rem;
	}
	.status {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1.5rem;
		margin: 0 0 1.25rem;
		padding: 0.6rem 0.8rem;
		border: 1px dashed var(--c-line);
		font-family: var(--f-mono);
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--pico-muted-color);
	}
	.status b {
		color: var(--c-text);
		font-weight: 600;
	}
	.status .warn {
		color: var(--code-token-deleted);
	}
	/* Skipped file names can be long: they wrap within the line and keep their case. */
	.status .skipped {
		flex-basis: 100%;
		overflow-wrap: anywhere;
		text-transform: none;
		letter-spacing: 0;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	.actions button {
		width: auto;
		margin: 0;
	}
	@media (min-width: 960px) {
		.translator {
			grid-template-columns: minmax(20rem, 1fr) minmax(0, 1.15fr);
			align-items: start;
		}
	}
</style>
