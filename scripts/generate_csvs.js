import fs from "fs";
import path from "path";

// Pasta onde os CSVs serão criados
const IMPORT_DIR = path.resolve("admin/imports");

// Garante que a pasta exista
if (!fs.existsSync(IMPORT_DIR)) {
    fs.mkdirSync(IMPORT_DIR, { recursive: true });
}

console.log("📦 Gerando CSVs de exemplo para todas as tabelas...\n");

// Lista das tabelas + colunas + exemplo
const tables = {
    users: {
        columns: "id,email,password,role,createdAt,updatedAt",
        sample: "uuid-user-1,admin@petsense.com,$2a$10$hashAqui,ADMIN,2025-01-01T10:00:00.000Z,2025-01-01T10:00:00.000Z"
    },
    profiles: {
        columns: "id,userId,name,phone,address,avatarUrl,createdAt,updatedAt",
        sample: "uuid-profile-1,uuid-user-1,Dilney,+5548999999999,Rua XPTO,http://url-da-foto,2025-01-01T10:00:00.000Z,2025-01-01T10:00:00.000Z"
    },
    providers: {
        columns: "id,userId,type,name,description,phone,address,latitude,longitude,rating,reviewCount,isVerified,createdAt,updatedAt",
        sample: "uuid-prov-1,uuid-user-2,PETSHOP,Happy Pet Shop,Pet shop completo,+5548999988888,Rua ABC,0,0,5,10,true,2025-01-02T12:00:00.000Z,2025-01-02T12:00:00.000Z"
    },
    services: {
        columns: "id,providerId,name,description,price,durationMin,createdAt,updatedAt",
        sample: "uuid-svc-1,uuid-prov-1,Banho,Banho completo,49.90,60,2025-01-02T12:00:00.000Z,2025-01-02T12:00:00.000Z"
    },
    favorites: {
        columns: "id,userId,providerId,createdAt",
        sample: "uuid-fav-1,uuid-user-1,uuid-prov-1,2025-01-03T12:00:00.000Z"
    },
    reviews: {
        columns: "id,userId,providerId,rating,comment,createdAt",
        sample: "uuid-rev-1,uuid-user-1,uuid-prov-1,5,Excelente atendimento!,2025-01-04T12:00:00.000Z"
    },
    appointments: {
        columns: "id,userId,providerId,serviceId,date,status,notes,createdAt,updatedAt",
        sample: "uuid-app-1,uuid-user-1,uuid-prov-1,uuid-svc-1,2025-01-05T15:00:00.000Z,CONFIRMED,Sem observações,2025-01-05T14:00:00.000Z,2025-01-05T14:00:00.000Z"
    },
    files: {
        columns: "id,filename,originalName,mimeType,size,url,bucket,key,createdAt",
        sample: "uuid-file-1,img1.jpg,img1.jpg,image/jpeg,12345,http://url,img-bucket,img1.jpg,2025-01-06T10:00:00.000Z"
    },
    imports: {
        columns: "id,filename,status,totalRows,processedRows,successCount,errorCount,errors,startedAt,completedAt,createdAt",
        sample: "uuid-import-1,file.csv,COMPLETED,10,10,10,0,[],2025-01-07T10:00:00.000Z,2025-01-07T10:10:00.000Z,2025-01-07T10:00:00.000Z"
    },
    audit_logs: {
        columns: "id,userId,action,resource,resourceId,details,ipAddress,createdAt",
        sample: "uuid-log-1,uuid-user-1,LOGIN,User,uuid-user-1,{\"ok\":true},127.0.0.1,2025-01-08T10:00:00.000Z"
    }
};

// Cria cada CSV
Object.entries(tables).forEach(([table, data]) => {
    const filePath = path.join(IMPORT_DIR, `${table}.csv`);
    const content = `${data.columns}\n${data.sample}`;

    fs.writeFileSync(filePath, content);
    console.log(`✔ CSV criado: ${table}.csv`);
});

console.log("\n🎉 Todos os CSVs foram gerados em: admin/imports");
