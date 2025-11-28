import fs from "fs";
import csv from "csv-parser";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv"; 

dotenv.config();

// CONFIGURAÇÃO
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE // IMPORTANTE: service_role, não anon
);

if (!process.env.SUPABASE_SERVICE_ROLE) {
  console.error("❌ Faltando SUPABASE_SERVICE_ROLE no .env");
  process.exit(1);
}

const filePath = process.argv[2];
const table = process.argv[3];

if (!filePath || !table) {
  console.log("Uso correto:");
  console.log("node scripts/import_supabase.js ./csv/providers.csv providers");
  process.exit();
}

const rows = [];

fs.createReadStream(filePath)
  .pipe(csv())
  .on("data", (data) => rows.push(data))
  .on("end", async () => {
    console.log(`📥 Importando ${rows.length} linhas para ${table}...`);

    const { error } = await supabase.from(table).insert(rows);

    if (error) {
      console.error("❌ Erro ao importar:", error);
    } else {
      console.log(`✅ Importação concluída com sucesso para tabela ${table}`);
    }
  });
