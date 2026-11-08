import { describe, expect, it } from 'vitest';
import { indexData } from './data.ts';

describe('indexData', () => {
	it('finds the standards by their config and the mappings into each', () => {
		const index = indexData({
			'./data/FilipekMod/config.csv': '/a/filipek-config.csv',
			'./data/FilipekMod/OriginalToFilipek.csv': '/a/o2f.csv',
			'./data/FilipekMod/LuppisV3ToFilipek.csv': '/a/l2f.csv',
			'./data/Original/config.csv': '/a/original-config.csv',
			'./data/Original/notes.csv': '/a/ignored.csv'
		});
		expect(index.standards).toEqual(['FilipekMod', 'Original']);
		expect(index.configs.Original).toBe('/a/original-config.csv');
		expect(index.sources).toEqual({ FilipekMod: ['LuppisV3', 'Original'] });
		expect(index.mappings.OriginalToFilipekMod).toBe('/a/o2f.csv');
	});

	it('is empty without data (the public build)', () => {
		expect(indexData({})).toEqual({ standards: [], configs: {}, mappings: {}, sources: {} });
	});
});
