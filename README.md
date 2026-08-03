# Remembered

Minimalist remembrance certificate generator. Runs entirely in the browser.

## Stack

- Next.js App Router + React 19 + TypeScript
- Local SVG generation, canvas PNG export, Clipboard API, Web Share API
- Vitest unit tests + Playwright browser tests
- Vercel-ready, no database required for the first release

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verify

```bash
npm run typecheck
npm test
npm run test:e2e
npm run build
```

Share URLs keep certificate state in a compressed query parameter. Images remain local until the user explicitly shares the URL or downloads the PNG.
