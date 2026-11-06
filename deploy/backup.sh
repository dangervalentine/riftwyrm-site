#!/usr/bin/env bash
# Nightly, on the remote server (cron): the beta sign-ups to Cloudflare R2, through the
# Riftwyrm scores service's own backup code and R2 keys (its riftwyrm_scores/backup.py),
# under riftwyrm-site/ in the same bucket, kept 30 days.
#   40 4 * * * /opt/riftwyrm-site/deploy/backup.sh >> /var/log/riftwyrm-site-backup.log 2>&1
set -euo pipefail

docker exec riftwyrm_web cat /data/beta-signups.jsonl | docker exec -i riftwyrm_scores python -c '
import datetime, pathlib, sys, tempfile
from riftwyrm_scores import backup
config = backup.R2Config.from_env()
config.prefix = "riftwyrm-site"
body = sys.stdin.buffer.read()
with tempfile.TemporaryDirectory() as tmp:
    path = pathlib.Path(tmp) / ("beta-signups-%s.jsonl" % datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d"))
    path.write_bytes(body)
    key, pruned = backup.upload(config, path)
print(datetime.datetime.now().isoformat(timespec="seconds"), key, len(body), "bytes,", pruned, "old copies removed")
'
