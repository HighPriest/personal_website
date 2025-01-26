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

export type MapParsed = {
	name: string;
	map: Map[];
};

export type Config = {
	id: number;
	category: string;
	slot: string;
};

export type ConfigParsed = {
	name: string;
	config: Config[];
	maps: {
		name: string;
		map: Map[];
	}[];
};

export const load = async () => {
	// Function for parsing CSV files into arrays
	const parseMapCsv = (csv: string) => {
		var allTextLines = csv.split(/\r\n|\n|\r/);
		var headers = allTextLines[0].split(',');
		var lines = [];

		for (var i = 1; i < allTextLines.length; i++) {
			var data = allTextLines[i].split(',');
			if (data.length == headers.length) {
				var tarr: Map = {
					old_category: data[0],
					old_pacenote: data[1],
					old_id: parseInt(data[2]),
					new_category: data[3],
					new_pacenote: data[4],
					new_id: parseInt(data[5])
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
					slot: data[1],
					id: parseInt(data[2])
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
		LuppisV2ToFilipek: [
			path.resolve('static/codriver/FilipekMod/LuppisV2ToFilipek.csv'),
			fs.readFileSync(path.resolve('static/codriver/FilipekMod/LuppisV2ToFilipek.csv'), 'utf-8')
		], // TODO: Parse Handwerker 1.4 once again to Excel
		LuppisV3ToFilipek: [
			path.resolve('static/codriver/FilipekMod/LuppisV3ToFilipek.csv'),
			fs.readFileSync(path.resolve('static/codriver/FilipekMod/LuppisV3ToFilipek.csv'), 'utf-8')
		] // TODO: Parse Janne configs once again to Excel
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
		LuppisV2: [
			path.resolve('static/codriver/LuppisV2/config.csv'),
			fs.readFileSync(path.resolve('static/codriver/LuppisV2/config.csv'), 'utf-8')
		],
		LuppisV3: [
			path.resolve('static/codriver/LuppisV3/config.csv'),
			fs.readFileSync(path.resolve('static/codriver/LuppisV3/config.csv'), 'utf-8')
		]
	};

	const mapsParsed: MapParsed[] = [
		{
			name: 'OriginalToFilipek',
			map: parseMapCsv(mapsFiles['OriginalToFilipek'][1])
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

	const configsParsed: ConfigParsed[] = [
		{
			name: 'FilipekMod',
			config: parseConfigCsv(configFiles['FilipekMod'][1]),
			maps: [
				{
					name: 'Original',
					map: parseMapCsv(mapsFiles['OriginalToFilipek'][1])
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
