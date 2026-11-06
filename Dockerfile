# The site on the remote server (DEPLOY.md): built with every package, run with the
# production ones. The scripts (testflight, beta-export, android-invite) stay in the
# image so they can be run with `docker exec riftwyrm_web npm run ...`.
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build && npm prune --omit=dev && rm -rf .next/cache

FROM node:24-slim
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 \
    BETA_SIGNUPS_FILE=/data/beta-signups.jsonl
WORKDIR /app
COPY --from=build --chown=node:node /app ./
# The sign-ups live in a volume mounted here, owned by the user the site runs as.
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 3200
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
    CMD node -e "fetch('http://127.0.0.1:3200/').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
# Not `npm run start`: that binds 127.0.0.1, and in the container only the docker
# network (Caddy) may reach it.
CMD ["node_modules/.bin/next", "start", "--port", "3200", "--hostname", "0.0.0.0"]
