#!/usr/bin/env bash
# sync-icons.sh — vendor Simple Icons (brand) + Lucide (ui) SVGs into assets/icons/
# Idempotent: safe to re-run; existing files are overwritten.
#
# Sources (pinned):
#   Simple Icons  v13.0.0  — CC0 1.0  Universal
#   Lucide Static v0.460.0 — ISC License
#
# Usage: bash scripts/sync-icons.sh
#        Run from repo root.

set -euo pipefail

SI_VERSION="13.0.0"
LUCIDE_VERSION="0.460.0"

SI_BASE="https://cdn.jsdelivr.net/npm/simple-icons@${SI_VERSION}/icons"
LUCIDE_BASE="https://cdn.jsdelivr.net/npm/lucide-static@${LUCIDE_VERSION}/icons"

BRAND_DIR="assets/icons/brand"
UI_DIR="assets/icons/ui"

mkdir -p "${BRAND_DIR}" "${UI_DIR}"

# ---------------------------------------------------------------------------
# Simple Icons brand set (~25 icons)
# Simple Icons use fill="..." with the brand color; we strip it so the icon
# inherits currentColor from its CSS context.
# ---------------------------------------------------------------------------
BRAND_ICONS=(
  github gitlab mastodon bluesky x threads linkedin instagram facebook
  tiktok youtube twitch discord telegram signal whatsapp reddit medium
  devdotto substack hashnode kofi patreon buymeacoffee paypal
)

fetch_brand() {
  local slug="$1"
  local dest="${BRAND_DIR}/${slug}.svg"
  local url="${SI_BASE}/${slug}.svg"
  local tmp

  tmp="$(curl -fsSL "${url}")" || { echo "  WARN: failed to fetch ${url}" >&2; return; }

  # Strip hardcoded fill attribute from <svg> tag and any <path> elements.
  # Simple Icons SVGs have fill="#XXXXXX" on the root <svg>.
  # Replace with fill="currentColor".
  echo "${tmp}" \
    | sed 's/fill="#[0-9A-Fa-f]\{3,6\}"/fill="currentColor"/g' \
    | sed "s/fill='#[0-9A-Fa-f]\{3,6\}'/fill=\"currentColor\"/g" \
    > "${dest}"

  echo "  brand/${slug}.svg"
}

echo "Fetching Simple Icons v${SI_VERSION}..."
for slug in "${BRAND_ICONS[@]}"; do
  fetch_brand "${slug}"
done

# ---------------------------------------------------------------------------
# Lucide UI icon set (~10 icons)
# Lucide SVGs already use stroke="currentColor"; we add width/height="20"
# to normalise size and remove the class attribute (not needed for inline use).
# ---------------------------------------------------------------------------
UI_ICONS=(
  mail globe link rss calendar phone map-pin file-text external-link share-2
)

fetch_ui() {
  local slug="$1"
  local dest="${UI_DIR}/${slug}.svg"
  local url="${LUCIDE_BASE}/${slug}.svg"
  local tmp

  tmp="$(curl -fsSL "${url}")" || { echo "  WARN: failed to fetch ${url}" >&2; return; }

  # Normalise: set width/height to 20, remove class attribute, remove comment line.
  echo "${tmp}" \
    | grep -v '^<!--' \
    | sed 's/width="24"/width="20"/g' \
    | sed 's/height="24"/height="20"/g' \
    | sed 's/ class="[^"]*"//g' \
    > "${dest}"

  echo "  ui/${slug}.svg"
}

echo "Fetching Lucide Static v${LUCIDE_VERSION}..."
for slug in "${UI_ICONS[@]}"; do
  fetch_ui "${slug}"
done

echo "Done. Vendored $(ls "${BRAND_DIR}"/*.svg 2>/dev/null | wc -l | tr -d ' ') brand icons, $(ls "${UI_DIR}"/*.svg 2>/dev/null | wc -l | tr -d ' ') ui icons."
