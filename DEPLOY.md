# Deploying

## The remote server (from November 2026)

The site runs as the Docker container `riftwyrm_web` on the remote server
(`root@91.99.62.133`), beside NextQuest and the Riftwyrm scores service. It joins
NextQuest's docker network, and NextQuest's Caddy (which owns ports 80 and 443) forwards
`riftwyrm.dangervalentine.com` to it; Cloudflare proxies the name.

```sh
deploy/deploy.sh [branch]      # pull the branch on the server, rebuild, check it answers
```

- `Dockerfile` builds the site and keeps the scripts, so they run in place:
  `ssh root@91.99.62.133 'docker exec riftwyrm_web npm run testflight -- sync'`
  (likewise `beta-export`, `android-invite`, `android-group`).
- Sign-ups live in the `riftwyrm-site_signups` volume at `/data/beta-signups.jsonl`,
  backed up nightly to R2 by `deploy/backup.sh` (cron at 04:45, beside the scores
  service's backup, under `riftwyrm-site/` in its bucket, kept 30 days).
- Settings: `/opt/riftwyrm-site/deploy/.env` (mode 600, keys in `deploy/env.example`);
  the App Store Connect key: `/opt/riftwyrm-site/secrets/asc.p8` (mode 600), mounted
  read-only. Neither is in git.

The sections below describe the earlier Windows host, kept until it stops serving the site.

## The earlier Windows host

Nothing in this repository deploys anything. The site is a standard Next.js
app: build it on the host, run it behind a reverse proxy, and point the domain
at the proxy.

### 1. Build

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

### 2. Run

```sh
NODE_ENV=production npm run start
```

`npm run start` serves on port 3200, bound to 127.0.0.1, so it is reachable
only through a reverse proxy on the same machine. Run it under a process
manager or service wrapper (systemd, pm2, NSSM, etc.) so it restarts on crash
and on reboot.

#### Beta sign-ups

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
in the clone; never commit them.

For automatic TestFlight invites, add `ASC_ISSUER_ID`, `ASC_KEY_ID`,
`ASC_PRIVATE_KEY_PATH` (the `.p8` file, outside the clone and readable only by
the service account) and `ASC_BETA_GROUP_ID` the same way, restart the
service, and run `npm run testflight -- sync` once (see the README). Run
`npm run beta-export` with the same `BETA_SIGNUPS_FILE` to get the lists for
TestFlight and Google Play (see the README).

### 3. Expose it

Put a reverse proxy or tunnel in front of `http://localhost:3200` for the
site's hostname, terminate TLS there, and point the domain's DNS at it.

### 4. Check

```sh
curl -I https://riftwyrm.dangervalentine.com/
curl -I https://riftwyrm.dangervalentine.com/privacy
curl -I https://riftwyrm.dangervalentine.com/support
curl -I https://riftwyrm.dangervalentine.com/beta
```

The store listings need the privacy policy URL
`https://riftwyrm.dangervalentine.com/privacy` and support URL
`https://riftwyrm.dangervalentine.com/support`.
