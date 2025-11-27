# Development Stage
FROM node:18-alpine AS dev

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]

# Production Stage
FROM node:18-alpine AS prod

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

CMD ["npm", "start"]
