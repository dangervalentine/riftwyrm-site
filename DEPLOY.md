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

### Beta sign-ups

The `/beta` form writes sign-ups to a file on this machine. Point
`BETA_SIGNUPS_FILE` at a path outside the clone, so redeploys never touch it,
and make sure the user running the site can write there:

```sh
BETA_SIGNUPS_FILE=/var/lib/riftwyrm/beta-signups.jsonl NODE_ENV=production npm run start
```

Unset, it falls back to `data/beta-signups.jsonl` inside the clone.

To get an email for each sign-up, also set `GMAIL_USER` and
`GMAIL_APP_PASSWORD` (the Gmail account and app password NextQuest's tester
email uses, in its `app/scripts/deploy/config.json`) and optionally
`BETA_NOTIFY_TO`. Put them in the service's environment or in `.env.local`
in the clone; never commit them. Run
`npm run beta-export` with the same `BETA_SIGNUPS_FILE` to get the lists for
TestFlight and Google Play (see the README).

## 3. Expose it

Put a reverse proxy or tunnel in front of `http://localhost:3200` for the
site's hostname, terminate TLS there, and point the domain's DNS at it.

## 4. Check

```sh
curl -I https://riftwyrm.dangervalentine.com/
curl -I https://riftwyrm.dangervalentine.com/privacy
curl -I https://riftwyrm.dangervalentine.com/support
curl -I https://riftwyrm.dangervalentine.com/beta
```

The store listings need the privacy policy URL
`https://riftwyrm.dangervalentine.com/privacy` and support URL
`https://riftwyrm.dangervalentine.com/support`.
