#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if ! command -v vercel >/dev/null 2>&1; then
  printf '%s\n' 'A CLI da Vercel precisa estar disponível no Terminal.' >&2
  exit 1
fi

stage="$(mktemp -d "${TMPDIR:-/tmp}/csagos-v2-vercel.XXXXXX")"
trap 'rm -rf "$stage"' EXIT
for entry in src public index.html package.json package-lock.json vite.config.js; do
  cp -R "$project_dir/$entry" "$stage/$entry"
done
mkdir -p "$stage/.vercel"
cp "$project_dir/.vercel/project.json" "$stage/.vercel/project.json"

cat > "$stage/vercel.json" <<'JSON'
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "buildCommand": "VITE_SUPABASE_URL=https://pcvocflfvqdbodyvsetp.supabase.co VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjdm9jZmxmdnFkYm9keXZzZXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTM2ODksImV4cCI6MjEwMjI4OTY4OX0.W9Q_Cy8YvE2nOPo4K9u98inrg1Lni52GqE2owq2LCek npm run build"
}
JSON

cd "$stage"
vercel deploy --yes
