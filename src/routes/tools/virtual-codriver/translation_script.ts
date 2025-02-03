import * as fs from 'fs';
import * as ini from 'ini';
import JSZip from 'jszip';

type Map = {
	old_category: string;
	old_pacenote: string;
	old_id: number;
	new_category: string;
	new_pacenote: string;
	new_id: number;
};

interface FilteredData {
    PACENOTES: {
        count: number;
    };
    [key: string]: any;
}

const pacenotesMap: Record<number, string> = {
    0: "HAIRPINLEFT",
    1: "90_LEFT",
    2: "KLEFT",
    3: "MEDIUMLEFT",
    4: "FASTLEFT",
    5: "EASYLEFT",
    6: "EASYRIGHT",
    7: "FASTRIGHT",
    8: "MEDIUMRIGHT",
    9: "KRIGHT",
    10: "90_RIGHT",
    11: "HAIRPINRIGHT",
    101: "FLATLEFT",
    113: "FLATRIGHT"
}

const standardMap: Record<string, number> = {
    "HAIRPINLEFT": 0,
    "90_LEFT": 1,
    "KLEFT": 2,
    "MEDIUMLEFT": 3,
    "FASTLEFT": 4,
    "EASYLEFT": 5,
    "FLATLEFT": 26,
    "HAIRPINRIGHT": 11,
    "90_RIGHT": 10,
    "KRIGHT": 9,
    "MEDIUMRIGHT": 8,
    "FASTRIGHT": 7,
    "EASYRIGHT": 6,
    "FLATRIGHT": 25,
    "CAUTION": 32,
    "CARE": 18,
    "WATER": 17
};

export async function handleTranslation(files: FileList, idsMap: Map[], targetStandard: String): Promise<Blob> {
    const zip = new JSZip(); // Start archive creation for download

    // ?? IN OG SCRIPT: Get list of pacenote files for eachstage
    const idsMapObject = new Map<number, number>();
    idsMap.forEach(({ old_id, new_id }) => {
        idsMapObject.set(old_id, new_id);
    });

    // Iterate over individual pacenote files
    for (const file of Array.from(files)) {
        // ?? IN OG SCRIPT: Check if the file has already been translated.
            // This shouldn't be necessary, because we are not working on users filesystem


        // Load contents of the original INI file
        const fileContent = await file.text();
        const iniData = ini.parse(fileContent);

        // Prepare structures for new INI file
        const filteredData: FilteredData = {
            PACENOTES: iniData["PACENOTES"] ? { count: parseInt(iniData["PACENOTES"].count, 10) || 0 } : { count: 0 }
        }

        let pCounter = 0;

        delete iniData["PACENOTES"];
        delete iniData["_"];

        for (const [section, data] of Object.entries(iniData)) {
            let pacenote = parseInt(data["type"], 10);
            let flags = parseInt(data["flag"], 10);

            if (pacenote > 5000) continue;

            if (idsMapObject.has(pacenote)) { // Find current (old)pacenote in the map
                pacenote = idsMapObject.get(pacenote)!; // Replace the (old)pacenote with new pacenote
            }

            if (pacenotesMap.hasOwnProperty(pacenote)) {
                const standard = standardMap[pacenotesMap[pacenote]];
                data["flag"] = (pacenote << 19) | 0b100000000000000 | (flags & 256);
                data["type"] = standard;
            } else {
                data["flag"] = (flags & 256);
            }

            filteredData[`P${pCounter}`] = data;
            pCounter++;
        }

        filteredData["PACENOTES"].count = pCounter;
        const outputContent = `; ${file.name} pacenotes file generated for CoPilot mods compatible with ${targetStandard} \n`
        + "; For more details, please visit https://amun.pl/tools/virtual-codriver \n\n"
        + ini.stringify(filteredData, { whitespace: true, platform: "win32" });
        zip.file(file.webkitRelativePath, outputContent);

        console.log(`Processed: `, file.name);
    }

    return zip.generateAsync({ type: 'blob' });
}