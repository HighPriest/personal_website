/**
 * Golden files: the translator's whole output (CSV maps → translated INI files in a zip) for
 * two synthetic stages, through each of the six maps into FilipekMod. They pin the engine's
 * behaviour, so moving or refactoring it must leave every golden file unchanged.
 *
 * The maps and the golden files live in ./data, which the public repository leaves out:
 * without it, this test is skipped.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { describe, expect, test } from 'vitest';
import { parseMappingCsv } from './csv.ts';
import { translate } from './engine.ts';

const fixtures = new URL('./fixtures/', import.meta.url);
const into = new URL('./data/FilipekMod/', import.meta.url);

/** A picked file as the browser gives it: `webkitRelativePath` is empty unless a folder was picked. */
function picked(name: string, relativePath: string): File {
	const text = readFileSync(new URL(`stages/${name}`, fixtures), 'utf8');
	const file = new File([text], name);
	Object.defineProperty(file, 'webkitRelativePath', { value: relativePath });
	return file;
}

const stages = () => [picked('stage-a.ini', 'MyPacenotes/stage-a.ini'), picked('stage-b.ini', '')];

/** The maps into FilipekMod, named after their source, read as data.ts names them. */
const maps = existsSync(into)
	? readdirSync(into)
			.filter((file) => /^.+?To.+.csv$/.test(file))
			.map((file) => ({
				name: file.split('To')[0],
				map: parseMappingCsv(readFileSync(new URL(file, into), 'utf8'))
			}))
	: [];

describe.skipIf(maps.length === 0)('golden translations into FilipekMod', () => {
	test.each(maps)('from $name', async ({ name, map }) => {
		expect(map.length).toBeGreaterThan(0);
		const zip = await JSZip.loadAsync(
			await (await translate(stages(), map, 'FilipekMod')).zip.arrayBuffer()
		);
		const entries = Object.values(zip.files).sort((a, b) => a.name.localeCompare(b.name));
		const files = await Promise.all(
			entries
				.filter((entry) => !entry.dir)
				.map(async (entry) => `=== ${entry.name}\n${await entry.async('string')}`)
		);
		const listing = `entries: ${entries.map((entry) => entry.name).join(', ')}`;
		// Snapshots normalize line endings, and the INI body is CRLF (for RBR on Windows) while
		// the header lines are LF: carriage returns are written out as \r so they're pinned too.
		const text = [listing, ...files].join('\n').replaceAll('\r', '\\r');
		await expect(text).toMatchFileSnapshot(
			fileURLToPath(new URL(`data/golden/${name}.txt`, import.meta.url))
		);
	});
});
