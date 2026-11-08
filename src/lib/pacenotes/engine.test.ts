import { describe, expect, test } from 'vitest';
import * as ini from 'ini';
import JSZip from 'jszip';
import { translate } from './engine.ts';

/** Flag bit marking an "extended" pacenote: the pacenote id lives in bits 19+, `type` holds the standard. */
const EXTENDED = 0b100000000000000;

function pacenoteFile(name: string, notes: Record<string, number>[]): File {
	const sections = notes.map(
		(note, i) =>
			`[P${i}]\n${Object.entries(note)
				.map(([key, value]) => `${key}=${value}`)
				.join('\n')}`
	);
	const text = [`[PACENOTES]\ncount=${notes.length}`, ...sections].join('\n') + '\n';
	return new File([text], name);
}

async function translateNotes(notes: Record<string, number>[]) {
	const { zip: blob, ...counts } = await translate(
		[pacenoteFile('stage1.ini', notes)],
		[
			{
				old_category: 'OLD',
				old_pacenote: 'FIVE_HUNDRED',
				old_id: 500,
				new_category: ['NEW', 'NEW'],
				new_pacenote: ['SIX_HUNDRED', 'SIX_HUNDRED_ONE'],
				new_id: [600, 601]
			}
		],
		'TestStandard'
	);
	const zip = await JSZip.loadAsync(await blob.arrayBuffer());
	const names = Object.keys(zip.files);
	const text = await zip.file(names[0])!.async('string');
	return { names, text, parsed: ini.parse(text), counts };
}

describe('translate', () => {
	test('counts the files, the mapped calls and the ones left as they were', async () => {
		const { counts } = await translateNotes([
			{ type: 500, distance: 10, flag: 0 }, // mapped (into two notes)
			{ type: 700, distance: 20, flag: 0 }, // no mapping: unchanged
			{ type: 6000, distance: 30, flag: 0 } // dropped: neither
		]);
		expect(counts).toEqual({ files: 1, mapped: 1, unchanged: 1 });
	});

	test('names the output after the input file and the target standard', async () => {
		const { names, text } = await translateNotes([{ type: 700, distance: 10, flag: 0 }]);
		expect(names).toEqual(['stage1_TestStandard.ini']);
		expect(
			text.startsWith(
				'; stage1.ini pacenotes file generated for CoPilot mods compatible with TestStandard'
			)
		).toBe(true);
	});

	test('expands a mapped id into one note per target id, 1 m apart', async () => {
		const { parsed } = await translateNotes([{ type: 500, distance: 100, flag: 0 }]);
		expect(parsed.PACENOTES.count).toBe('2');
		expect(parsed.P0).toEqual({ type: '600', distance: '100', flag: '0' });
		expect(parsed.P1).toEqual({ type: '601', distance: '101', flag: '0' });
	});

	test('drops notes whose type is above 5000', async () => {
		const { parsed } = await translateNotes([
			{ type: 6000, distance: 50, flag: 0 },
			{ type: 700, distance: 60, flag: 0 }
		]);
		expect(parsed.PACENOTES.count).toBe('1');
		expect(parsed.P0).toEqual({ type: '700', distance: '60', flag: '0' });
	});

	test('copies unmapped ids unchanged and keeps only flag bit 256', async () => {
		const { parsed } = await translateNotes([{ type: 700, distance: 300, flag: 256 | 2 }]);
		expect(parsed.P0).toEqual({ type: '700', distance: '300', flag: '256' });
	});

	test('round-trips an extended note: pacenote id in the flag, standard in the type', async () => {
		const flag = (12 << 19) | EXTENDED | 256;
		const { parsed } = await translateNotes([{ type: 3, distance: 40, flag }]);
		expect(parsed.P0).toEqual({ type: '3', distance: '40', flag: String(flag) });
	});
});
