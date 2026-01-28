FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependências
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Instalar todas as dependências (incluindo dev)
RUN npm ci

# Gerar o Prisma Client
# --no-engine é importante para build environments onde o banco não está acessível
# Definimos uma URL dummy para o build, pois o prisma generate precisa validar o config
ARG DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

# Copiar o código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage de Produção
FROM node:22-alpine

WORKDIR /app

# Instalar dependências necessárias para o sistema (OpenSSL para Prisma)
RUN apk add --no-cache openssl ca-certificates

# Copiar artefatos do build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Expor a porta da aplicação
EXPOSE 3000

# Comando de inicialização: roda migrações e inicia a app
CMD ["sh", "-c", "npx prisma migrate deploy --config prisma.config.ts && node dist/src/main.js"]
