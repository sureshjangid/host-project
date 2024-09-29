import express, { Request, Response } from 'express';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'; // Use AWS SDK v3's GetObjectCommand
import dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config();
const app = express();
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

app.use("/*", async (req: Request, res: Response) => {
    try {
        const host = req.hostname;
        const id = 'sxdvm'
        const filePath = req.originalUrl
console.log(host,'host====>');
console.log(id,'id====>');
console.log(filePath,'filePath===>');




        // Fetch the object from S3
        const command = new GetObjectCommand({
            Bucket: "suresh-vercel",
            Key: `dist/${id}${filePath}`
        });

        const s3Response = await s3Client.send(command);

        // Set the content type based on the file extension
        const type = filePath.endsWith(".html") ? "text/html"
            : filePath.endsWith(".css") ? "text/css"
            : "application/javascript"; // Fixed typo

        res.set("Content-Type", type);

        // Stream the file content to the response
        if (s3Response.Body instanceof Readable) {
            s3Response.Body.pipe(res);
        } else {
            res.status(500).send("Error reading S3 file stream.");
        }
    } catch (error) {
        console.error('Error fetching file from S3:', error);
        res.status(500).send("Failed to retrieve file.");
    }
});

app.listen(5002, () => {
    console.log('Server running on port 5002');
});
