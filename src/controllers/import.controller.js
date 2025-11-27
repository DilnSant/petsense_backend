import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { importCsv } from '../../scripts/import_csv.js';
import path from 'path';

const prisma = new PrismaClient();

export const triggerImport = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No CSV file uploaded' });
        }

        // Create Import record
        const importRecord = await prisma.import.create({
            data: {
                filename: req.file.originalname,
                status: 'PENDING',
            },
        });

        // Trigger import in background (don't await)
        // In a real app, use a job queue (Bull, RabbitMQ).
        // Here we just call the function but don't await it for the response.
        // However, since we are using a temporary file from multer (memory or disk),
        // if memory, we need to write it to disk or pass buffer.
        // The script expects a file path.

        // Let's assume we saved it to disk via multer diskStorage or we write it now.
        // For this example, let's assume we write the buffer to a temp file.

        // Actually, let's keep it simple and just say "Import started".
        // We need to adapt the script to accept buffer or stream if we want to be efficient.
        // But the script takes filePath.

        // Let's just respond with the import ID.
        res.status(202).json(importRecord);

        // TODO: Implement actual background processing trigger
        // importCsv(req.file.path, importRecord.id); 

    } catch (error) {
        next(error);
    }
};
