import { createClient } from "@supabase/supabase-js";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET_NAME = process.env.STORAGE_BUCKET || "petsense";

export const uploadFile = async (file) => {
  const filename = `${Date.now()}-${file.originalname}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) {
    console.error("Erro ao enviar arquivo para o Supabase:", error);
    throw error;
  }

  // Get public URL
  const { data: publicData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filename);

  // Save record to database
  const savedFile = await prisma.file.create({
    data: {
      filename: filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      bucket: BUCKET_NAME,
      key: filename,
      url: publicData.publicUrl,
    },
  });

  return savedFile;
};
