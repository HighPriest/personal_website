/**
 * The mapping data: the CSVs in ./data are hashed static assets, listed here at
 * build time by their file names, and fetched only when the translator needs them:
 *
 * - `data/<Standard>/config.csv`: the calls a co-driver standard knows.
 * - `data/<Into>/<From>To<…>.csv`: a mapping from one standard into the folder's (the name may
 *   shorten the target: `FilipekMod/OriginalToFilipek.csv`).
 *
 * The folder is private in the public history (§7.1). Without it, every list here is empty.
 */
import { parseConfigCsv, parseMappingCsv } from './csv.ts';
import type { CallSlot, PacenoteMapping } from './types.ts';

export type DataIndex = {
	/** The standards that have a config, by name. */
	standards: string[];
	/** Each standard's config URL. */
	configs: Record<string, string>;
	/** Each mapping's URL, keyed `<From>To<Into>`. */
	mappings: Record<string, string>;
	/** For each target standard, the standards it has a mapping from. */
	sources: Record<string, string[]>;
};

/** The index of the data files, from a `{ './data/<Folder>/<File>.csv': url }` record. */
export function indexData(files: Record<string, string>): DataIndex {
	const index: DataIndex = { standards: [], configs: {}, mappings: {}, sources: {} };
	for (const [path, url] of Object.entries(files)) {
		const [, folder, file] = path.match(/\/data\/([^/]+)\/([^/]+)\.csv$/) ?? [];
		if (!folder) continue;
		if (file === 'config') {
			index.standards.push(folder);
			index.configs[folder] = url;
			continue;
		}
		// The folder is the target; the file names it in short (OriginalToFilipek in FilipekMod).
		const from = file.match(/^(.+?)To./)?.[1];
		if (!from) continue;
		index.mappings[`${from}To${folder}`] = url;
		(index.sources[folder] ??= []).push(from);
	}
	index.standards.sort();
	for (const list of Object.values(index.sources)) list.sort();
	return index;
}

const index = indexData(
	import.meta.glob<string>('./data/*/*.csv', { query: '?url', import: 'default', eager: true })
);

export const STANDARDS: readonly string[] = index.standards;

/** The standards with a mapping into `into`. */
export const sourcesFor = (into: string): readonly string[] => index.sources[into] ?? [];

const texts = new Map<string, Promise<string>>();

/** The text at `url`, fetched once per page visit. */
function text(url: string): Promise<string> {
	let pending = texts.get(url);
	if (!pending) {
		pending = fetch(url).then((response) => {
			if (!response.ok) throw new Error(`${url} answered ${response.status}`);
			return response.text();
		});
		pending.catch(() => texts.delete(url)); // a failed fetch may be retried
		texts.set(url, pending);
	}
	return pending;
}

/** The calls of `standard`, or none when it has no config. */
export async function loadCalls(standard: string): Promise<CallSlot[]> {
	const url = index.configs[standard];
	return url ? parseConfigCsv(await text(url)) : [];
}

/** The mapping from `from` into `into`, or none when there is no such mapping. */
export async function loadMapping(from: string, into: string): Promise<PacenoteMapping[]> {
	const url = index.mappings[`${from}To${into}`];
	return url ? parseMappingCsv(await text(url)) : [];
}
