/**
 * upload_and_register_supabase.js
 *
 * Usa as variáveis existentes no seu .env:
 * - STORAGE_BUCKET
 * - IMPORT_FOLDER
 */

import fs from "fs";
import path from "path";
import mime from "mime";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

// ============================
// ENV EXISTENTE NO SEU PROJETO
// ============================
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BUCKET = process.env.STORAGE_BUCKET;          // já existe
const IMPORT_DIR = process.env.IMPORT_FOLDER;       // já existe

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("❌ Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env");
  process.exit(1);
}

if (!BUCKET) {
  console.error("❌ STORAGE_BUCKET não configurado no .env");
  process.exit(1);
}

if (!IMPORT_DIR) {
  console.error("❌ IMPORT_FOLDER não configurado no .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

// Pastas internas esperadas
const PROFILE_FOLDER = "profiles";
const FILES_FOLDER = "files";

const getMime = (filename) => mime.getType(filename) || "application/octet-stream";

// ============================
// Upload genérico
// ============================
async function uploadFile(localPath, storagePath) {
  const fileBuffer = fs.readFileSync(localPath);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      upsert: true,
      contentType: getMime(localPath)
    });

  if (error) throw error;
}

async function getPublicUrl(storagePath) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function insertFileRecord(fileMeta) {
  const { data, error } = await supabase
    .from("File")
    .insert(fileMeta)
    .select()
    .single();

  if (error) {
    // se já existir (key única), tenta update
    const { data: updated, error: updateErr } = await supabase
      .from("File")
      .update(fileMeta)
      .eq("key", fileMeta.key)
      .select()
      .single();

    if (updateErr) throw updateErr;
    return updated;
  }

  return data;
}

// ============================
// Atualiza automaticamente Profile.avatarUrl
// ============================
function extractId(filename) {
  const regex = /[0-9a-fA-F-]{8,}/;
  const match = filename.match(regex);
  return match ? match[0] : null;
}

async function linkProfileAvatar(candidateId, url) {
  let res = await supabase
    .from("Profile")
    .update({ avatarUrl: url })
    .eq("id", candidateId)
    .select()
    .maybeSingle();

  if (res.data) return true;

  res = await supabase
    .from("Profile")
    .update({ avatarUrl: url })
    .eq("userId", candidateId)
    .select()
    .maybeSingle();

  return !!res.data;
}

// ============================
// PROCESSAR PROFILES
// ============================
async function processProfiles() {
  const folder = path.join(IMPORT_DIR, PROFILE_FOLDER);
  if (!fs.existsSync(folder)) {
    console.log(`ℹ️ Pasta não existe: ${folder}`);
    return;
  }

  const files = fs.readdirSync(folder);

  for (const file of files) {
    const localPath = path.join(folder, file);
    const key = `${PROFILE_FOLDER}/${file}`;

    console.log(`➡️ Enviando avatar: ${file}`);

    await uploadFile(localPath, key);
    const url = await getPublicUrl(key);

    const stats = fs.statSync(localPath);

    await insertFileRecord({
      filename: file,
      originalName: file,
      mimeType: getMime(file),
      size: stats.size,
      url,
      bucket: BUCKET,
      key
    });

    // tentar vincular automaticamente
    const id = extractId(file);

    if (id) {
      const linked = await linkProfileAvatar(id, url);
      if (linked) {
        console.log(`✔ Avatar vinculado ao Profile: ${id}`);
      } else {
        console.log(`⚠️ Nenhum Profile encontrado com id/userId = ${id}`);
      }
    } else {
      console.log("ℹ️ Não encontrei nenhum ID no nome do arquivo.");
    }
  }
}

// ============================
// PROCESSAR FILES
// ============================
async function processFilesGeneric() {
  const folder = path.join(IMPORT_DIR, FILES_FOLDER);
  if (!fs.existsSync(folder)) return;

  const files = fs.readdirSync(folder);

  for (const file of files) {
    const localPath = path.join(folder, file);
    const key = `${FILES_FOLDER}/${file}`;

    console.log(`➡️ Enviando arquivo: ${file}`);

    await uploadFile(localPath, key);
    const url = await getPublicUrl(key);

    const stats = fs.statSync(localPath);

    await insertFileRecord({
      filename: file,
      originalName: file,
      mimeType: getMime(file),
      size: stats.size,
      url,
      bucket: BUCKET,
      key
    });

    console.log(`✔ File registrado: ${file}`);
  }
}

// ============================
// MAIN
// ============================
async function main() {
  console.log("🚀 Iniciando upload para Supabase Storage + registros SQL");
  await processProfiles();
  await processFilesGeneric();
  console.log("🎉 Finalizado.");
}

main();
