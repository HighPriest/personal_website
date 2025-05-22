import * as ini from 'ini';
    import {
		type Map,
		type MapContainer,
		type Config,
		type ConfigContainer
	} from './types.ts';



export async function detectConfigFiles(file: File, files: File[]): Promise<File[]> {
    let files_to_parse:File[] = [];
    // Accepts a file
    // Load contents of the original INI file
    const fileContent = await file.text();
    const iniData = ini.parse(fileContent);
    for (const [section, data] of Object.entries(iniData)) {
        // Check if the section is a subconfig
        if (section.startsWith("PACKAGE") || section.startsWith("CATEGORY")) {
            let configFiles: File[] = [];
            for (const [key, value] of Object.entries(data)) {
                const valueStr = value as string;
                let file = files.find((f) => f.name === valueStr.split('\\')[1]);
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
        }
        else {
            return [file];
        }
    }
    return files_to_parse;
}

export async function parseConfig(file: File): Promise<Config[]> {
    const fileContent = await file.text();
    const iniData = ini.parse(fileContent);
    let pacenotes: Config[] = [];
    for (const [section, data] of Object.entries(iniData)) {
        // Check if the section is a subconfig
        if (section.startsWith("PACENOTE")) {
            let pacenote: Config = {
                id: parseInt(data["id"]),
                category: file.name.split(".")[0],
                slot: section.split("::")[1]
            };
            pacenotes.push(pacenote);
        }
    }
    return pacenotes;
}