import express, { Request, Response } from 'express';
import simpleGit from 'simple-git';
import cors from 'cors';
import { generateId } from './utils/generateId';
import path from 'path';
import { getAllFiles } from './utils/getAllFiles';
import { uploadFile } from './utils/aws';
import { createClient } from 'redis';

const publisher = createClient();
const subscriber = createClient();
const app = express();
app.use(express.json());
app.use(cors());

(async () => {
    try {
        await publisher.connect(); // Wait for Redis to connect before starting the server
        await subscriber.connect()
        console.log('Connected to Redis');
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        process.exit(1); // Exit if Redis connection fails
    }
})();

app.post('/deploy', async (req: Request, res: Response) => {
    try {
        const { repoUrl } = req.body;
        const id = generateId(); // E.g., "aed32"

        // Clone the repository
        await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

        // Get all files in the cloned repository directory
        const files = getAllFiles(path.join(__dirname, `output/${id}`));

        // Upload files asynchronously
        await Promise.all(files.map(async (file) => {
            await uploadFile(file.slice(__dirname.length + 1), file);
        }));

        // Add the build ID to Redis queue
        await publisher.lPush('build-queue', id);
        await publisher.hSet("status",id,'uploaded');
        // Send the response
        res.json({ id });
    } catch (error) {
        console.error('Error during deployment:', error);
        res.status(500).json({ error: 'Deployment failed', details: error });
    }
});

app.use('/status',async(req:Request,res:Response)=>{
    const id = req.query.id;
    const response = await subscriber.hGet("status",id as string);
    res.json({
        status:response
    })
})

app.listen(5001, () => {
    console.log('Server running on port 5001');
});
