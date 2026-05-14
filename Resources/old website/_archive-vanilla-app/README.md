# WildWise App

Role-based web application for wildlife rehabilitation case management.

## Roles
- **Finder** — reports injured/orphaned animals, requests rescue kits
- **Licensed Rehabber** — manages cases, volunteers, sub-permittees, inventory
- **Sub-Permittee** — handles assigned cases under a rehabber's permit
- **Volunteer** — task logs, scheduling, hour tracking
- **Transport Volunteer** — trip matching, open requests, driver profile
- **Licensed Vet** — treatment plans, Rx logs, DEA compliance
- **Admin** — user management, license approvals, kit inventory, reports

## Stack
- **Frontend** — Vanilla HTML/CSS/JS (no build step)
- **Backend / Auth** — Supabase
- **Functions** — Netlify serverless functions
- **Email** — Resend
- **Payments** — Square
- **Hosting** — Netlify

## Getting Started
1. Copy `.env.example` → `.env` and fill in your keys
2. `netlify dev` to run locally with functions
3. Deploy: push to `main` — Netlify auto-builds

## Structure
```
src/pages/<role>/   — role-scoped pages
src/lib/            — shared JS utilities
src/components/     — reusable HTML/CSS/JS components
src/styles/         — global CSS
netlify/functions/  — serverless backend
```
