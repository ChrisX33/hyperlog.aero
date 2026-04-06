# CLAUDE.md — hyperlog.aero

## Project Overview

HyperLog marketing website, brochure, and whitepaper for hyperlog.aero. Built with Astro + Tailwind CSS.

**Product:** HyperLog — blockchain pilot logbook & digital credentials infrastructure
**Company:** JetLink Technologies Ltd (Company No. 17100204)
**Domain:** hyperlog.aero
**Contact:** info@hyperlog.aero (form emails go to contact@jetlink-tech.com with [HyperLog] subject prefix)
**Tagline:** Trust in Every Entry
**Office:** Level 9, Berkeley Square House, Berkeley Square, London W1J 6BY

### The People

- **Christian Charalambous** — CEO/co-founder, Boeing 767 pilot, First Class Honours in Air Transport Operations, 4 years leading Web3/IoT/AI consultancy
- **Vincent Malterre** — CTO/co-founder, Boeing 737 pilot, creator of FlightFile (500+ pilots), decade of software engineering, French textile company background
- Both are active airline pilots and experienced software engineers who have worked together since FlightFile (Norwegian Airlines). 40 years combined aviation experience, 20 years collective software engineering.

---

## Tech Stack

- **Framework:** Astro (static output with Node adapter)
- **Styling:** Tailwind CSS v4 (via @tailwindcss/vite)
- **Hosting:** Docker container on JetLink VPS, behind nginx reverse proxy
- **Repo:** https://github.com/ChrisX33/hyperlog.aero

## Pages

- `src/pages/index.astro` — Home (hero, problem, solution, evidence layer, credential layer, architecture, CTA)
- `src/pages/pitch.astro` — 11-slide brochure (printable as PDF via PitchLayout). Previously called "briefing" — now called "brochure" everywhere.
- `src/pages/about.astro` — About JetLink, founder profiles
- `src/pages/contact.astro` — Contact form with Cloudflare Turnstile CAPTCHA + privacy policy checkbox
- `src/pages/whitepaper.astro` — Whitepaper request form (name, email, LinkedIn, reason). Requests stored in JetLink admin DB via internal API call. Whitepaper document itself lives behind JetLink admin auth at `/admin/hyperlog-wp/document`.
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
**Container:** `hyperlog-website` on port 4000, on `hyperlog_prod` + `jetlink_internal` Docker networks

```bash
ssh -i ~/.ssh/id_jetlink-deploy admin@46.224.186.226 "cd ~/hyperlog.aero && git pull && docker compose up -d --build"
```

## Key Integrations

- **Cloudflare Turnstile:** Site key `0x4AAAAAAC0RLz9YOUx_4VYY` on contact + whitepaper forms (uses `data-size="flexible"` + JS `scale()` transform for screens narrower than 300px). Privacy policy checkbox required on both forms.
- **Google Analytics:** Consent-based loading via cookie banner
- **Google Maps:** Embedded on contact page (filter: invert + hue-rotate for dark theme, saturate 0.5 / brightness 0.7 for pin visibility)
- **SMTP:** Contact form posts to `/api/contact`, emails to contact@jetlink-tech.com with `[HyperLog]` subject prefix. Uses `christian@jetlink-tech.com` SMTP credentials via Gmail.
- **JetLink Admin API:** Whitepaper requests forward to JetLink admin via internal Docker network (`http://jetlink-web:3000/api/admin/hyperlog-wp/requests`). Auth via `X-Internal-Key` header. Env vars: `JETLINK_API_URL`, `JETLINK_INTERNAL_KEY`
- **SEO:** @astrojs/sitemap (auto-generated), robots.txt, canonical URLs, Open Graph + Twitter Card tags, JSON-LD Organization schema, unique meta descriptions per page, og-image.png (1200x630), favicon.ico fallback

---

## Three-Document System

The website, brochure, and whitepaper serve three levels of the same funnel:

1. **Website** (hyperlog.aero) — 2 minutes, anyone, public
2. **Brochure** (/pitch) — 10 minutes, downloadable PDF, presentation-ready
3. **Whitepaper** (JetLink admin /admin/hyperlog-wp/document) — 45+ minutes, gated behind request form, comprehensive technical detail

All three must be consistent. The brochure is a higher-level public document aligned with the website. The whitepaper is the detailed technical reference shared only on request after LinkedIn verification. When updating one, check the others for alignment.

**Terminology rules across all three:**
- Use "tamper-evident" not "immutable" (entries can be amended via append-only chain)
- Use "permanent" for on-chain data
- Use "brochure" not "briefing"
- NAAs first, IATA second in engagement text ("engage with national aviation authorities, IATA, and aviation stakeholders — aligned with the ICAO Trust Framework")
- Use "all participating NAAs" not "~193 NAAs" (aspirational vs realistic)

---

## HyperLog Architecture — AUTHORITATIVE REFERENCE

This section is the authoritative reference for all content. The whitepaper is the most detailed source. The website and brochure must be consistent with this at a higher level.

### Two Layers, One Platform

**Evidence Layer — Hyperledger Fabric (bottom-up trust):**
Pilot creates flight records, trust builds through independent verification sources. This is HyperLog's core innovation. No ICAO standard exists for digital logbooks — this is greenfield.

**Credential Layer — W3C Verifiable Credentials / Aries-derived (top-down trust):**
Authority issues credentials (licence, medical, ratings), trust comes from the issuer's digital signature. ICAO-aligned via Amendment 178.

**The logbook is the evidence base that supports credential issuance.** A licence is only meaningful if the flight hours behind it are real.

### Logbook Verification Spectrum (5 levels, Level 5 aspirational)

1. **Pilot signed** — ECDSA P-256 signature via device biometrics (always available)
2. **Crew corroborated** — other pilot(s) independently log the same flight via QR code sharing
3. **ADS-B tracked** — Flightradar24 (primary) + FlightAware (secondary), both via Aireon satellite ADS-B on Iridium constellation. Logbook verification accuracy (minutes, not seconds).
4. **Airline OPS verified** — rostering system confirms crew were assigned
5. **Authority certified** — ASPIRATIONAL ONLY. CAAs do not currently sign logbook entries.

**Website/brochure show 4 levels** (omit Level 5). **Whitepaper shows all 5** with Level 5 clearly marked aspirational.

### Channel Architecture (Hyperledger Fabric)

**NAA Channel (one per authority — standard template):**
- On-chain: credential issuance records, revocation registry, logbook entry hashes (SHA-256)
- Private Data Collections (PDCs):
  - Logbook PDC (write: pilot/airline, read: pilot/airline with consent/CAA)
  - Medical PDC (write: AME, read: AME/CAA only)
  - Training PDC (write: ATO/instructor, read: ATO/CAA only)
- Each NAA controls its own MSP / Certificate Authority
- Peer nodes: JetLink-managed or NAA self-hosted

**Verification Channel (shared by all participating NAAs):**
- Issuer public keys (cached by ramp checker apps)
- Revocation registry references (synced periodically, 1-24h configurable)
- Cross-border queries for licence conversion
- Read-only for verification consumers, writable by NAAs

**Ordering Service:**
- 5-node Raft cluster (fail-operational, tolerates 2 simultaneous failures)
- Managed by JetLink Technologies
- Orderer cannot read or modify transaction content — only orders into blocks

### Cryptographic Architecture

- **Fabric network identity:** X.509 certificates, ECDSA P-256
- **Pilot device key:** ECDSA P-256, generated in secure enclave (iOS/Android), biometric-protected, never transmitted
- **Logbook entry hash:** SHA-256 of canonical JSON
- **VC signatures:** ECDSA P-256 (aligned with ICAO recommended algorithms)
- **DID methods:** did:web for NAA issuers, did:key for pilots
- **ICAO PKD compatibility:** verification channel designed for future integration with ICAO Public Key Directory

### Dual-Store Data Model

Neither copy is "the cache" — synchronised, each serving a distinct purpose:
- **PDC on Fabric peers (authoritative):** Survives device loss. Enables regulatory access and data recovery.
- **Pilot's device (synchronised copy):** Enables offline access. Pilot controls sharing.

**Multi-device support:** Pilots can use multiple devices concurrently (phone + tablet). Each device gets its own key pair and certificate. Old device keys are NOT automatically revoked when a new device is added. Revocation only occurs when a pilot reports a device as lost or stolen.

**Account recovery:** Email + password login, 2FA or passport verification, new key pair generated on new device, logbook restored from PDC.

**Investigation access (tiered):**
- CAA standing access on own channel (GDPR Article 6(1)(c) legal obligation + 6(1)(e) public interest)
- Cross-border: JetLink facilitates inter-channel access on formal regulatory request. No NAA can access another's channel without explicit authorisation from the data-owning authority.

**Data residency:** NAAs are encouraged to host their own peer nodes within their jurisdiction, ensuring genuine data sovereignty. JetLink provides deployment support and manages the ordering service.

**JetLink data access (honest):** JetLink currently has infrastructure-level access as the managed service provider. As NAAs onboard and self-host their own peers, JetLink's access to pilot data is progressively eliminated. PDC collection policies enforce access control at the application layer. TLS provides encryption in transit.

### Amendment Model

Append-only chain — original entry never modified:
- 24-hour grace period before on-chain commit (allows matching mechanism and crew agreement on times)
- Only pilot can initiate amendments (their personal data)
- Automatic reconciliation: roster data takes precedence for times (QAR), ADS-B and pilot's original entry preserved
- No time limit on amendments — but all are timestamped and visible in audit trail
- NAAs can flag entries for review but cannot modify pilot data

### Audit Trail

On-chain audit log (same Fabric ledger, tamper-evident):
- Events: logbook entries, amendments, credential issuance/revocation, PDC access grants, verification events, identity events, regulatory notes
- Visibility: pilot sees own, CAA sees all on channel, airline sees only granted-access pilots

### Credential Flows

- **Issuance:** CAA signs with ECDSA P-256 → VC delivered via DIDComm → issuance record on-chain → public key on verification channel
- **Ramp check (offline):** QR/NFC → verify against cached public key → check cached revocation list → result in seconds. No internet needed.
- **Hiring (online):** Pilot grants time-limited revocable PDC access → airline sees verification chain → pilot revokes after process
- **Licence conversion:** New NAA queries verification channel → requests logbook access with consent → issues new VC under own CA → old records preserved
- **Revocation:** Authority updates registry → propagated to verification channel → ramp checkers sync within configurable interval (1-24h)
- **Medical privacy:** Medical VC shows class + validity only. Clinical data stays in Medical PDC (AME + CAA only). Airlines never access clinical details.

### Crew Flows

- **Standard two-pilot:** PIC logs → QR → F/O scans → auto-populates → signs (~10 sec)
- **Automatic flight matching:** When crew log the same flight independently (without QR), matching mechanism identifies overlapping flights (same route, aircraft, block times within 15-minute tolerance) and links them automatically.
- **Augmented crew (3-4 pilots):** PIC enters sector breakdown (PF/PM per segment), shares QR, each crew sees pre-calculated control time, reviews and signs. Discrepancies visible. Data never reliably captured before.
- **Single pilot:** Pilot-signed + ADS-B only. Provides non-repudiation — pilot cannot later deny having logged the flight.
- **Simulator sessions:** Separate entry type, no ADS-B. ATO endorses via Training PDC. Records device type (FFS/FNPT/FSTD), qualification level, programme.

### Flight Time Categories (20 captured per entry)

Total flight time, PIC, SIC, SPIC/P1U/S, Dual (instruction received), Instructor (instruction given), Multi-engine, Single-engine, Multi-pilot (MCC), Night, Instrument actual IMC, Instrument simulated/hood, Cross-country, Pilot Flying, Pilot Monitoring, Type-specific hours, Landings day, Landings night, Simulator time per device, FSTD/FFS/FNPT type

### Automation Levels

1. Manual (current), 2. Roster pre-populated (near-term), 3. Roster + ADS-B (medium-term), 4. Fully automated (end state)

Even at Level 4, augmented crew control times require pilot input.

### Security Model

Threat analysis covers: key compromise, forged logbook entries, replay attacks, rogue peer nodes, data exfiltration, credential forgery, revocation evasion. All mitigated at infrastructure, protocol, and application levels.

**GDPR right to erasure:** PDC data (stored off-ledger on peer nodes) is purged. DID disassociated from identity at CA level. Ledger entries (hashes only) remain permanently but are no longer resolvable to any person.

**PDC access model:** Access-restricted by collection policy (not encrypted at rest). TLS provides encryption in transit. PDC collection policies enforce access control at the infrastructure level.

### Governance

Three-phase evolution: Foundation (JetLink sole operator) → Council Formation (NAA representatives) → Decentralised Governance (JetLink as technical service provider). One vote per NAA, JetLink non-voting advisory seat. Majority quorum. Deadlock = status quo.

**Business continuity:** Open-source Fabric, distributed peer nodes, orderer transferable. JetLink protected by long-term service agreements.

**SLA:** 99.9% ordering service uptime, 4-hour RTO. Pilot app works offline.

### Revenue Model

Priced competitively with existing digital logbook solutions.
- Pilot logbook (competitive pricing, full blockchain verification included)
- Flight school students (free — go-to-market strategy)
- Flight school licensing (per-school, instructor tools)
- Airline API access (verified hiring data)
- NAA infrastructure (per-authority service fee)
- Consulting & integration

### Transaction Flow (Vincent-corrected)

App prepares flight data → API constructs transaction proposal (Fabric SDK) → app signs with pilot's private key → API submits endorsed transaction to peers.

### NAA Onboarding Notes

- In EASA member states, channels provisioned at national authority level (DGAC, UK CAA), not supranational (EASA)
- Pilot identity verified by NAA or training organisation (not just licence number — supports student pilots)
- Pilots initially enrolled under JetLink org are migrated to NAA channel when that authority joins. Flight history preserved.
- Every onboarding starts with a sandbox test environment

### Scalability

Fabric benchmarks: 1,000-3,000 TPS. Peak global utilisation: <10%. Storage: ~1-2 GB/year per million transactions. Channel partitioning distributes load.

### NAA Onboarding

Sandbox environment → channel provisioning → CA setup → chaincode deployment → verification channel integration → pilot enrolment → system integration (optional, RESTful APIs). Every engagement starts with a dedicated test environment.

---

## Regulatory Context

- **ICAO Trust Framework** — defines digital trust infrastructure for aviation (ACCP, MAIS)
- **Amendment 178 to Annex 1** — drives global EPL standards
- **EASA NPA 2024-08** — transposing Amendment 178 in Europe
- **ISO/IEC 18013-5** — preferred VC implementation standard (digital wallet)
- **W3C VC / DIF DIDComm** — open web standards for credentials and identity
- **SITA/CAAC PoC (2020)** — proved offline peer-to-peer licence verification
- **ICAO PKD** — existing Public Key Directory for ePassports; future integration target

**Framing:** "architecture designed with ACCP/MAIS alignment as the target" — never claim compliance.
**Engagement:** NAAs implement and mandate. IATA advocates. ICAO sets the framework we align with.

**Why blockchain (not a central database):** No centralised government database exists for pilot logbooks because no single state wants another state or private company controlling their pilot data. Data sovereignty is the fundamental reason a distributed architecture is required. HyperLog provides everything existing logbook apps (LogTen Pro, ForeFlight, mccPILOTLOG) offer, plus blockchain-backed verification that no other product can match.

## IATA Context

Dejan Damjanovic (founder of The FANS Group, senior ICAO AIM working group member, ex-Jeppesen Director of Flight Deck Applications at Boeing) offered to introduce Christian to IATA colleagues focused on pilot licensing.

---

## Tone Rules — NON-NEGOTIABLE

- Never startup-casual. Always precise and credible.
- Never overclaim regulatory compliance.
- Never use placeholder statistics.
- Never imply CAAs will sign logbook entries in the near term (authority certification is aspirational).
- Always distinguish logbook verification (spectrum, mostly automated, no ICAO guidance) from credential issuance (authority-issued, ICAO-aligned).
- Be honest about what is built (logbook MVP, Fabric backend) and what is in architecture phase (credentials layer).
- Use "tamper-evident" not "immutable". Use "permanent" for on-chain. Use "append-only" for the ledger model.
- No em dashes in the whitepaper.
- The audience is IATA licensing experts and ICAO working group members — they will see through any overclaiming.

## Current Status (as of April 2026)

- Hyperledger Fabric backend: **Built & deployed**
- Mobile app: **In development** (Flutter)
- Verifiable credentials layer: **Architecture phase**
- Website: **Live at hyperlog.aero**
- Brochure: **Live at hyperlog.aero/pitch** (11 slides, print-to-PDF)
- Whitepaper: **Complete, 24 sections** (behind JetLink admin auth at /admin/hyperlog-wp/document)
- Whitepaper request system: **Live** (form at /whitepaper, admin management at JetLink /admin/hyperlog-wp)
- Seeking NAA & IATA engagement

## Reference Repos (READ ONLY — do not push changes)

- `C:\Dev\Hyperlog\Reference\hyperlog-app` — Flutter mobile app (https://github.com/vmalterre/hyperlog-app)
- `C:\Dev\Hyperlog\Reference\hyperlog-backend` — Hyperledger Fabric backend (https://github.com/vmalterre/hyperlog-backend)
- `C:\Dev\Hyperlog\Reference\hyperlog_website` — Old website (https://github.com/vmalterre/hyperlog_website)

## Reference Documents

- `C:\Dev\Hyperlog\Documents\SP02-ICAO-TFP-Activities.pdf` — ICAO Trust Framework document (sent by Dejan Damjanovic)
- Christian's article: https://www.aerotime.aero/articles/digital-wings-breaking-aviations-bureaucratic-barriers-with-technology (Brexit licence crisis, SITA/CAAC PoC, EPL context)
