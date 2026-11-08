import { describe, expect, it } from 'vitest';
import { parseConfigCsv, parseMappingCsv } from './csv.ts';

describe('parseMappingCsv', () => {
	it('reads a mapping, splitting +-joined targets, whatever the line endings', () => {
		const csv =
			'﻿old_category,old_id,old_slot,new_category,new_id,new_slot\r\n' +
			'ADDITIONAL,14,NARROWS,Modifier,14,NARROWS\r\n' +
			'TURN,2135,LEFT_INTO,Turn+Modifier,251+209,LEFT+INTO\n';
		expect(parseMappingCsv(csv)).toEqual([
			{
				old_category: 'ADDITIONAL',
				old_id: 14,
				old_pacenote: 'NARROWS',
				new_category: ['Modifier'],
				new_id: [14],
				new_pacenote: ['NARROWS']
			},
			{
				old_category: 'TURN',
				old_id: 2135,
				old_pacenote: 'LEFT_INTO',
				new_category: ['Turn', 'Modifier'],
				new_id: [251, 209],
				new_pacenote: ['LEFT', 'INTO']
			}
		]);
	});

	it('skips lines with the wrong number of columns, and reads empty text as no mapping', () => {
		const csv = 'a,b,c,d,e,f\nX,1,Y,Z,2,W\nshort,line\n\nX,3,Y,Z,4,W,extra';
		expect(parseMappingCsv(csv).map((row) => row.old_id)).toEqual([1]);
		expect(parseMappingCsv('  \n')).toEqual([]);
	});
});

describe('parseConfigCsv', () => {
	it('reads the calls of a standard', () => {
		expect(parseConfigCsv('﻿category,id,slot\nADDITIONAL,14,NARROWS\n')).toEqual([
			{ category: 'ADDITIONAL', id: 14, slot: 'NARROWS' }
		]);
	});
});
