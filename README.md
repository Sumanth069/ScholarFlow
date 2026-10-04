# ScholarFlow 🏛️

> **Transparent, Explainable Scholarship Disbursement & Integrity Platform**  
> *Engineered for Algothon '26. Aligned with the Digital Personal Data Protection (DPDP) Act, 2023.*

ScholarFlow replaces bureaucratic, opaque &ldquo;defective&rdquo; scholarship rejections across Indian government portals (such as NSP, SSP Karnataka, and MahaDBT) with **actionable, multi-lingual correction loops**, **regional transliteration-tolerant identity matching**, and **tamper-evident cryptographic audit chains**.

---

## ⚡ Key Highlights & Architecture

1. **Deterministic Separation (&ldquo;LLM Reads, Rules Decide&rdquo; — ADR-002):**
   * Multimodal LLMs are restricted strictly to structured perceptual data extraction.
   * Decisions are executed by a **100% pure, zero-I/O, deterministic TypeScript rule engine** with an injected clock (IST) and 4-tier outcome reduction (`AUTO_CLEARED`, `NEEDS_CORRECTION`, `MANUAL_REVIEW`, `REJECTED_INELIGIBLE`).
2. **India-First Identity & Name Matching:**
   * **Verhoeff Checksum:** In-memory validation of Aadhaar format without persistence of full 12 digits.
   * **Transliteration & Cultural Folding:** Handles initials expansion (`K Sumanth` ↔ `Kumar Sumanth`), honorific stripping, Kannada phonetic shifts (`th/t`, `dh/d`, `ee/i`, `v/w`, `sh/s`), compound name spacing variations, and Jaro-Winkler scoring.
3. **DPDP Act (2023) Compliance by Design:**
   * Zero raw Aadhaar storage (only last-4 and salted HMAC for deduplication).
   * Field-level AES-GCM encryption for bank account credentials.
   * Minor guardian consent OTP workflow for applicants under 18.
4. **Tamper-Evident Cryptographic Audit Chain:**
   * Append-only ledger linking every decision via `sha256(prevHash + canonicalJSON(payload))`.
   * Real-time verification button and automated nightly job that pinpoints any insider database tampering.
5. **Humane Remedial UX:**
   * Rather than flat rejection, defective applications receive a **single-use scoped link (`/c/[token]`)** protected by OTP, explaining the exact deficiency in **Kannada and English** and enabling targeted re-upload.

---

## 🏗️ Repository Layout

```text
scholarflow/
├── apps/
│   └── web/                   # Next.js 15 (App Router), Tailwind CSS, Lucide
│       ├── app/
│       │   ├── page.tsx       # Live interactive rule engine & name matching benchmark
│       │   ├── apply/         # Multi-step applicant submission & health-check
│       │   ├── reviewer/      # Department reviewer queue, concurrency lock & correction composer
│       │   ├── audit/         # Tamper-evident cryptographic audit chain inspector
│       │   └── c/[token]/     # Scoped correction link for applicants
│       └── i18n/              # Bilingual Kannada (kn.json) & English (en.json) dictionaries
├── packages/
│   ├── rules/                 # PURE rule engine (no I/O, fully unit-tested)
│   ├── matching/              # Verhoeff, Indian name matcher, IFSC, date/percentage validators
│   ├── extraction/            # Multimodal extraction schemas, FakeProvider, prompts
│   ├── adapters/              # Nadakacheri registry, Bank, DBT, and notification adapters
│   ├── db/                    # Prisma schema (15 models), state transitions, audit chain
│   └── shared/                # Zod schemas, domain types, constants
├── docs/                      # ADRs, STRIDE threat model, architecture runbooks
└── vitest.config.ts           # Root test configuration
```

---

## 🚀 Quickstart (< 5 minutes)

### Prerequisites
* Node.js >= 20
* pnpm >= 9

### 1. Installation
```bash
git clone <repo-url> scholarflow
cd scholarflow
pnpm install
```

### 2. Run Test Suite
```bash
pnpm test
```
*Executes unit tests across all pure packages (`@scholarflow/matching`, `@scholarflow/rules`, `@scholarflow/db`) in milliseconds with 100% boundary coverage.*

### 3. Launch Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to access the interactive web suite.

---

## 🛡️ Disclosures & Attributions
* **AI-Assisted Components:** Codebase scaffolding, test fixture generation, and rule definitions developed with Antigravity AI pair programming assistant. Every line, schema, and cryptographic formula has been reviewed, tested, and validated.
* **Datasets & Reference Tables:** Synthetic benchmark fixtures and reference IFSC datasets used for testing. No real citizen PII is contained within this repository.
