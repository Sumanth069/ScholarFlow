# ADR-001: Core Technology Stack & Monorepo Architecture

## Status
Accepted

## Context
ScholarFlow is a high-assurance, DPDP-compliant scholarship intake, document verification, correction, and adjudication system.
The system must cater to multiple user personas:
1. Rural and semi-urban applicants (often on low-bandwidth mobile devices or cyber cafe terminals).
2. Institutional verifiers and nodal officers.
3. Department reviewers and approvers.
4. Compliance auditors and system administrators.

Key constraints:
- High execution speed for deterministic business logic (sub-second evaluation of rules).
- Strict data privacy and cryptographic integrity (Aadhaar data minimization, immutable audit logs).
- Fast feedback loops for applicants (bilingual UI in English and Kannada).
- Solo builder efficiency: high reusability, clear module boundaries, fast unit testing without database dependencies.

Options considered:
- Single monolith repo vs. pnpm monorepo.
- Python (FastAPI) + React vs. Full-stack TypeScript (Next.js + pure TS packages).
- Relational (PostgreSQL) vs. Document store (MongoDB).

## Decision
We chose a **TypeScript-first pnpm Monorepo**:
- **Apps:**
  - `apps/web`: Next.js 14+ (App Router), Tailwind CSS, Lucide icons, `next-intl` (English + Kannada).
- **Core Packages:**
  - `packages/shared`: Shared Zod validation schemas, domain types, constants.
  - `packages/matching`: Indian-specific name matching, Verhoeff checksum, IFSC, date/percentage validators.
  - `packages/rules`: Pure, zero-I/O rule engine with injected clock (IST).
  - `packages/extraction`: LLM multimodal schema extraction (Gemini/Claude), fallback parsers, and golden evaluation interfaces.
  - `packages/adapters`: External system adapters (Fake/real Nadakacheri, NPCI DBT, Bank, IFSC registry).
  - `packages/db`: Prisma ORM with PostgreSQL (Neon / local Postgres).
- **Tooling:**
  - `pnpm` workspaces for fast dependency management.
  - `Vitest` for ultra-fast unit testing of pure packages.
  - `Inngest` for idempotent, retryable background job orchestration.

## Consequences
- **Benefits:**
  - Complete type safety across database, rule engine, API, and client forms.
  - Core logic (`matching`, `rules`) runs in pure memory in milliseconds with zero DB or network mocks needed.
  - Simplifies deployment to Vercel and Neon.
- **Risks & Mitigations:**
  - Monorepo tooling overhead: mitigated by keeping package boundaries lightweight and using standard TS project references without bloated config.
