import fs from 'fs';
import path from 'path';

// TODO: Make user send their configuration
// Export pacenote names & ids from that configuration
// Find the map matching most names & ids in the old columns
// Load this map
// Not mapped names mark as NULL & don't let user do the conversion without all values being mapped

export type Map = {
	old_category: string;
	old_pacenote: string;
	old_id: number;
	new_category: string;
	new_pacenote: string;
	new_id: number;
};

export type MapContainer = {
	name: string;
	map: Map[];
};

export type Config = {
	id: number;
	category: string;
	slot: string;
};

export type ConfigContainer = {
	name: string;
	config: Config[];
	maps: MapContainer[];
};

export const load = async () => {
	// Function for parsing CSV files into arrays
	const parseMapCsv = (csv: string) => {
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
					new_category: data[3],
					new_id: parseInt(data[4]),
					new_pacenote: data[5],
				};
				lines.push(tarr);
			}
		}
		return lines;
	};
	const parseConfigCsv = (csv: string) => {
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
	const mapsFiles = {
		OriginalToFilipek: [
			path.resolve('static/codriver/FilipekMod/OriginalToFilipek.csv'),
			fs.readFileSync(path.resolve('static/codriver/FilipekMod/OriginalToFilipek.csv'), 'utf-8')
		],
		DarrenV2ToFilipek: [
			path.resolve('static/codriver/FilipekMod/DarrenV2ToFilipek.csv'),
			fs.readFileSync(path.resolve('static/codriver/FilipekMod/DarrenV2ToFilipek.csv'), 'utf-8')
		],
		Handwerker12ToFilipek: [
			path.resolve('static/codriver/FilipekMod/Handwerker1.2ToFilipek.csv'),
			fs.readFileSync(path.resolve('static/codriver/FilipekMod/Handwerker12ToFilipek.csv'), 'utf-8')
		],
		Handwerker14ToFilipek: [
			path.resolve('static/codriver/FilipekMod/Handwerker1.4ToFilipek.csv'),
			fs.readFileSync(path.resolve('static/codriver/FilipekMod/Handwerker14ToFilipek.csv'), 'utf-8')
		],
		LuppisV2ToFilipek: [
			path.resolve('static/codriver/FilipekMod/LuppisV2ToFilipek.csv'),
			fs.readFileSync(path.resolve('static/codriver/FilipekMod/LuppisV2ToFilipek.csv'), 'utf-8')
		],
		LuppisV3ToFilipek: [
			path.resolve('static/codriver/FilipekMod/LuppisV3ToFilipek.csv'),
			fs.readFileSync(path.resolve('static/codriver/FilipekMod/LuppisV3ToFilipek.csv'), 'utf-8')
		]
	};
	const configFiles = {
		FilipekMod: [
			path.resolve('static/codriver/FilipekMod/config.csv'),
			fs.readFileSync(path.resolve('static/codriver/FilipekMod/config.csv'), 'utf-8')
		],
		Original: [
			path.resolve('static/codriver/Original/config.csv'),
			fs.readFileSync(path.resolve('static/codriver/Original/config.csv'), 'utf-8')
		],
		DarrenV2: [
			path.resolve('static/codriver/DarrenV2/config.csv'),
			fs.readFileSync(path.resolve('static/codriver/DarrenV2/config.csv'), 'utf-8')
		],
		Handwerker12: [
			path.resolve('static/codriver/Handwerker12/config.csv'),
			fs.readFileSync(path.resolve('static/codriver/Handwerker12/config.csv'), 'utf-8')
		],
		Handwerker14: [
			path.resolve('static/codriver/Handwerker14/config.csv'),
			fs.readFileSync(path.resolve('static/codriver/Handwerker14/config.csv'), 'utf-8')
		],
		LuppisV2: [
			path.resolve('static/codriver/LuppisV2/config.csv'),
			fs.readFileSync(path.resolve('static/codriver/LuppisV2/config.csv'), 'utf-8')
		],
		LuppisV3: [
			path.resolve('static/codriver/LuppisV3/config.csv'),
			fs.readFileSync(path.resolve('static/codriver/LuppisV3/config.csv'), 'utf-8')
		]
	};

	const mapsParsed: MapContainer[] = [
		{
			name: 'OriginalToFilipek',
			map: parseMapCsv(mapsFiles['OriginalToFilipek'][1])
		},
		{
			name: 'DarrenV2ToFilipek',
			map: parseMapCsv(mapsFiles['DarrenV2ToFilipek'][1])
		},
		{
			name: 'Handwerker12ToFilipek',
			map: parseMapCsv(mapsFiles['Handwerker12ToFilipek'][1])
		},
		{
			name: 'Handwerker14ToFilipek',
			map: parseMapCsv(mapsFiles['Handwerker14ToFilipek'][1])
		},
		{
			name: 'LuppisV2ToFilipek',
			map: parseMapCsv(mapsFiles['LuppisV2ToFilipek'][1])
		},
		{
			name: 'LuppisV3ToFilipek',
			map: parseMapCsv(mapsFiles['LuppisV3ToFilipek'][1])
		}
	];

	const configsParsed: ConfigContainer[] = [
		{
			name: 'FilipekMod',
			config: parseConfigCsv(configFiles['FilipekMod'][1]),
			maps: [
				{
					name: 'Original',
					map: parseMapCsv(mapsFiles['OriginalToFilipek'][1])
				},
				{
					name: 'DarrenV2',
					map: parseMapCsv(mapsFiles['DarrenV2ToFilipek'][1])
				},
				{
					name: 'Handwerker12',
					map: parseMapCsv(mapsFiles['Handwerker12ToFilipek'][1])
				},
				{
					name: 'Handwerker14',
					map: parseMapCsv(mapsFiles['Handwerker14ToFilipek'][1])
				},
				{
					name: 'LuppisV2',
					map: parseMapCsv(mapsFiles['LuppisV2ToFilipek'][1])
				},
				{
					name: 'LuppisV3',
					map: parseMapCsv(mapsFiles['LuppisV3ToFilipek'][1])
				}
			]
		},
		{
			name: 'Original',
			config: parseConfigCsv(configFiles['Original'][1]),
			maps: []
		},
		{
			name: 'DarrenV2',
			config: parseConfigCsv(configFiles['DarrenV2'][1]),
			maps: []
		},
		{
			name: 'Handwerker12',
			config: parseConfigCsv(configFiles['Handwerker12'][1]),
			maps: []
		},
		{
			name: 'Handwerker14',
			config: parseConfigCsv(configFiles['Handwerker14'][1]),
			maps: []
		},
		{
			name: 'LuppisV2',
			config: parseConfigCsv(configFiles['LuppisV2'][1]),
			maps: []
		},
		{
			name: 'LuppisV3',
			config: parseConfigCsv(configFiles['LuppisV3'][1]),
			maps: []
		}
	];

	return {
		mapsParsed,
		configsParsed
	};
};
