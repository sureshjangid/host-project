//@ts-nocheck
import { S3Client, ListObjectsV2Command, GetObjectCommand,PutObjectCommand } from "@aws-sdk/client-s3";
import fs, { readdirSync, readFileSync, statSync } from "fs";
import path from "path";
import dotenv from 'dotenv';
import { pipeline } from "stream";
import { promisify } from "util";

dotenv.config();
const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

if (!accessKeyId || !secretAccessKey) {
    throw new Error('Missing AWS credentials in environment variables');
}

// Create an S3 client instance
const s3Client = new S3Client({
    region: 'us-east-1',
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

const streamPipeline = promisify(pipeline);

export async function downloadS3Folder(prefix: string) {
    try {
        // List all objects in the folder (v3 uses command objects)
        let isTruncated = true; // Handle pagination for large result sets
        let continuationToken;

        while (isTruncated) {
            const listCommand = new ListObjectsV2Command({
                Bucket: "suresh-vercel",
                Prefix: prefix,
                ContinuationToken: continuationToken, // Use continuationToken for paginated results
            });
            const allFiles = await s3Client.send(listCommand);

            isTruncated = allFiles.IsTruncated;
            continuationToken = allFiles.NextContinuationToken;

            // Loop through all files and download each one
            const allPromises = allFiles.Contents?.map(async ({ Key }) => {
                if (!Key) return;

                const finalOutputPath = path.join(__dirname, Key);
                const dirName = path.dirname(finalOutputPath);

                // Ensure the directory exists for the file
                if (!fs.existsSync(dirName)) {
                    fs.mkdirSync(dirName, { recursive: true });
                }

                // Check if the Key is a folder (ends with a /)
                if (Key.endsWith("/")) {
                    // It's a folder, create it locally
                    if (!fs.existsSync(finalOutputPath)) {
                        fs.mkdirSync(finalOutputPath, { recursive: true });
                    }
                } else {
                    // It's a file, download and save it
                    const outputFile = fs.createWriteStream(finalOutputPath);
                    
                    // Get the object from S3 and stream it to a file
                    const getCommand = new GetObjectCommand({
                        Bucket: "suresh-vercel",
                        Key,
                    });
                    const { Body } = await s3Client.send(getCommand);

                    await streamPipeline(Body, outputFile);
                }
            }) || [];

            console.log("Downloading files...");
            await Promise.all(allPromises);
        }

        console.log("Download complete.");
    } catch (error) {
        console.error("Error downloading files:", error);
    }
}

export function copyFinalDist(id:string){
    const folderPath = path.join(__dirname,`output/${id}/build`);
    const allFiles = getAllFiles(folderPath);
    console.log(folderPath,'folderPath');
    
    allFiles.forEach(file=>{
        uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
    })
}

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

export const uploadFile = async (fileName: string, localFilePath: string) => {
    console.log('called');
    const fileContent = readFileSync(localFilePath);

    const uploadParams = {
        Bucket: 'suresh-vercel', // Your S3 bucket name
        Key: fileName,
        Body: fileContent
    };

    try {
        const response = await s3Client.send(new PutObjectCommand(uploadParams));
        console.log(response, 'response');
    } catch (error) {
        console.error('Error uploading file:', error);
    }
};
