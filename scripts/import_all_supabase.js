import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// ----------------------------------------------------------
// 1) CONECTAR NO SUPABASE
// ----------------------------------------------------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ ERRO: SUPABASE_URL ou SERVICE_ROLE_KEY ausente no .env");
  process.exit(1);
}

// ----------------------------------------------------------
// 2) LISTA DE TABELAS QUE SERÃO IMPORTADAS
// ----------------------------------------------------------
const tables = [
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

// ----------------------------------------------------------
// 3) PASTA DOS CSVs
// ----------------------------------------------------------
const IMPORT_DIR = "./admin/imports";

// ----------------------------------------------------------
// 4) Função para ler CSV e converter para JSON
// ----------------------------------------------------------
function loadCSV(filepath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filepath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

// ----------------------------------------------------------
// 5) Importar tabela por tabela
// ----------------------------------------------------------
async function importTable(tableName) {
  const csvPath = path.join(IMPORT_DIR, `${tableName}.csv`);

  if (!fs.existsSync(csvPath)) {
    console.log(`⚠️ CSV não encontrado para tabela: ${tableName}`);
    return;
  }

  console.log(`📤 Importando ${tableName}.csv...`);

  const rows = await loadCSV(csvPath);

  if (rows.length === 0) {
    console.log(`⚠️ CSV vazio para ${tableName}, ignorando.`);
    return;
  }

  const { error } = await supabase
    .from(tableName)
    .insert(rows, { returning: "minimal" });

  if (error) {
    console.error(`❌ Erro ao importar ${tableName}:`, error);
  } else {
    console.log(`✅ ${tableName} importado com sucesso!`);
  }
}

// ----------------------------------------------------------
// 6) IMPORTAÇÃO GERAL
// ----------------------------------------------------------
async function importAll() {
  console.log("🚀 Iniciando importação TOTAL para o Supabase...");

  for (const table of tables) {
    await importTable(table);
  }

  console.log("🎉 Importação concluída!");
  process.exit(0);
}

importAll();
