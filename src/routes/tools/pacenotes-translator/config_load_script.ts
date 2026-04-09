import fs from 'fs';
import path from 'path';

export function tryReadFile(filePath: string): string | null {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch {
        return null;
    }
}

export type FileEntry = [path: string, content: string | null];

export function fileEntry(relativePath: string): FileEntry {
    const fullPath = path.resolve(relativePath);
    return [fullPath, tryReadFile(fullPath)];
}