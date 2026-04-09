import fs from 'fs';
import path from 'path';
import type { PageServerLoad } from './$types';

import { tryReadFile, fileEntry, type FileEntry } from './config_load_script.ts';

	import {
		type Map,
		type MapContainer,
		type Config,
		type ConfigContainer
	} from './types.ts';



// TODO: Make user send their configuration
// Export pacenote names & ids from that configuration
// Find the map matching most names & ids in the old columns
// Load this map
// Not mapped names mark as NULL & don't let user do the conversion without all values being mapped

export const load: PageServerLoad = async () => {
	// Function for parsing CSV files into arrays
	const parseMapCsv = (csv: string) => {
		if (!csv.trim()) return []; // Check if the file has been loaded. If empty, then proceed with empty map.

		var allTextLines = csv.split(/\r\n|\n|\r/);
		var headers = allTextLines[0].split(',');
		var lines = []; // TODO: If I only ever query maps by id_old, turn these into Map<number, the rest of content>

		for (var i = 1; i < allTextLines.length; i++) {
			var data = allTextLines[i].split(',');
			if (data.length == headers.length) {
				var tarr: Map = {
					old_category: data[0],
					old_id: parseInt(data[1]),
					old_pacenote: data[2],
					new_category: data[3].split('+'),
					new_id: data[4].split('+').map(Number),
					new_pacenote: data[5].split('+'),
				};
				lines.push(tarr);
			}
		}
		return lines;
	};
	const parseConfigCsv = (csv: string) => {
		if (!csv.trim()) return []; // Check if the file has been loaded. If empty, then proceed with empty map.

		var allTextLines = csv.split(/\r\n|\n|\r/);
		var headers = allTextLines[0].split(',');
		var lines = [];

		for (var i = 1; i < allTextLines.length; i++) {
			var data = allTextLines[i].split(',');
			if (data.length == headers.length) {
				var tarr: Config = {
					category: data[0],
					id: parseInt(data[1]),
					slot: data[2],
				};
				lines.push(tarr);
			}
		}
		return lines;
	};

	// Get CSV (maps) file paths & the files themselves from filesystem
	const mapsFiles: Record<string, FileEntry> = {
		OriginalToFilipek:    fileEntry('static/codriver/FilipekMod/OriginalToFilipek.csv'),
		DarrenV2ToFilipek:    fileEntry('static/codriver/FilipekMod/DarrenV2ToFilipek.csv'),
		Handwerker12ToFilipek: fileEntry('static/codriver/FilipekMod/Handwerker12ToFilipek.csv'),
		Handwerker14ToFilipek: fileEntry('static/codriver/FilipekMod/Handwerker14ToFilipek.csv'),
		LuppisV2ToFilipek:    fileEntry('static/codriver/FilipekMod/LuppisV2ToFilipek.csv'),
		LuppisV3ToFilipek:    fileEntry('static/codriver/FilipekMod/LuppisV3ToFilipek.csv')
	};

	const configFiles: Record<string, FileEntry> = {
		FilipekMod:   fileEntry('static/codriver/FilipekMod/config.csv'),
		Original:     fileEntry('static/codriver/Original/config.csv'),
		DarrenV2:     fileEntry('static/codriver/DarrenV2/config.csv'),
		Handwerker12: fileEntry('static/codriver/Handwerker12/config.csv'),
		Handwerker14: fileEntry('static/codriver/Handwerker14/config.csv'),
		LuppisV2:     fileEntry('static/codriver/LuppisV2/config.csv'),
		LuppisV3:     fileEntry('static/codriver/LuppisV3/config.csv')
	};

	const mapsParsed: MapContainer[] = [
		{
			name: 'OriginalToFilipek',
			map: parseMapCsv(mapsFiles['OriginalToFilipek'][1] ?? '')
		},
		{
			name: 'DarrenV2ToFilipek',
			map: parseMapCsv(mapsFiles['DarrenV2ToFilipek'][1] ?? '')
		},
		{
			name: 'Handwerker12ToFilipek',
			map: parseMapCsv(mapsFiles['Handwerker12ToFilipek'][1] ?? '')
		},
		{
			name: 'Handwerker14ToFilipek',
			map: parseMapCsv(mapsFiles['Handwerker14ToFilipek'][1]  ?? '')
		},
		{
			name: 'LuppisV2ToFilipek',
			map: parseMapCsv(mapsFiles['LuppisV2ToFilipek'][1]  ?? '')
		},
		{
			name: 'LuppisV3ToFilipek',
			map: parseMapCsv(mapsFiles['LuppisV3ToFilipek'][1]  ?? '')
		}
	];

	const configsParsed: ConfigContainer[] = [
		{
			name: 'FilipekMod',
			config: parseConfigCsv(configFiles['FilipekMod'][1] ?? ''),
			maps: [
				{
					name: 'Original',
					map: parseMapCsv(mapsFiles['OriginalToFilipek'][1] ?? '')
				},
				{
					name: 'DarrenV2',
					map: parseMapCsv(mapsFiles['DarrenV2ToFilipek'][1] ?? '')
				},
				{
					name: 'Handwerker12',
					map: parseMapCsv(mapsFiles['Handwerker12ToFilipek'][1] ?? '')
				},
				{
					name: 'Handwerker14',
					map: parseMapCsv(mapsFiles['Handwerker14ToFilipek'][1] ?? '')
				},
				{
					name: 'LuppisV2',
					map: parseMapCsv(mapsFiles['LuppisV2ToFilipek'][1] ?? '')
				},
				{
					name: 'LuppisV3',
					map: parseMapCsv(mapsFiles['LuppisV3ToFilipek'][1] ?? '')
				}
			]
		},
		{
			name: 'Original',
			config: parseConfigCsv(configFiles['Original'][1] ?? ''),
			maps: []
		},
		{
			name: 'DarrenV2',
			config: parseConfigCsv(configFiles['DarrenV2'][1] ?? ''),
			maps: []
		},
		{
			name: 'Handwerker12',
			config: parseConfigCsv(configFiles['Handwerker12'][1] ?? ''),
			maps: []
		},
		{
			name: 'Handwerker14',
			config: parseConfigCsv(configFiles['Handwerker14'][1] ?? ''),
			maps: []
		},
		{
			name: 'LuppisV2',
			config: parseConfigCsv(configFiles['LuppisV2'][1] ?? ''),
			maps: []
		},
		{
			name: 'LuppisV3',
			config: parseConfigCsv(configFiles['LuppisV3'][1] ?? ''),
			maps: []
		}
	];

	return {
		mapsParsed,
		configsParsed
	};
};
