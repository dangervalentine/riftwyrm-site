# riftwyrm-site

The website for Riftwyrm, served at https://riftwyrm.dangervalentine.com: a
landing page, the privacy policy (`/privacy`) and support (`/support`). Next.js
16, React 19, Tailwind 4, TypeScript; every page is static.

```sh
npm install
npm run dev     # http://localhost:3200
npm run lint
npm run build
npm run start   # http://127.0.0.1:3200
```

Shared facts (name, contact email, developer, tagline) live in
`components/site.ts`. The icon (`app/icon.svg`, `public/icon.svg`) is the
game's app icon. Deployment: see `DEPLOY.md`.
