// Build iammiti99: render src/template.html with values from config.yaml,
// decorate `repo:`-flagged links with live GitHub stars + last-commit age.
// Output: _site/index.html plus copied static assets from src/.
//
// Runs locally and in GitHub Actions. Uses Node 20+ built-in fetch.

import { readFile, writeFile, mkdir, cp } from "node:fs/promises";
import { existsSync } from "node:fs";
import yaml from "js-yaml";

const SITE_DIR = "_site";
const TEMPLATE_PATH = "src/template.html";
const CONFIG_PATH = "config.yaml";
const TOKEN = process.env.GITHUB_TOKEN;

const config = yaml.load(await readFile(CONFIG_PATH, "utf8"));
const template = await readFile(TEMPLATE_PATH, "utf8");

if (!config?.site || !config?.profile) {
  throw new Error("config.yaml: `site` and `profile` are required.");
}

// --- GitHub data fetcher ---------------------------------------------------

async function fetchRepo(slug) {
  const headers = { "User-Agent": "iammiti99-build", Accept: "application/vnd.github+json" };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

  try {
    const r = await fetch(`https://api.github.com/repos/${slug}`, { headers });
    if (!r.ok) {
      console.warn(`[warn] GitHub API ${slug} → ${r.status}`);
      return null;
    }
    const j = await r.json();
    return { stars: j.stargazers_count, pushed: j.pushed_at };
  } catch (e) {
    console.warn(`[warn] GitHub API ${slug} threw: ${e.message}`);
    return null;
  }
}

const repoSlugs = (config.links ?? []).filter((l) => l.repo).map((l) => l.repo);
const repoData = Object.fromEntries(
  await Promise.all(repoSlugs.map(async (s) => [s, await fetchRepo(s)])),
);

// --- Helpers ---------------------------------------------------------------

const daysSince = (iso) => Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);

// Minimal HTML escape for config-derived text. Single-user content but cheap insurance.
const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// --- Renderers -------------------------------------------------------------

function renderLink(l) {
  const data = l.repo ? repoData[l.repo] : null;
  const meta = data
    ? `<span class="meta">★ ${data.stars} · ${daysSince(data.pushed)}d ago</span>`
    : "";
  const target = esc(l.target ?? "_self");
  const rel = target === "_blank" ? ' rel="noopener"' : "";
  return `        <li><a href="${esc(l.url)}" target="${target}"${rel}><i class="${esc(l.icon)}" aria-hidden="true"></i><span>${esc(l.text)}</span>${meta}</a></li>`;
}

function renderSocial(s) {
  return `        <a href="${esc(s.url)}" title="${esc(s.title)}" rel="noopener" target="_blank" aria-label="${esc(s.title)}"><i class="${esc(s.icon)}" aria-hidden="true"></i></a>`;
}

const linksHtml = (config.links ?? []).map(renderLink).join("\n");
const socialsHtml = (config.socials ?? []).map(renderSocial).join("\n");

// --- Template substitution -------------------------------------------------

const replacements = {
  "${site.title}": esc(config.site.title),
  "${site.description}": esc(config.site.description),
  "${site.url}": esc(config.site.url),
  "${site.lang}": esc(config.site.lang ?? "en"),
  "${site.theme_color_light}": esc(config.site.theme_color_light ?? "#ffffff"),
  "${site.theme_color_dark}": esc(config.site.theme_color_dark ?? "#0d1117"),
  "${profile.name}": esc(config.profile.name),
  "${profile.tagline}": esc(config.profile.tagline),
  "${profile.avatar}": esc(config.profile.avatar),
  "${links_html}": linksHtml,
  "${socials_html}": socialsHtml,
  "${footer.text}": esc(config.footer?.text ?? ""),
  "${footer.copyright}": esc(config.footer?.copyright ?? ""),
  "${last_modified}": new Date().toISOString(),
};

let output = template;
for (const [key, value] of Object.entries(replacements)) {
  output = output.replaceAll(key, value);
}

// --- Write output ----------------------------------------------------------

if (!existsSync(SITE_DIR)) await mkdir(SITE_DIR, { recursive: true });
await writeFile(`${SITE_DIR}/index.html`, output);

// Copy static assets (skip template.html and the gitkeep).
for (const name of ["styles.css", "scripts.js", "images", "favicons", "CNAME"]) {
  const src = `src/${name}`;
  if (existsSync(src)) {
    await cp(src, `${SITE_DIR}/${name}`, { recursive: true });
  }
}

console.log(
  `Built ${SITE_DIR}/index.html (${repoSlugs.length} repos, ${Object.values(repoData).filter(Boolean).length} resolved)`,
);
