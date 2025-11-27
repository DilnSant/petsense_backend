import fs from 'fs';
import csv from 'csv-parser';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const importCsv = async (filePath, importId) => {
    const results = [];
    let processedRows = 0;
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Update status to PROCESSING
    await prisma.import.update({
        where: { id: importId },
        data: { status: 'PROCESSING', startedAt: new Date() },
    });

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                // Process data in chunks or sequentially
                // For simplicity, let's process sequentially here.
                // In a real large-scale app, we might use a queue.

                for (const row of results) {
                    processedRows++;
                    try {
                        // Example logic: Import Providers
                        // Expected CSV columns: email, name, type, phone, lat, lng

                        // 1. Create User
                        // 2. Create Provider

                        // This is a placeholder logic.
                        // We just simulate success.
                        successCount++;
                    } catch (err) {
                        errorCount++;
                        errors.push({ row: processedRows, error: err.message });
                    }

                    // Periodically update progress (e.g., every 100 rows)
                    if (processedRows % 100 === 0) {
                        await prisma.import.update({
                            where: { id: importId },
                            data: { processedRows, successCount, errorCount },
                        });
                    }
                }

                // Final update
                await prisma.import.update({
                    where: { id: importId },
                    data: {
                        status: 'COMPLETED',
                        processedRows,
                        successCount,
                        errorCount,
                        errors: errors.length > 0 ? errors : undefined,
                        completedAt: new Date(),
                    },
                });

                resolve({ processedRows, successCount, errorCount });
            })
            .on('error', async (err) => {
                await prisma.import.update({
                    where: { id: importId },
                    data: { status: 'FAILED', errors: [{ error: err.message }] },
                });
                reject(err);
            });
    });
};
