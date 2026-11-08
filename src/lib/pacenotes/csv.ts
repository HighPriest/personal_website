/**
 * The mapping data's CSV files (`config.csv` per standard, `<From>To<Into>.csv` per mapping),
 * parsed into the engine's types. Lines whose column count differs from the header's are
 * skipped; `+` joins several target calls.
 */
import type { CallSlot, PacenoteMapping } from './types.ts';

function rows(csv: string): string[][] {
	if (!csv.trim()) return [];
	const [header, ...lines] = csv.split(/\r\n|\n|\r/);
	const columns = header.split(',').length;
	return lines.map((line) => line.split(',')).filter((data) => data.length === columns);
}

/** `old_category,old_id,old_slot,new_category,new_id,new_slot` */
export function parseMappingCsv(csv: string): PacenoteMapping[] {
	return rows(csv).map((data) => ({
		old_category: data[0],
		old_id: parseInt(data[1]),
		old_pacenote: data[2],
		new_category: data[3].split('+'),
		new_id: data[4].split('+').map(Number),
		new_pacenote: data[5].split('+')
	}));
}

/** `category,id,slot` */
export function parseConfigCsv(csv: string): CallSlot[] {
	return rows(csv).map((data) => ({
		category: data[0],
		id: parseInt(data[1]),
		slot: data[2]
	}));
}
