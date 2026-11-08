/**
 * A co-driver's own config files: which INI files a config spreads its calls over, and the calls
 * (id, category, slot) they define. Not used by the translator yet.
 */
import type { CallSlot } from './types.ts';

export async function detectConfigFiles(file: File, files: File[]): Promise<File[]> {
	const ini = await import('ini');
	const files_to_parse: File[] = [];
	// Accepts a file
	// Load contents of the original INI file
	const fileContent = await file.text();
	const iniData = ini.parse(fileContent);
	for (const [section, data] of Object.entries(iniData)) {
		// Check if the section is a subconfig
		if (section.startsWith('PACKAGE') || section.startsWith('CATEGORY')) {
			const configFiles: File[] = [];
			for (const value of Object.values(data)) {
				const valueStr = value as string;
				const file = files.find((f) => f.name === valueStr.split('\\')[1]);
				if (file) {
					configFiles.push(file);
				}
			}
			if (configFiles) {
				for (const configFile of configFiles) {
					const subFiles = await detectConfigFiles(configFile, files);
					files_to_parse.push(...subFiles);
				}
			}
		} else {
			return [file];
		}
	}
	return files_to_parse;
}

export async function parseConfig(file: File): Promise<CallSlot[]> {
	const ini = await import('ini');
	const fileContent = await file.text();
	const iniData = ini.parse(fileContent);
	const pacenotes: CallSlot[] = [];
	for (const [section, data] of Object.entries(iniData)) {
		// Check if the section is a subconfig
		if (section.startsWith('PACENOTE')) {
			const pacenote: CallSlot = {
				id: parseInt(data['id']),
				category: file.name.split('.')[0],
				slot: section.split('::')[1]
			};
			pacenotes.push(pacenote);
		}
	}
	return pacenotes;
}
