#!/usr/bin/env bash
# Capture submission assets (images/screenshot.png + images/tn.png) from
# the live demo. Run from repo root. Re-runnable; overwrites existing files.
#
# Requires: npx (installs Playwright on first run, ~170 MB chromium cache)
# Optional: oxipng (lossless PNG compression — recommended)

set -euo pipefail

URL="${BONSAI_DEMO_URL:-https://tiennm99.github.io/bonsai/}"
SCREENSHOT="images/screenshot.png"
THUMBNAIL="images/tn.png"

cd "$(dirname "$0")/.."

mkdir -p images

echo "==> Installing Playwright Chromium (cached after first run)"
npx --yes playwright@1.50.0 install chromium

echo "==> Capturing screenshot.png (1500x1000)"
npx --yes playwright@1.50.0 screenshot \
  --viewport-size=1500,1000 \
  --browser=chromium \
  --color-scheme=light \
  --wait-for-timeout=800 \
  "$URL" "$SCREENSHOT"

echo "==> Capturing tn.png (900x600)"
npx --yes playwright@1.50.0 screenshot \
  --viewport-size=900,600 \
  --browser=chromium \
  --color-scheme=light \
  --wait-for-timeout=800 \
  "$URL" "$THUMBNAIL"

if command -v oxipng >/dev/null 2>&1; then
  echo "==> Compressing with oxipng"
  oxipng -o4 --strip safe "$SCREENSHOT" "$THUMBNAIL"
else
  echo "==> oxipng not installed; skipping compression (install for smaller files)"
fi

echo "==> Done"
file "$SCREENSHOT" "$THUMBNAIL"
