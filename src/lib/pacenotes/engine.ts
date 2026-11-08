/**
 * The pacenote translation engine: reads RBR pacenote INI files, rewrites each
 * call's id through a mapping into the target standard, and returns the translated files in a
 * zip, keeping each file's folder. Runs in the browser; jszip and ini load on the first use.
 */
import { debug } from '#lib/debug.js';
import type { PacenoteMapping } from './types.ts';

type PacenoteEntry = { type: number; distance: number; flag: number };

interface FilteredData {
	PACENOTES: {
		count: number;
	};
	[key: string]: PacenoteEntry | { count: number };
}

const pacenotesMap: Record<number, string> = {
	0: 'HAIRPINLEFT', //LEFT_HAIRPIN
	1: '90_LEFT', //LEFT_1
	2: 'KLEFT', //LEFT_2
	3: 'MEDIUMLEFT', //LEFT_3
	4: 'FASTLEFT', //LEFT_4
	5: 'EASYLEFT', //LEFT_5
	6: 'EASYRIGHT', //RIGHT_5
	7: 'FASTRIGHT', //RIGHT_4
	8: 'MEDIUMRIGHT', //RIGHT_3
	9: 'KRIGHT', //RIGHT_2
	10: '90_RIGHT', //RIGHT_1
	11: 'HAIRPINRIGHT', //RIGHT_HAIRPIN
	100: 'EASYLEFT', //LEFT // TODO: Check if the image fits
	101: 'FLATLEFT', //LEFT_6
	102: '90_LEFT', //LEFT_SQUARE
	103: 'EASYLEFT', //LEFT_INTO
	104: 'FASTRIGHT', //LEFT_RIGHT
	105: 'HAIRPINLEFT', //LEFT_ACUTE
	106: 'HAIRPINLEFT', //LEFT_AROUND
	107: 'HAIRPINLEFT', //LEFT_DONUT
	108: 'FASTLEFT', //LEFT_SHORT
	109: 'FASTLEFT', //LEFT_OVER
	110: 'TWISTY', //CHICANE_LEFT_ENTRY

	112: 'EASYRIGHT', //RIGHT // TODO: Check if the image fits
	113: 'FLATRIGHT', //RIGHT_6
	114: '90_RIGHT', //RIGHT_SQUARE
	115: 'EASYRIGHT', //RIGHT_INTO
	116: 'FASTLEFT', //RIGHT_LEFT
	117: 'HAIRPINRIGHT', //RIGHT_ACUTE
	118: 'HAIRPINRIGHT', //RIGHT_AROUND
	119: 'HAIRPINRIGHT', //RIGHT_DONUT
	120: 'FASTRIGHT', //RIGHT_SHORT
	121: 'FASTLEFT', //RIGHT_OVER
	122: 'TWISTY', //CHICANE_RIGHT_ENTRY

	27: 'BRIDGE', //BRIDGE
	1038: 'BRIDGE', //AT_BRIDGE

	//WATER

	85: 'WATER', //WATER
	1035: 'WATER', //AT_FORD
	1063: 'WATER', //AT_WATER

	//NARROWS
	200: 'NARROWS', //TIGHT
	201: 'NARROWS', //NARROW

	244: 'NARROWS', //SECTION_NARROWER

	//WIDENS
	202: 'WIDENS', //WIDE
	203: 'WIDENS', //WIDENS

	245: 'WIDENS', //SECTION_WIDER

	//BUMP
	19: 'BUMP', //BUMP
	61: 'BUMP', //BROW
	71: 'BUMP', //BUMPS

	307: 'BUMP', //BUMPY
	308: 'CARE', //ROUGH

	1036: 'BUMP', //AT_BUMP
	1040: 'BUMP', //AT_BROW
	1050: 'BUMP', //AT_BUMPS

	1340: 'BUMP', //BUMPY_MIDDLE
	1341: 'BUMP', //BUMPY_INSIDE
	1342: 'BUMP', //BUMPY_OUTSIDE
	1343: 'BUMP', //BUMPY_BRAKING
	1344: 'BUMP', //BUMPY_ENTRY
	1345: 'BUMP', //BUMPY_EXIT
	1346: 'BUMP', //BUMPY_MAYBE
	1347: 'BUMP', //BUMPY_VERY

	//TWISTY
	12: 'TWISTY', //TWISTY

	//JUMP
	20: 'JUMP', //JUMP
	1037: 'JUMP', //AT_JUMP

	//OVER_CREST
	16: 'OVER_CREST', //OVER_CREST
	60: 'OVER_CREST', //CREST
	1039: 'OVER_CREST' //AT_CREST
};

const standardMap: Record<string, number> = {
	HAIRPINLEFT: 0,
	'90_LEFT': 1,
	KLEFT: 2,
	MEDIUMLEFT: 3,
	FASTLEFT: 4,
	EASYLEFT: 5,
	FLATLEFT: 26,

	HAIRPINRIGHT: 11,
	'90_RIGHT': 10,
	KRIGHT: 9,
	MEDIUMRIGHT: 8,
	FASTRIGHT: 7,
	EASYRIGHT: 6,
	FLATRIGHT: 25,

	CAUTION: 32, // Red triangle
	CARE: 18, // Orange triangle
	WATER: 17,
	NARROWS: 14,
	WIDENS: 15,
	BRIDGE: 27,
	BUMP: 19,
	JUMP: 20,
	TWISTY: 12,
	OVER_CREST: 16
};

/** A translation's zip and what happened to the calls in it. */
export type Translation = {
	zip: Blob;
	/** Files translated. */
	files: number;
	/** Calls (notes) rewritten through the mapping. */
	mapped: number;
	/** Calls the mapping has no entry for, copied as they were. */
	unchanged: number;
};

/**
 * The `files` translated into `targetStandard` through `idsMap`, as a zip. Each output keeps its
 * file's folder (`webkitRelativePath`, set when a folder is picked) and gets `_<target>` added
 * to its name. Notes of a type above 5000 are dropped and counted in neither total.
 */
export async function translate(
	files: File[],
	idsMap: PacenoteMapping[],
	targetStandard: string
): Promise<Translation> {
	const [{ default: JSZip }, ini] = await Promise.all([import('jszip'), import('ini')]);
	const zip = new JSZip(); // Start archive creation for download

	// ?? IN OG SCRIPT: Get list of pacenote files for eachstage
	const idsMapObject = new Map<number, number[]>();
	idsMap.forEach(({ old_id, new_id }) => {
		idsMapObject.set(old_id, new_id);
	});
	debug?.('translator', 'start', {
		files: files.length,
		target: targetStandard,
		mappedIds: idsMapObject.size
	});

	let mapped = 0;
	let unchanged = 0;

	// Iterate over individual pacenote files
	for (const file of files) {
		// Load contents of the original INI file
		const fileContent = await file.text();
		const iniData = ini.parse(fileContent);

		// Prepare structures for new INI file
		const filteredData: FilteredData = {
			PACENOTES: iniData['PACENOTES']
				? { count: parseInt(iniData['PACENOTES'].count, 10) || 0 }
				: { count: 0 }
		};

		let pCounter = 0;
		// Debug statistics only
		const idsWithoutMapping = new Set<number>();

		delete iniData['PACENOTES'];
		delete iniData['_'];

		for (const data of Object.values(iniData)) {
			let pacenote: number = parseInt(data['type'], 10);
			let distance: number = parseFloat(data['distance']);
			let standard: number | null = null;
			let flag: number = parseInt(data['flag'], 10);

			if (pacenote > 5000) continue;

			/*if (idsMapObject.has(pacenote)) { // Find current (old)pacenote in the map
                pacenote = idsMapObject.get(pacenote)!; // Replace the (old)pacenote with new pacenote
            }*/

			if (flag & 0b100000000000000) {
				// Try 1 << 19
				pacenote = parseInt(data['flag']) >> 19;
				distance = parseFloat(data['distance']);
				standard = parseInt(data['type']);
				flag = parseInt(data['flag']) & 256;
			} else {
				pacenote = parseInt(data['type']);
				distance = parseFloat(data['distance']);
				standard = null;
				flag = parseInt(data['flag']) & 256;
			}

			// TODO: If we encounter a value that is not in maps, we should error.
			// Most of the time it should mean, someone has applied an incomplete map.
			// Notify user that their Pacenotes are using IDs which were not found in the configuration.
			// Tell user which ID it is & tell them to check if this ID plays in-game
			if (idsMapObject.has(pacenote)) {
				mapped++;
				// Check if there is a map available
				idsMapObject.get(pacenote)?.forEach((id) => {
					filteredData['P' + pCounter] = data;
					filteredData['P' + pCounter] = createPacenote(id, distance, standard, flag);
					distance += 1;
					pCounter += 1;
				});
				continue;
			}

			idsWithoutMapping.add(pacenote);
			unchanged++;
			filteredData[`P${pCounter}`] = data;
			filteredData[`P${pCounter}`] = createPacenote(pacenote, distance, standard, flag);
			pCounter++;
		}

		filteredData['PACENOTES'].count = pCounter;
		const outputContent =
			`; ${file.name} pacenotes file generated for CoPilot mods compatible with ${targetStandard} \n` +
			'; For more details, please visit https://amun.pl/tools/pacenotes-translator \n\n' +
			ini.stringify(filteredData, { whitespace: true, platform: 'win32' });
		// We are only handling .ini files, so this is fine. A file picked on its own (not in a
		// folder) has an empty webkitRelativePath: its name is the path then.
		const path = file.webkitRelativePath || file.name;
		zip.file(path.replace('.ini', '_' + targetStandard + '.ini'), outputContent);
		debug?.('translator', 'file translated', {
			file: file.name,
			target: targetStandard,
			notesIn: Object.keys(iniData).length,
			notesOut: pCounter,
			// IDs copied unchanged because the map has no entry: a hint for incomplete maps
			idsWithoutMapping: [...idsWithoutMapping].sort((a, b) => a - b).slice(0, 20)
		});
	}

	return { zip: await zip.generateAsync({ type: 'blob' }), files: files.length, mapped, unchanged };
}

function createPacenote(pacenote: number, distance: number, standard: number | null, flag: number) {
	const pacenoteObject = {
		type: pacenote,
		distance: distance,
		flag: flag
	};

	if (standard != null) {
		pacenoteObject.flag = (pacenote << 19) | 0b100000000000000 | (flag & 256);
		pacenoteObject.type = standard;
	} else if (Object.hasOwn(pacenotesMap, pacenote)) {
		const standard = standardMap[pacenotesMap[pacenote]];
		pacenoteObject.flag = (pacenote << 19) | 0b100000000000000 | (flag & 256);
		pacenoteObject.type = standard;
	} else {
		pacenoteObject.type = pacenote;
		pacenoteObject.flag = flag & 256;
	}

	return pacenoteObject;
}
