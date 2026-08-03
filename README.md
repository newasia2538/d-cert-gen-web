# Remembered

Remembered is a privacy-first web application for creating minimalist remembrance certificates. Users can add a portrait, enter a date of birth and date of passing, generate a keepsake image, and share or download the result.

The application is designed to feel calm, respectful, and easy to use. It runs entirely in the browser and does not require an account or a database.

Repository: <https://github.com/newasia2538/d-cert-gen-web>

## Features

- Upload an image or paste an image directly from the clipboard.
- Switch the interface between English and Thai.
- Enter dates by typing or by using the native date picker.
- Generate a responsive square certificate preview with a soft, minimalist visual style.
- Export the square certificate as a high-resolution PNG image.
- Share through the Web Share API when supported.
- Open sharing actions for Facebook, X, and Instagram.
- Copy a compressed share URL containing the certificate state.
- Keep images and certificate data in the browser until the user chooses to share or download.

## Technology

- Next.js 16 App Router
- React 19
- TypeScript with strict type checking
- CSS-based responsive interface
- Client-side SVG rendering and Canvas PNG export
- `lz-string` compressed share-state URLs
- Vitest unit tests
- Playwright Chromium end-to-end tests
- Vercel-compatible deployment

## Architecture

The project uses a small, client-first architecture:

- `app/page.tsx` contains the interactive certificate editor and sharing actions.
- `lib/certificate.ts` contains date validation, XML escaping, and SVG generation.
- `lib/share.ts` contains compressed URL-state encoding and decoding.
- `tests/` contains unit and browser automation coverage.

Certificate images include Thai `ชาตะ` and `มรณะ` date labels on separate lines. Instagram does not provide a general web URL-sharing endpoint, so its action copies the share link and opens Instagram; mobile users can also use the native device share sheet.

No image or certificate data is sent to an application server. Uploaded images are resized in the browser before being embedded in the generated certificate and share URL.

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer

## Getting started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open <http://localhost:3000> in a browser.

## Quality checks

Run the complete verification suite:

```bash
npm run test:all
npm run build
```

Individual checks are also available:

```bash
npm run typecheck
npm test
npm run test:e2e
npm audit --omit=dev --audit-level=high
```

The end-to-end suite requires the Playwright Chromium browser. Install it once when needed:

```bash
npx playwright install chromium
```

## Deployment

The application is a static-friendly Next.js project and can be deployed directly to Vercel.

Using the Vercel CLI:

```bash
npx vercel login
npx vercel --prod
```

Alternatively, import the GitHub repository into Vercel. The default build settings are sufficient:

- Build command: `npm run build`
- Install command: `npm install`
- Output: managed automatically by Next.js

## Privacy note

Remembered does not upload portraits to a storage service. A share URL can contain compressed certificate data, including the resized portrait, so users should share links only with people they trust.

## Project status

This project is maintained as a focused, client-side certificate generator. Future improvements may include additional certificate themes, localization, and optional server-backed links for shorter public URLs.
