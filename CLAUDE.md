# CLAUDE.md — hyperlog.aero

## Project Overview

HyperLog marketing website and briefing materials for hyperlog.aero. Built with Astro + Tailwind CSS.

**Product:** HyperLog — blockchain pilot logbook & digital credentials infrastructure
**Company:** JetLink Technologies Ltd (Company No. 17100204)
**Domain:** hyperlog.aero
**Contact:** info@hyperlog.aero
**Tagline:** Trust in Every Entry
**Office:** Level 9, Berkeley Square House, Berkeley Square, London W1J 6BY

### The People

- **Christian Charalambous** — CEO/co-founder, Boeing 767 First Officer
- **Vincent Malterre** — CTO/co-founder, engineer

### Existing JetLink Deployments

- Safety & FDM Dashboard — deployed at ASL Airlines France
- MOCDEP — real-time fleet management built for DHL Air UK
- HyperLog — blockchain pilot logbook & digital credentials (this project)

---

## Tech Stack

- **Framework:** Astro (static output with Node adapter)
- **Styling:** Tailwind CSS v4 (via @tailwindcss/vite)
- **Hosting:** Docker container on JetLink VPS, behind nginx reverse proxy
- **Repo:** https://github.com/ChrisX33/hyperlog.aero

## Pages

- `src/pages/index.astro` — Home (hero, problem, solution, evidence layer, credential layer, architecture, CTA)
- `src/pages/pitch.astro` — 11-slide briefing/pitch deck (printable as PDF via PitchLayout)
- `src/pages/about.astro` — About JetLink, founder profiles
- `src/pages/contact.astro` — Contact form with Cloudflare Turnstile CAPTCHA
- `src/pages/whitepaper.astro` — Whitepaper request form (name, email, LinkedIn). Requests stored in JetLink admin DB via internal API call. Whitepaper document itself lives behind JetLink admin auth.
- `src/pages/privacy.astro` — Privacy policy
- `src/pages/terms.astro` — Terms & conditions
- `src/pages/cookies.astro` — Cookie policy

## Development

```bash
cd hyperlog.aero
npm run dev        # http://localhost:4321
npm run build      # Build for production
```

## Deployment

**VPS:** 46.224.186.226 (Hetzner — JetLink VPS)
**SSH:** `ssh -i ~/.ssh/id_jetlink-deploy admin@46.224.186.226`
**Container:** `hyperlog-website` on port 4000, behind nginx on the `hyperlog_prod` Docker network

```bash
ssh -i ~/.ssh/id_jetlink-deploy admin@46.224.186.226 "cd ~/hyperlog.aero && git pull && docker compose up -d --build"
```

## Key Integrations

- **Cloudflare Turnstile:** Site key `0x4AAAAAAC0RLz9YOUx_4VYY` on contact + whitepaper forms (uses `data-size="flexible"` + JS `scale()` transform for screens narrower than 300px)
- **Google Analytics:** Consent-based loading via cookie banner
- **Google Maps:** Embedded on contact page
- **SMTP:** Contact form posts to `/api/contact`, emails to info@hyperlog.aero
- **JetLink Admin API:** Whitepaper requests forward to JetLink admin via internal Docker network (`http://jetlink-web:3000/api/admin/hyperlog-wp/requests`). Auth via `X-Internal-Key` header. Env vars: `JETLINK_API_URL`, `JETLINK_INTERNAL_KEY`

---

## HyperLog Architecture — IMPORTANT CONTEXT

This section is the authoritative reference for all content. The website and pitch as they exist now are the source of truth. Any new pages (whitepaper, brochure) must be consistent with this.

### Two Layers, One Platform

**Evidence Layer — Hyperledger Fabric (bottom-up trust):**
Pilot creates flight records, trust builds through independent verification sources. This is HyperLog's core innovation. No ICAO standard exists for digital logbooks — this is greenfield.

**Credential Layer — W3C Verifiable Credentials / Aries-derived (top-down trust):**
Authority issues credentials (licence, medical, ratings), trust comes from the issuer's digital signature. ICAO-aligned via Amendment 178.

**The logbook is the evidence base that supports credential issuance.** A licence is only meaningful if the flight hours behind it are real. Both layers live in one system.

### Logbook Verification Spectrum (NOT three tiers — a spectrum)

1. **Pilot signed** — cryptographic signature via device biometrics (always available)
2. **Crew corroborated** — other pilot(s) independently log the same flight via QR code sharing
3. **ADS-B tracked** — external surveillance confirms the flight happened
4. **Airline OPS verified** — rostering system confirms crew were assigned
5. **Authority certified** — ASPIRATIONAL ONLY. CAAs do not currently sign logbook entries. Do not imply this is near-term.

**Important framing:** Not every flight gets all sources. The system is honest about what's verified:
- **Private owner** flying their own aircraft: only gets pilot-signed (1 source). No crew, no airline OPS, no guaranteed ADS-B. But even that single cryptographic signature on the blockchain is still more trustworthy than a paper logbook entry.
- **Single pilot commercial ops** (e.g. cargo, small charter): pilot-signed + ADS-B + airline OPS possible (up to 3 sources), but no crew corroboration.
- **Two-pilot airline operation:** can achieve all 4 real sources (4/4).
- **Augmented crew (3-4 pilots):** can achieve all 4 real sources. This is where HyperLog captures data that has NEVER been reliably captured before — who was actually at the controls when.

### Crew Flows

**Standard two-pilot:** PIC logs flight -> generates QR -> F/O scans -> auto-populates their entry with adjusted role -> F/O signs. ~10 seconds.

**Augmented crew (3-4 pilots) — the hard problem:** Airline systems DON'T know who was at the controls when. The relief plan is decided informally by the crew on the day.
- PIC fills in the sector breakdown (who was PF/PM when)
- Shares QR with all crew
- Each crew member sees their pre-calculated control time
- Each reviews and signs independently
- Discrepancies are visible on the record
- This data has NEVER been reliably captured before in aviation

**Single pilot:** Only pilot-signed + ADS-B (if available). Still better than paper.

### Automation Levels

1. **Manual** — pilot types everything (current state)
2. **Roster pre-populated** — import from airline crew management, confirm & sign
3. **Roster + ADS-B** — auto-generated with actual times, one-tap confirm
4. **Fully automated** — airline OPS pushes data, ADS-B confirms, pilot just signs

Even at Level 4, augmented crew control times still need pilot input — this can't be automated.

### Channel Architecture (Hyperledger Fabric)

**NAA Channels — one per National Aviation Authority (e.g. UK CAA, FAA, DGAC):**
- Issuance records (proof credential was issued)
- Revocation registry (suspended/revoked credentials)
- Private Data Collections:
  - Logbook PDC (pilot + airline with consent + CAA)
  - Medical PDC (AME + CAA only)
  - Training PDC (ATO + CAA only)
- Each NAA controls its own Certificate Authority (who gets enrolled)
- All personal data in PDCs — main ledger holds ONLY hashes

**Verification Channel — shared by ALL NAAs:**
- All ~193 NAAs join this channel
- Holds issuer public keys (cached by ramp checker apps)
- Revocation registry references (synced periodically)
- Enables cross-border credential verification
- Any NAA can verify a licence issued by any other NAA
- Enables licence conversion — new NAA queries to confirm existing licence validity

**Infrastructure:**
- Orderer: managed by JetLink Technologies
- Peers: managed by JetLink as a service (NAAs could run own peers later)
- Flight schools DON'T need nodes — they operate under an NAA channel, just need instructor accounts and the app

### Credential Flows

**Credentials (licence, medical, ratings) are DIFFERENT from logbook entries:**
- Licence: issued by CAA/NAA. ICAO Amendment 178 aligned.
- Medical: signed off by AME (Approved Aviation Medical Examiner). Currently paper.
- Ratings: issued by ATOs / CAA after proficiency checks.

**Issuance:** CAA signs credential with private key -> VC goes to pilot's wallet (device) -> issuance record on-chain -> public key on verification channel

**Ramp check (offline):** Pilot presents VC via QR/NFC -> checker verifies issuer signature against cached public key -> checks cached revocation list -> valid/invalid in seconds. No internet needed.

**Hiring (online, consent-based):** Pilot presents VCs + grants time-limited revocable access to logbook PDC -> airline sees flight records with full verification chain -> pilot revokes access after process.

**Licence conversion:** New NAA queries verification channel to confirm old licence -> requests logbook access with pilot consent -> issues new VC -> old records preserved on original channel.

### Dual-Store Data Model

The logbook uses a dual-store model — neither copy is "the cache":

- **PDC on Fabric peers (authoritative):** Full logbook data in Private Data Collections, managed by JetLink. Survives device loss. Enables regulatory access and data recovery.
- **Pilot's device (synchronised copy):** Full logbook data cached locally. Enables offline access. Pilot controls who sees their data.

**Recovery:** If a pilot loses their phone, logbook data is restored from the PDC.

**Accident investigation (tiered access):**
- CAA has standing read access to their own NAA channel's PDCs (they are channel members with their own Certificate Authority). No pilot consent required for investigation access.
- For cross-border investigations, JetLink facilitates inter-channel access on formal regulatory request.

### What Lives Where

- **Pilot's device:** Private key, all VCs (licence, medical, ratings), synchronised logbook copy. Pilot controls access. Private key protected by biometrics, never transmitted.
- **Fabric peers (PDCs):** Full logbook records (authoritative), medical records, training records. Access controlled by PDC membership. Personal data encrypted, never on the main ledger.
- **Blockchain main ledger:** Hashes only, issuance records, revocation registries, issuer public keys. NOT personal data.
- **Ramp checker's app:** Cached issuer public keys (~193 NAAs) + revocation lists. All offline-capable.

### SITA China PoC — The Precedent

SITA proved offline EPL verification with the Civil Aviation Administration of China (CAAC) in 2020 — the first industry partner to demonstrate this. Peer-to-peer, blockchain-anchored, no central database. ICAO mandated offline capability as a core requirement.

**JetLink vs SITA positioning:** SITA is an industry-owned consortium that works at massive scale on standardisation. SITA won't build bespoke solutions for individual regulators. JetLink fills that gap — bespoke implementation for specific NAAs. SITA proved the concept; JetLink builds the implementations.

### Hyperledger Aries Status

Aries as a Hyperledger project has been archived — but this is a sign of maturity, not failure. Core frameworks moved to OpenWallet Foundation (ACA-Py, Credo-TS, VCX, Bifold Wallet). DIDComm specs moved to DIF. W3C VC standard is more active than ever. Frame as: "the frameworks graduated into independent, actively maintained projects."

### Go-to-Market

- Flight schools first — students start from hour one, free logbook until they leave
- Schools operate under an NAA channel, just need instructor accounts and the app
- Legacy data imported as self-attested; HyperLog fixes the future not the past
- Don't put legacy data concerns on the public site — keep as conversation-ready answer

---

## Regulatory Context

- **ICAO Trust Framework** — defines digital trust infrastructure for aviation (ACCP, MAIS)
- **Amendment 178 to Annex 1** — drives global EPL standards
- **EASA NPA 2024-08** — transposing Amendment 178 in Europe
- **ISO/IEC 18013-5** — preferred VC implementation standard (digital wallet)
- **SITA/CAAC PoC (2020)** — proved offline peer-to-peer licence verification

HyperLog's architecture is designed toward ACCP/MAIS alignment — but do NOT claim full compliance. The correct framing is always: "architecture designed with ACCP/MAIS alignment as the target."

## IATA Context

Dejan Damjanovic (founder of The FANS Group, senior ICAO AIM working group member, ex-Jeppesen Director of Flight Deck Applications at Boeing) offered to introduce Christian to IATA colleagues focused on pilot licensing. The pitch at /pitch was created as the briefing document for this introduction.

---

## Tone Rules — NON-NEGOTIABLE

- Never startup-casual. Always precise and credible.
- Never overclaim regulatory compliance.
- Never use placeholder statistics.
- Never imply CAAs will sign logbook entries in the near term (authority certification is aspirational).
- Always distinguish logbook verification (spectrum, mostly automated, no ICAO guidance) from credential issuance (authority-issued, ICAO-aligned).
- Be honest about what is built (logbook MVP, Fabric backend) and what is in architecture phase (credentials layer).
- The audience is IATA licensing experts and ICAO working group members — they will see through any overclaiming.

## Current Status (as of April 2026)

- Hyperledger Fabric backend: **Built & deployed**
- Mobile app: **In development**
- Verifiable credentials layer: **Architecture phase**
- Seeking IATA & CAA engagement

## TODO — Next Session

- Review briefing (/pitch) content for accuracy against architecture
- Build whitepaper — comprehensive technical architecture document covering:
  - Hyperledger Fabric channel architecture (NAA channels, verification channel, PDCs)
  - Verifiable Credentials layer (issuance, offline verification, SITA model)
  - Logbook verification spectrum (pilot signed -> crew -> ADS-B -> airline OPS)
  - Credential flows (licence, medical, ratings — who issues, where it lives)
  - Crew flows (QR sharing, augmented crew, single pilot, automated logging)
  - GDPR and data sovereignty model
  - Ramp check offline verification flow
  - Licence conversion cross-border flow
  - Architecture diagrams

## Reference Repos (READ ONLY — do not push changes)

- `C:\Dev\Hyperlog\Reference\hyperlog-app` — Flutter mobile app (https://github.com/vmalterre/hyperlog-app)
- `C:\Dev\Hyperlog\Reference\hyperlog-backend` — Hyperledger Fabric backend (https://github.com/vmalterre/hyperlog-backend)
- `C:\Dev\Hyperlog\Reference\hyperlog_website` — Old website (https://github.com/vmalterre/hyperlog_website)

## Reference Documents

- `C:\Dev\Hyperlog\Documents\SP02-ICAO-TFP-Activities.pdf` — ICAO Trust Framework document (sent by Dejan Damjanovic)
