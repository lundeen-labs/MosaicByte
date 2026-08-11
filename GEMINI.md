# Mosaic Byte Project Instructions

This project follows the **Developer-Action** model. Claude (Developer) is responsible for implementation and verification, while Tyler (Product) provides intent.

## Core Mandates

- **Default to Action:** Do not ask for permission for safe commands or standard implementation choices.
- **Verification is Mandatory:** Every change must be verified with `npm run lint`, `npx tsc --noEmit`, and `npm test`.
- **Recursive Documentation:** Maintain `README.md` files in all major subdirectories (`src`, `api`, `scripts`, `docs`).
- **Synchronous Updates:** Documentation must be updated in the same turn as code changes.

## Tech Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind v4, Wouter, Framer Motion, Radix UI.
- **Backend:** Static (GitHub Pages), Mailto links for contact.

## Directory Structure

- `src/`: Frontend application.
- `api/`: Serverless functions.
- `docs/`: Project documentation and audits.
- `scripts/`: Automation and build scripts.
- `content/`: Static data and MDX case studies.

## Naming Conventions

- Follow the global naming philosophy: Level 1 (Domain), Level 2 (Component), Level 3 (File).
- Prefer concise Verb/Noun names.
