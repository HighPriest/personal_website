import { describe, expect, it } from 'vitest';
import { buildMapping } from './mapping.ts';
import type { CallSlot, PacenoteMapping } from './types.ts';

const call = (id: number, slot: string, category = 'C'): CallSlot => ({ id, slot, category });
const target = [call(251, 'LEFT', 'Turn'), call(209, 'INTO', 'Modifier'), call(14, 'NARROWS')];
const entry = (old_id: number, new_id: number[], slot = 'X'): PacenoteMapping => ({
	old_category: 'C',
	old_id,
	old_pacenote: slot,
	new_category: new_id.map(() => 'C'),
	new_id,
	new_pacenote: new_id.map(() => slot)
});

describe('buildMapping', () => {
	it("keeps the data's mapping as it is when nothing was edited", () => {
		const base = [entry(1, [900]), entry(2, [901, 902])]; // 900+ aren't in the target's config
		expect(buildMapping(base, [], target)).toEqual({ mapping: base, unknown: [] });
	});

	it('replaces the entries of an edited call with the target calls it names, + joining several', () => {
		const { mapping, unknown } = buildMapping(
			[entry(1, [900]), entry(2135, [999])],
			[{ call: call(2135, 'LEFT_INTO'), target: 'LEFT + INTO' }],
			target
		);
		expect(unknown).toEqual([]);
		expect(mapping).toEqual([
			entry(1, [900]),
			{
				old_category: 'C',
				old_id: 2135,
				old_pacenote: 'LEFT_INTO',
				new_category: ['Turn', 'Modifier'],
				new_id: [251, 209],
				new_pacenote: ['LEFT', 'INTO']
			}
		]);
	});

	it('removes the entries of a call edited to nothing, so it stays as it was', () => {
		const { mapping } = buildMapping(
			[entry(1, [900]), entry(2, [901])],
			[{ call: call(2, 'B'), target: ' ' }],
			target
		);
		expect(mapping).toEqual([entry(1, [900])]);
	});

	it('reports and skips edits naming a call the target standard does not have (exact names)', () => {
		const base = [entry(1, [900]), entry(2, [901])];
		const { mapping, unknown } = buildMapping(
			base,
			[
				{ call: call(1, 'A'), target: 'LEFT+NOPE' },
				{ call: call(2, 'B'), target: 'left' },
				{ call: call(NaN, 'C'), target: 'NOPE' }
			],
			target
		);
		expect(unknown).toEqual(['A', 'B']);
		expect(mapping).toEqual(base);
	});
});
