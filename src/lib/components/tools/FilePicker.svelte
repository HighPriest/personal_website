<!--
	@component
	The translator's pacenote files (A11Y-2): a drop zone that invites dragging the MyPacenotes
	folder or single .ini files, with two native pickers inside it, a folder (subfolders kept) or
	single files. While files are dragged anywhere over the page, the zone lights up and a drop
	anywhere counts (so a missed drop can't open the file in the browser). Only .ini files are
	kept; the names of the others land in `skipped`. Both are bindable; a new choice replaces the
	previous one.
-->
<script lang="ts">
	import * as m from '#lib/paraglide/messages.js';

	let { files = $bindable([]), skipped = $bindable([]) }: { files?: File[]; skipped?: string[] } =
		$props();

	let dragging = $state(false);

	const isIni = (file: File) => /\.ini$/i.test(file.name);

	function choose(chosen: File[]) {
		files = chosen.filter(isIni);
		skipped = chosen
			.filter((file) => !isIni(file))
			.map((file) => file.webkitRelativePath || file.name);
	}

	function picked(event: Event & { currentTarget: HTMLInputElement }) {
		choose([...(event.currentTarget.files ?? [])]);
		event.currentTarget.value = ''; // the same folder can be chosen again
	}

	/** A dropped entry's files; files in a dropped folder keep their path from it. */
	async function walk(entry: FileSystemEntry): Promise<File[]> {
		if (entry.isFile) {
			const file = await new Promise<File>((resolve, reject) =>
				(entry as FileSystemFileEntry).file(resolve, reject)
			);
			const path = entry.fullPath.replace(/^\//, '');
			if (!path.includes('/')) return [file];
			const copy = new File([file], file.name, {
				type: file.type,
				lastModified: file.lastModified
			});
			Object.defineProperty(copy, 'webkitRelativePath', { value: path });
			return [copy];
		}
		const reader = (entry as FileSystemDirectoryEntry).createReader();
		const children: FileSystemEntry[] = [];
		for (;;) {
			const batch = await new Promise<FileSystemEntry[]>((resolve, reject) =>
				reader.readEntries(resolve, reject)
			);
			if (batch.length === 0) break;
			children.push(...batch);
		}
		return (await Promise.all(children.map(walk))).flat();
	}

	/** Whether a drag carries files (not text or a link). */
	const carriesFiles = (event: DragEvent) => !!event.dataTransfer?.types.includes('Files');

	function over(event: DragEvent) {
		if (!carriesFiles(event)) return;
		event.preventDefault(); // allows the drop
		dragging = true;
	}

	function left(event: DragEvent) {
		if (!event.relatedTarget) dragging = false; // left the window
	}

	async function dropped(event: DragEvent) {
		if (!carriesFiles(event)) return;
		event.preventDefault();
		dragging = false;
		const transfer = event.dataTransfer!;
		// The entries must be taken before the first await: the drop's data is gone after it.
		const entries = [...transfer.items]
			.map((item) => item.webkitGetAsEntry?.())
			.filter((entry): entry is FileSystemEntry => !!entry);
		const loose = [...transfer.files];
		choose(entries.length ? (await Promise.all(entries.map(walk))).flat() : loose);
	}
</script>

<svelte:window ondragover={over} ondragleave={left} ondrop={dropped} />

<fieldset class={{ dragging, chosen: files.length > 0 }}>
	<legend>{m.tr_files()}</legend>
	<svg class="art" viewBox="0 0 48 40" aria-hidden="true">
		<path d="M3 8 h14 l4 4 h24 v25 h-42 z" />
		<path class="arrow" d="M24 17 v13 m-6 -6 l6 6 l6 -6" />
	</svg>
	<p class="lead">
		{files.length ? m.tr_files_ready({ count: files.length }) : m.tr_drop_lead()}
	</p>
	<p class="or">{m.tr_or()}</p>
	<div class="buttons">
		<label class="pick">
			<input
				type="file"
				webkitdirectory
				multiple
				aria-describedby="pacenote-files-hint"
				onchange={picked}
			/>
			{m.tr_pick_folder()}
		</label>
		<label class="pick other">
			<input
				type="file"
				multiple
				accept=".ini"
				aria-describedby="pacenote-files-hint"
				onchange={picked}
			/>
			{m.tr_pick_files()}
		</label>
	</div>
	<small id="pacenote-files-hint">
		{m.tr_files_hint({ path: 'RBR\\Plugins\\NGPCarMenu\\MyPacenotes' })}
	</small>
	<span class="drop" aria-hidden="true">{m.tr_drop()}</span>
</fieldset>

<style>
	/* The drop zone: a big dashed panel that lights up on hover and while files are dragged. */
	fieldset {
		position: relative;
		display: grid;
		justify-items: center;
		gap: 0.5rem;
		margin: 0 0 1rem;
		padding: 1.25rem 1rem 1rem;
		border: 2px dashed var(--c-line);
		background: color-mix(in srgb, var(--c-bg3) 60%, transparent);
		text-align: center;
		transition:
			border-color var(--pico-transition),
			box-shadow var(--pico-transition),
			background-color var(--pico-transition);
	}
	fieldset:hover,
	fieldset:focus-within {
		border-color: var(--c-neon-b);
	}
	legend {
		padding: 0 0.35rem;
		text-align: left;
		justify-self: start;
	}
	.art {
		width: 3.5rem;
		height: auto;
		fill: none;
		stroke: var(--c-link);
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.lead {
		margin: 0;
		color: var(--c-text);
		font-family: var(--f-display);
		font-size: 1.15rem;
		font-weight: 600;
	}
	.chosen .lead {
		color: var(--c-head);
	}
	.or {
		margin: 0;
		color: var(--c-muted);
		font-family: var(--f-mono);
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.buttons {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.75rem;
	}
	small {
		color: var(--c-muted);
	}
	/* The labels look like buttons; the inputs inside stay focusable for keyboards, but unseen. */
	.pick {
		position: relative;
		display: inline-block;
		margin: 0;
		padding: 0.5rem 1rem;
		border: 1px solid var(--c-btn);
		background: var(--c-btn);
		color: var(--c-btn-ink);
		cursor: pointer;
	}
	.pick.other {
		border-color: var(--c-line);
		background: var(--c-bg3);
		color: var(--c-text);
	}
	.pick input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}
	.pick:focus-within {
		outline: var(--pico-outline-width) solid var(--c-neon-b);
		outline-offset: 2px;
	}
	/* Files dragged over the page: the zone glows, and the drop text covers it, in place. */
	.drop {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		background: color-mix(in srgb, var(--c-bg) 80%, transparent);
		color: var(--c-head);
		font-family: var(--f-display);
		font-size: 1.35rem;
		font-weight: 600;
		visibility: hidden;
	}
	.dragging {
		border-color: var(--c-neon-y);
		box-shadow: 0 0 1.5rem color-mix(in srgb, var(--c-neon-y) 40%, transparent);
	}
	.dragging .drop {
		visibility: visible;
	}
	@media (prefers-reduced-motion: no-preference) {
		.arrow {
			animation: nudge 1.6s ease-in-out infinite;
		}
		.dragging .drop {
			animation: pulse 1s ease-in-out infinite alternate;
		}
	}
	@keyframes nudge {
		50% {
			transform: translateY(3px);
		}
	}
	@keyframes pulse {
		to {
			color: var(--c-link);
		}
	}
</style>
