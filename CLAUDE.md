# CLAUDE.md — hyperlog.aero

## Project Overview

HyperLog marketing website for hyperlog.aero. Built with Astro + Tailwind CSS.

**Product:** HyperLog — blockchain pilot logbook & digital credentials infrastructure
**Company:** JetLink Technologies Ltd (Company No. 17100204)
**Domain:** hyperlog.aero

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

- **Cloudflare Turnstile:** Site key `0x4AAAAAAC0RLz9YOUx_4VYY` on contact form
- **Google Analytics:** Consent-based loading via cookie banner
- **Google Maps:** Embedded on contact page (Berkeley Square House, London)
- **SMTP:** Contact form posts to `/api/contact`, emails to info@hyperlog.aero
