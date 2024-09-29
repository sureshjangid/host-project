import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

if (!accessKeyId || !secretAccessKey) {
    throw new Error('Missing AWS credentials in environment variables');
}

const s3Client = new S3Client({
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    },
    region: 'us-east-1',
});

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
