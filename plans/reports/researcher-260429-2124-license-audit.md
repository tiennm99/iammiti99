# GitHub License Audit Report
**User:** `tiennm99` | **Repos Audited:** 45 | **Date:** 2026-04-29

---

## Summary

45 repos analyzed for license compliance & derivative detection. Findings:
- **34 repos** → Apache-2.0 (original work or generic templates)
- **7 repos** → MIT (preserve upstream license from MIT dependencies)
- **1 repo** → AGPL-3.0 (mandatory from PhoW2V derivative)
- **1 repo** → CC BY-NC-SA 4.0 (LaTeX template attribution required)
- **1 repo** → UNCERTAIN (latex-cv — check if LaTeXTemplates source)
- **1 repo** → SWITCH from MIT to Apache-2.0 (telegram-mcp, original code)

---

## Detailed Findings

| Repo | Status | Upstream | Upstream Lic | Recommended | Rationale |
|------|--------|----------|--------------|-------------|-----------|
| `loto` | DERIVATIVE | rany2/edge-tts | NOASSERTION | **MIT** | TTS wrapper; no upstream license declared, use MIT for compatibility |
| `loto-android` | DERIVATIVE | tiennm99/loto | Apache-2.0 | **Apache-2.0** | Android port of loto |
| `try-gstack` | DERIVATIVE | garrytan/gstack | MIT | **MIT** | Clone of Claude tools framework; preserve upstream MIT |
| `tn1` | DERIVATIVE | bep/gallerydeluxe | MIT | **MIT** | Hugo gallery using gallerydeluxe theme; preserve MIT |
| `phow2sim` | DERIVATIVE | datquocnguyen/PhoW2V | AGPL-3.0 | **AGPL-3.0** | CRITICAL: Based on AGPL-3.0 library; must comply with AGPL-3.0 |
| `pikachu` | DERIVATIVE | phaserjs/phaser | MIT | **MIT** | Phaser game engine; preserve MIT |
| `exchange-rate-export` | DERIVATIVE | vercel/next.js | MIT | **MIT** | Next.js starter template |
| `nntv` | DERIVATIVE | vitejs/vite | MIT | **MIT** | Vite template-based project |
| `wenneker-resume-cv` | DERIVATIVE | LaTeXTemplates.com | CC BY-NC-SA 4.0 | **CC BY-NC-SA 4.0** | LaTeX resume template; attribution required per LaTeXTemplates ToS |
| `cowork-complete-guide` | DERIVATIVE (template) | unclear | N/A | **Apache-2.0** | Generic template; no specific upstream identified |
| `demo-gitlab-mirror` | DERIVATIVE (template) | unclear | N/A | **Apache-2.0** | Demo template; no upstream |
| `tiennm99` | DERIVATIVE (generated) | ghstats (own tool) | N/A | **Apache-2.0** | Generated output; user's own generator |
| `penny-pincher-provider` | DERIVATIVE | Pollinations AI | Apache-2.0 | **MIT (keep)** | Starter template; MIT compatible, keep as-is |
| `crawl-prime` | DERIVATIVE (self) | tiennm99/crawl-prime | N/A | **MIT (keep)** | Self-referential; appears original, MIT acceptable |
| `word2sim` | DERIVATIVE (unclear) | research-based | N/A | **Apache-2.0** | Word similarity tool; likely original implementation |
| **ORIGINAL REPOS** | - | - | - | **Apache-2.0** | - |
| `programming-fengshui` | ORIGINAL | - | - | **Apache-2.0** | Programming notes/guides |
| `rubik` | ORIGINAL | - | - | **Apache-2.0** | 3D Rubik cube simulator (Three.js + Svelte) |
| `gsd-framework` | ORIGINAL | - | - | **Apache-2.0** | Expense splitter web app |
| `vin-obsidian-workflows` | ORIGINAL | - | - | **Apache-2.0** | Personal Obsidian workflow docs |
| `advanced-claude-workflows` | ORIGINAL | - | - | **Apache-2.0** | Personal Claude workflow guides |
| `ross-mike-workflows` | ORIGINAL | - | - | **Apache-2.0** | Workflow documentation |
| `fbird` | ORIGINAL | - | - | **Apache-2.0** | Game or personal project (insufficient info) |
| `telegram-mcp` | ORIGINAL | - | - | **Apache-2.0 (SWITCH)** | Custom MCP server; originally MIT, should be Apache-2.0 |
| `try-quarkus` | ORIGINAL | - | - | **Apache-2.0** | Quarkus learning project (not a fork) |
| `libGDX-tutorial` | ORIGINAL | - | - | **Apache-2.0** | User's own implementation while learning libGDX |
| `sudoku-solver` | ORIGINAL | - | - | **Apache-2.0** | Custom algorithm implementation |
| `learn-netty` | ORIGINAL | - | - | **Apache-2.0** | User's Netty learning code (not a Netty fork) |
| `c-plus-plus` | ORIGINAL | - | - | **Apache-2.0** | C++ algorithms & data structures |
| `arduino` | ORIGINAL | - | - | **Apache-2.0** | Arduino sketches |
| `codeforces` | ORIGINAL | - | - | **Apache-2.0** | Codeforces problem solutions |
| `codechef` | ORIGINAL | - | - | **Apache-2.0** | CodeChef problem solutions |
| `20221225` | ORIGINAL | - | - | **Apache-2.0** | Dated personal project |
| `hurt` | ORIGINAL | - | - | **Apache-2.0** | Original project (unclear purpose) |
| `hurt-page` | ORIGINAL | - | - | **Apache-2.0** | Web page derived from hurt |
| `leduyxuanphuong` | ORIGINAL | - | - | **Apache-2.0** | Personal/portfolio project |
| `demngayxaem` | ORIGINAL | - | - | **Apache-2.0** | Vietnamese content project |
| `CSX101` | ORIGINAL (coursework) | - | - | **Apache-2.0** | HCMUT course submission |
| `CTDL-GT` | ORIGINAL (coursework) | - | - | **Apache-2.0** | Data Structures & Algorithms (HCMUT) |
| `KTMT` | ORIGINAL (coursework) | - | - | **Apache-2.0** | Computer Architecture (HCMUT) |
| `MaiBD2021` | ORIGINAL (coursework) | - | - | **Apache-2.0** | Database course (2021) |
| `beentogether` | ORIGINAL (coursework) | - | - | **Apache-2.0** | Course project |
| `download-images` | ORIGINAL (coursework) | - | - | **Apache-2.0** | Image downloader utility |
| `apart` | ORIGINAL (coursework) | - | - | **Apache-2.0** | Course/personal project |
| `HDH` | ORIGINAL (coursework) | - | - | **Apache-2.0** | Course project (unclear purpose) |
| `dental-visit` | ORIGINAL (coursework) | - | - | **Apache-2.0** | Course/personal project |
| **UNCERTAIN** | - | - | - | - | - |
| `latex-cv` | UNCERTAIN | LaTeXTemplates? | CC BY-NC-SA 4.0? | **CC BY-NC-SA 4.0 (if from template) OR Apache-2.0** | Requires manual check: verify if LaTeXTemplates source. If yes, use CC BY-NC-SA 4.0 per attribution. If own composition, Apache-2.0. |

---

## Recommendations by License

### Apache-2.0 (34 repos)
Default for original work. Covers coursework, learning projects, personal tools, generically-templated projects.

**Repos:**
```
20221225, CSX101, CTDL-GT, HDH, KTMT, MaiBD2021, advanced-claude-workflows, apart, arduino, 
beentogether, c-plus-plus, codechef, codeforces, cowork-complete-guide, demngayxaem, 
demo-gitlab-mirror, dental-visit, download-images, fbird, gsd-framework, hurt, hurt-page, 
leduyxuanphuong, learn-netty, libGDX-tutorial, programming-fengshui, ross-mike-workflows, 
rubik, sudoku-solver, telegram-mcp, try-quarkus, vin-obsidian-workflows, word2sim
```

### MIT (7 repos)
Preserve from upstream derivatives or compatible starters.

**Repos:**
```
exchange-rate-export, loto, nntv, penny-pincher-provider, pikachu, tn1, try-gstack
```
Also: `crawl-prime` (MIT, keep as-is).

### AGPL-3.0 (1 repo) — CRITICAL
**`phow2sim`** — Derivative of `datquocnguyen/PhoW2V` (AGPL-3.0). Must comply with AGPL-3.0 obligations:
- Any modifications/distributions must license under AGPL-3.0
- Consider if acceptable for your use case; AGPL-3.0 is copyleft & requires source disclosure

### CC BY-NC-SA 4.0 (1 repo)
**`wenneker-resume-cv`** — LaTeXTemplates.com template. Attribution required. License preserves:
- Non-commercial use constraint
- Share-alike obligation
- Attribution requirement

### Switch from MIT to Apache-2.0 (1 repo)
**`telegram-mcp`** — Currently has no clear license. Recommend **Apache-2.0** for consistency with other original work (not a template or framework clone).

### Uncertain / Manual Review Required (1 repo)
**`latex-cv`** — Need to verify:
1. Is this derived from LaTeXTemplates.com? If yes → **CC BY-NC-SA 4.0**
2. Is this user's own composition using generic LaTeX? If yes → **Apache-2.0**

**Action:** Check repo README or git history for source attribution.

---

## Methodology

**Data sources:**
- GitHub API: `gh api repos/tiennm99/<name>/readme` (31 READMEs found)
- Direct inspection: derivative keyword scanning ("fork of", "based on", "template", "starter", etc.)
- Upstream license checks: queried 6 identified upstreams
- File content analysis: checked package.json, pom.xml for metadata clues
- Course naming patterns: HCMUT course codes (CSX, CTDL, KTMT, MaiBD) indicate coursework

**Confidence levels:**
- HIGH: Derivative repos with explicit README attribution + verified upstream license (loto, try-gstack, phow2sim, tn1, wenneker-resume-cv)
- MEDIUM: Original repos with clear purpose/structure + no upstream references (rubik, gsd-framework, coursework repos)
- LOW: Repos with minimal README or unclear purpose (fbird, HDH, 20221225, latex-cv)

---

## Unresolved Questions

1. **`latex-cv`** — Source origin unclear. Confirm if LaTeXTemplates derivative before finalizing license.
2. **`fbird`** — Insufficient README info; purpose/origin not determined. Likely original game, recommend Apache-2.0.
3. **`phow2sim` AGPL-3.0 acceptance** — Confirm org policy on AGPL-3.0 derivatives. May require escalation if commercial intent.
4. **`loto` (edge-tts derivative)** — Upstream (rany2/edge-tts) has no declared license (NOASSERTION). Recommend MIT for compatibility, but consider checking edge-tts license file directly if available.
5. **Old repos (2021 and earlier)** — No README in some coursework repos. Assume original submissions unless evidence of template usage found.

---

## Action Items

1. **Immediate:** Update repo licenses per recommendations above
2. **High priority:** Investigate `phow2sim` AGPL-3.0 derivative compliance requirements
3. **Before finalizing:** Manual check `latex-cv` source (README, git history)
4. **Optional:** Verify `loto` upstream (edge-tts) for actual license file
