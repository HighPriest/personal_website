/**
 * The mapping the engine gets: the data's mapping for the chosen pair, with the visitor's call
 * map edits applied. The data's entries carry their target ids, and are used as they are (some
 * name target calls the target's config doesn't list; their ids are still right). An edited row
 * is rebuilt from the call name(s) it now shows (several joined with `+`), looked up in the target
 * standard's calls.
 */
import type { CallSlot, PacenoteMapping } from './types.ts';

/** A source call and the target call name(s) the visitor typed for it. */
export type CallEdit = { call: CallSlot; target: string };

/**
 * `base` with `edits` applied. An edit replaces the entries for its call's id. An empty edit
 * removes them, so those calls stay as they were. An edit naming a call the target standard
 * doesn't have (names must match exactly) is reported in `unknown`, by the source slot, and not
 * applied.
 */
export function buildMapping(
	base: PacenoteMapping[],
	edits: CallEdit[],
	targetCalls: CallSlot[]
): { mapping: PacenoteMapping[]; unknown: string[] } {
	const bySlot = new Map<string, CallSlot>();
	for (const call of targetCalls) if (!bySlot.has(call.slot)) bySlot.set(call.slot, call);

	const replaced = new Map<number, PacenoteMapping | null>();
	const unknown = new Set<string>();
	for (const { call, target } of edits) {
		if (isNaN(call.id)) continue;
		const names = target
			.split('+')
			.map((name) => name.trim())
			.filter(Boolean);
		const targets = names.map((name) => bySlot.get(name));
		if (targets.some((found) => !found)) {
			unknown.add(call.slot);
			continue;
		}
		replaced.set(
			call.id,
			names.length === 0
				? null
				: {
						old_category: call.category,
						old_id: call.id,
						old_pacenote: call.slot,
						new_category: targets.map((found) => found!.category),
						new_id: targets.map((found) => found!.id),
						new_pacenote: targets.map((found) => found!.slot)
					}
		);
	}

	const mapping = base.filter((entry) => !replaced.has(entry.old_id));
	for (const entry of replaced.values()) if (entry) mapping.push(entry);
	return { mapping, unknown: [...unknown] };
}
