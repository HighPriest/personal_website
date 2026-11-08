/** One call of a source standard and the call(s) of the target standard it becomes. */
export type PacenoteMapping = {
	old_category: string;
	old_pacenote: string;
	old_id: number;
	new_category: string[];
	new_pacenote: string[];
	new_id: number[];
};

/** A named mapping from one standard into another (e.g. Original → FilipekMod). */
export type MappingSet = {
	name: string;
	map: PacenoteMapping[];
};

/** One call a co-driver standard knows: its id, category and slot (sound) name. */
export type CallSlot = {
	id: number;
	category: string;
	slot: string;
};

/** A co-driver standard: its calls, and the mappings that translate other standards into it. */
export type CodriverConfig = {
	name: string;
	config: CallSlot[];
	maps: MappingSet[];
};
