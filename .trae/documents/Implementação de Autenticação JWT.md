# Implementar Autenticação com JWT e Rastreamento de Login

## 1. Banco de Dados e Entidades

* [ ] Adicionar model `User` no `prisma/schema.prisma`:

  * `id`, `email`, `passwordHash`.

  * `lastLogin DateTime?` para rastrear o último acesso.

* [ ] Criar migração: `npx prisma migrate dev --name add_user_with_last_login`.

* [ ] Definir `UserEntity` no domínio e `IUserRepository` com métodos `findByEmail` e `updateLastLogin`.

## 2. Instalação e Configuração

* [ ] Instalar dependências: `bcrypt`, `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`.

* [ ] Configurar variáveis de ambiente para `JWT_SECRET` e `JWT_EXPIRES_IN`.

## 3. Módulo de Usuário (Infra)

* [ ] Implementar `PrismaUserRepository` com a lógica de persistência e atualização do `lastLogin`.

* [ ] Criar o `UserModule`.

## 4. Módulo de Autenticação (Core)

* [ ] Criar `LoginUseCase`:

  * Validar e-mail e senha (bcrypt).

  * Se válido, atualizar `lastLogin` via repositório.

  * Gerar o token JWT.

* [ ] Implementar `JwtStrategy` para autenticação baseada em token.

* [ ] Criar `AuthController` com o endpoint `POST /auth/login`.

## 5. Segurança das Rotas

* [ ] Criar `JwtAuthGuard`.

* [ ] Proteger endpoints críticos nos controllers de `Article`, `Ingestion` e `Processor`.

## 6. Setup Inicial

* [ ] Atualizar o [seed.ts](file:///c%3A/Users/arthu/Documents/C%C3%B3digo/tech-news/prisma/seed.ts) para criar seu usuário administrativo inicial com senha segura.

