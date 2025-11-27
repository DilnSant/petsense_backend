import { Client } from 'minio';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import path from 'path';

const prisma = new PrismaClient();

const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT, 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET_NAME = process.env.MINIO_BUCKET;

// Ensure bucket exists
(async () => {
    try {
        const exists = await minioClient.bucketExists(BUCKET_NAME);
        if (!exists) {
            await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
        }
    } catch (err) {
        console.error('Error checking/creating bucket:', err);
    }
})();

export const uploadFile = async (file) => {
    const filename = `${Date.now()}-${file.originalname}`;
    const key = filename;

    await minioClient.putObject(BUCKET_NAME, key, file.buffer, file.size, {
        'Content-Type': file.mimetype,
    });

    // Generate URL (presigned or public)
    // For local MinIO, we can construct the URL manually or use presigned.
    // Let's assume public bucket for now or just return the key.
    // http://localhost:9000/petsense-files/key
    const url = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET_NAME}/${key}`;

    const savedFile = await prisma.file.create({
        data: {
            filename: filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            bucket: BUCKET_NAME,
            key: key,
            url: url,
        },
    });

    return savedFile;
};
