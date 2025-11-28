import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

// -------------------------
// CONFIGURAÇÕES DO SUPABASE
// -------------------------
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes no .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// -------------------------
// PASTA ONDE ESTÃO OS CSVs
// -------------------------
const IMPORT_FOLDER = path.resolve("admin/imports");

// MAPEAR CADA TABELA DO PRISMA
const TABLES = [
    "User",
    "Profile",
    "Provider",
    "Service",
    "Favorite",
    "Review",
    "Appointment",
    "File",
    "Import",
    "AuditLog"
];

// ----------------------------------
// Função que importa UM arquivo CSV
// ----------------------------------
async function importCSVToTable(tableName) {
    const filePath = path.join(IMPORT_FOLDER, `${tableName}.csv`);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  CSV não encontrado para: ${tableName}`);
        return;
    }

    console.log(`📤 Enviando CSV: ${filePath}`);

    const fileContent = fs.readFileSync(filePath, "utf-8");

    const { data, error } = await supabase.from(tableName).insert(
        fileContent
            .split("\n")
            .slice(1) // remove header
            .filter((x) => x.trim() !== "")
            .map((line) => {
                const cols = line.split(",");
                return parseRow(tableName, cols);
            })
    );

    if (error) {
        console.error(`❌ Erro ao importar tabela ${tableName}:`, error);
    } else {
        console.log(`✅ Importação concluída: ${tableName} (${data?.length || 0} registros)`);
    }
}

// ---------------------------------------------
// Converte cada linha do CSV para JSON correto
// ---------------------------------------------
function parseRow(table, cols) {
    switch (table) {
        case "User":
            return {
                id: cols[0],
                email: cols[1],
                password: cols[2],
                role: cols[3],
                createdAt: cols[4],
                updatedAt: cols[5]
            };

        case "Profile":
            return {
                id: cols[0],
                userId: cols[1],
                name: cols[2],
                phone: cols[3],
                address: cols[4],
                avatarUrl: cols[5],
                createdAt: cols[6],
                updatedAt: cols[7]
            };

        case "Provider":
            return {
                id: cols[0],
                userId: cols[1],
                type: cols[2],
                name: cols[3],
                description: cols[4],
                phone: cols[5],
                address: cols[6],
                latitude: Number(cols[7]) || null,
                longitude: Number(cols[8]) || null,
                rating: Number(cols[9]) || 0,
                reviewCount: Number(cols[10]) || 0,
                isVerified: cols[11] === "true",
                createdAt: cols[12],
                updatedAt: cols[13]
            };

        case "Service":
            return {
                id: cols[0],
                providerId: cols[1],
                name: cols[2],
                description: cols[3],
                price: Number(cols[4]),
                durationMin: Number(cols[5]),
                createdAt: cols[6],
                updatedAt: cols[7]
            };

        case "Favorite":
            return {
                id: cols[0],
                userId: cols[1],
                providerId: cols[2],
                createdAt: cols[3]
            };

        case "Review":
            return {
                id: cols[0],
                userId: cols[1],
                providerId: cols[2],
                rating: Number(cols[3]),
                comment: cols[4],
                createdAt: cols[5]
            };

        case "Appointment":
            return {
                id: cols[0],
                userId: cols[1],
                providerId: cols[2],
                serviceId: cols[3],
                date: cols[4],
                status: cols[5],
                notes: cols[6],
                createdAt: cols[7],
                updatedAt: cols[8]
            };

        case "File":
            return {
                id: cols[0],
                filename: cols[1],
                originalName: cols[2],
                mimeType: cols[3],
                size: Number(cols[4]),
                url: cols[5],
                bucket: cols[6],
                key: cols[7],
                createdAt: cols[8]
            };

        case "Import":
            return {
                id: cols[0],
                filename: cols[1],
                status: cols[2],
                totalRows: Number(cols[3]),
                processedRows: Number(cols[4]),
                successCount: Number(cols[5]),
                errorCount: Number(cols[6]),
                errors: cols[7],
                startedAt: cols[8],
                completedAt: cols[9],
                createdAt: cols[10]
            };

        case "AuditLog":
            return {
                id: cols[0],
                userId: cols[1],
                action: cols[2],
                resource: cols[3],
                resourceId: cols[4],
                details: cols[5],
                ipAddress: cols[6],
                createdAt: cols[7]
            };

        default:
            throw new Error(`Tabela não mapeada: ${table}`);
    }
}

// ----------------------------------
// LOOP PRINCIPAL
// ----------------------------------
(async () => {
    console.log("🚀 Importação TOTAL iniciada...\n");

    for (const table of TABLES) {
        await importCSVToTable(table);
    }

    console.log("\n🎉 Importação FINALIZADA – tudo no Supabase!");
    process.exit(0);
})();
