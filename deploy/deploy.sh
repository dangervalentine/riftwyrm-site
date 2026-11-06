#!/usr/bin/env bash
# Deploys the site on the remote server: pull the branch, rebuild the container, check
# it answers (DEPLOY.md). Run from anywhere with ssh access:
#   deploy/deploy.sh [branch] [root@91.99.62.133]
# The first run clones the repository and stops after making deploy/.env from
# env.example: fill it in, put the App Store Connect key at secrets/asc.p8, run again.
set -euo pipefail

branch="${1:-main}"
host="${2:-root@91.99.62.133}"
repo=https://github.com/dangervalentine/riftwyrm-site.git
dest=/opt/riftwyrm-site

ssh "$host" bash -s -- "$branch" "$repo" "$dest" <<'EOF'
set -euo pipefail
branch="$1"; repo="$2"; dest="$3"
[ -d "$dest/.git" ] || git clone -q "$repo" "$dest"
cd "$dest"
git fetch -q origin
git checkout -q "$branch"
git reset -q --hard "origin/$branch"
mkdir -p secrets && chmod 700 secrets
if [ ! -f deploy/.env ]; then
	install -m 600 deploy/env.example deploy/.env
	echo "Made $dest/deploy/.env: fill it in, put the key at $dest/secrets/asc.p8, run again." >&2
	exit 1
fi
if [ ! -f secrets/asc.p8 ]; then
	echo "No $dest/secrets/asc.p8 (the App Store Connect key); TestFlight invitations need it." >&2
	exit 1
fi
docker compose -f deploy/docker-compose.yml up -d --build
for i in $(seq 1 40); do
	if curl -fsS -o /dev/null http://127.0.0.1:5200/; then echo "riftwyrm_web answers ($(git log --oneline -1))"; exit 0; fi
	sleep 1
done
echo "The site did not answer; docker logs riftwyrm_web says why." >&2
exit 1
EOF
