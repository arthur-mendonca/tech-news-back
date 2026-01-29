---
name: refactor_to_clean_arch
description: Refactors existing NestJS code into strict Clean Architecture layers (Domain, Use Cases, Infra, Interface) following dependency inversion principles.
---

# Refactor to Clean Architecture

## Description

This skill guides the refactoring of tightly coupled NestJS services into a modular Clean Architecture structure. It separates business logic from infrastructure and ensures Dependency Inversion using abstract gateways.

## When to use

Use this skill when:

- Converting a "God Class" service (e.g., a service doing DB, API calls, and Logic) into Use Cases.
- You see external libraries (axios, prisma, openai) imported directly into business logic.
- You need to fix a module to match the project's "Golden Standard" (like the `TagModule`).

## Instructions

1.  **Analyze the Dependency Graph**
    - Identify external dependencies (Database, 3rd party APIs, File System).
    - Identify business rules (validations, data transformations, flow control).

2.  **Create Domain Layer (`src/modules/<name>/domain/`)**
    - **Entities:** Create pure TS classes defining the data structure. No decorators (unless absolutely necessary), no DB logic.
    - **Gateways (Interfaces):** Define interfaces for _every_ external interaction.
      - Naming: `I<Name>Repository` for DB, `I<Name>Gateway` for external services.
      - **CRITICAL:** Create a unique symbol or string constant for DI (e.g., `export const IScraperGateway = Symbol('IScraperGateway');`).

3.  **Create Use Case Layer (`src/modules/<name>/use-cases/`)**
    - Create one file per action (e.g., `process-article.use-case.ts`).
    - Inject dependencies using the Interface Token: `@Inject(IScraperGateway) private readonly scraper: IScraperGateway`.
    - **Constraint:** NEVER import `PrismaService`, `Axios`, or `LLMService` here. Only imports from `../domain` are allowed.

4.  **Create Infrastructure Layer (`src/modules/<name>/infra/`)**
    - Create adapters that implement the Domain Interfaces.
    - Naming: `Prisma<Name>Repository`, `JinaScraperGateway`, `GeminiContentGenerator`.
    - Put all external libs here (Prisma, Axios, AI SDK).

5.  **Wire the Module (`src/modules/<name>/<name>.module.ts`)**
    - Configure the `providers` array using `provide` (token) and `useClass` (implementation).
    - Example:
      ```typescript
      {
        provide: IScraperGateway,
        useClass: JinaScraperAdapter
      }
      ```

## Examples

**Input:**
"Refactor the `SearchService` which uses `duck-duck-scrape` directly."

**Output Plan:**

1. Create `domain/gateways/search.gateway.interface.ts` (Defines `search(query: string): Promise<string[]>`).
2. Create `infra/adapters/duckduckgo-search.adapter.ts` (Implements interface, imports `duck-duck-scrape`).
3. Update `use-cases` to depend on `ISearchGateway`.
4. Update `module.ts` to bind `ISearchGateway` to `DuckDuckGoSearchAdapter`.