import { readdirSync, statSync } from "fs";
import path from "path";

export function getAllFiles(folderPath: string): string[] {
    let response: string[] = [];

    try {
        const allFilesAndFolders = readdirSync(folderPath);
        allFilesAndFolders.forEach(file => {
            const fullFilePath = path.join(folderPath, file);
            try {
                if (statSync(fullFilePath).isDirectory()) {
                    // Recursively get files from subdirectories
                    response = response.concat(getAllFiles(fullFilePath));
                } else {
                    response.push(fullFilePath);
                }
            } catch (err) {
                console.error(`Error accessing ${fullFilePath}:`, err);
            }
        });
    } catch (err) {
        console.error(`Error reading directory ${folderPath}:`, err);
    }

    return response;
}
