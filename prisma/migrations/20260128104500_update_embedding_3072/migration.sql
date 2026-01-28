-- Limpar embeddings incompatíveis para permitir alteração de dimensão
UPDATE "Article" SET "embedding" = NULL;

-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "embedding" TYPE vector(3072);
