# PetSense Backend

Backend completo para o aplicativo PetSense, desenvolvido com Node.js, Express, Prisma, PostgreSQL (PostGIS) e Docker.

## 🚀 Tecnologias

- **Node.js (ESM)**
- **Express**
- **Prisma ORM**
- **PostgreSQL + PostGIS**
- **MinIO (S3 Compatible Storage)**
- **Docker & Docker Compose**
- **Jest + Supertest**

## 🛠️ Configuração e Execução

### Pré-requisitos

- Docker e Docker Compose instalados.
- Node.js 18+ (para rodar scripts locais, se necessário).

### Passo a Passo

1. **Clone o repositório**
2. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
3. **Inicie os serviços (DB, MinIO, API)**
   ```bash
   docker-compose up --build
   ```
   A API estará disponível em `http://localhost:3000`.

4. **Rodar Migrations e Seeds (se não rodar automaticamente)**
   ```bash
   # Dentro do container ou localmente se tiver DB rodando
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

## 📍 Funcionalidades Principais

- **Autenticação JWT**: Access e Refresh Tokens.
- **Geolocalização**: Busca de prestadores próximos (PostGIS `ST_DWithin`).
- **Upload de Arquivos**: Integração com MinIO (compatível com S3).
- **Importação CSV**: Processamento em stream de grandes arquivos.
- **Admin Panel**: Esqueleto em React em `/admin`.

## 📚 Documentação da API

A especificação OpenAPI está disponível no arquivo `openapi.yaml`.
Você pode importar este arquivo no Swagger Editor ou Postman.

### Endpoints Principais

- `POST /auth/register`: Registro de usuários.
- `POST /auth/login`: Login.
- `GET /providers?lat=...&lng=...`: Busca por proximidade.
- `POST /files/upload`: Upload de imagens.

## 🧪 Testes

Para rodar os testes automatizados:

```bash
npm test
```

## 📦 Deploy

### Render / Railway

1. Conecte o repositório.
2. Configure as variáveis de ambiente (DATABASE_URL, JWT_SECRET, etc.).
3. O comando de build é `npm install` e start `npm start`.
4. Para PostGIS, certifique-se que o banco de dados provisionado suporta a extensão.

### Google Cloud Run

1. Construa a imagem Docker: `docker build -t petsense-api .`
2. Faça o push para o GCR.
3. Faça o deploy conectando ao Cloud SQL (Postgres).

## 📱 Integração com FlutterFlow

- Utilize a URL base da API (ex: `https://api.petsense.com`).
- Para endpoints autenticados, envie o header `Authorization: Bearer <token>`.
- Para upload, use `Multipart` body.
