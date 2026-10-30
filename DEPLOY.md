# Deploying

Nothing in this repository deploys anything. The site is a standard Next.js
app: build it on the host, run it behind a reverse proxy, and point the domain
at the proxy.

## 1. Build

On the host, from a clone of `main`:

```sh
git pull --ff-only origin main
npm ci --include=dev
NODE_ENV=production npm run build
```

`--include=dev` matters if the host builds as well as runs: `next build` needs
TypeScript, Tailwind and the `@types/*` packages, which npm skips under
`NODE_ENV=production`. On a redeploy, stop the running site before `npm ci`
(on Windows, files held open by the live process make it fail).

## 2. Run

```sh
NODE_ENV=production npm run start
```

`npm run start` serves on port 3200, bound to 127.0.0.1, so it is reachable
only through a reverse proxy on the same machine. Run it under a process
manager or service wrapper (systemd, pm2, NSSM, etc.) so it restarts on crash
and on reboot.

## 3. Expose it

Put a reverse proxy or tunnel in front of `http://localhost:3200` for the
site's hostname, terminate TLS there, and point the domain's DNS at it.

## 4. Check

```sh
curl -I https://riftwyrm.dangervalentine.com/
curl -I https://riftwyrm.dangervalentine.com/privacy
curl -I https://riftwyrm.dangervalentine.com/support
```

The store listings need the privacy policy URL
`https://riftwyrm.dangervalentine.com/privacy` and support URL
`https://riftwyrm.dangervalentine.com/support`.
