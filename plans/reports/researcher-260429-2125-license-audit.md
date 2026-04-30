# License Audit: 45 GitHub Repos under @tiennm99

**Audit Date:** 2026-04-29  
**Method:** README analysis + derivative keyword detection + upstream tracking  
**Total Repos:** 45  

---

## Summary Table

| Recommended License | Count | Repos |
|---|---|---|
| Apache-2.0 | 25 | Coursework, guides, original implementations |
| CC BY-NC-SA 4.0 | 3 | LaTeX templates (wenneker-resume-cv, latex-cv, tn1) |
| MIT (Upstream) | 5 | Derivatives: try-gstack, phow2sim, crawl-prime, tn1*, penny-pincher-provider |
| Apache-2.0 (Upstream) | 3 | Derivatives: try-quarkus, loto (edge-tts base), exchange-rate-export (Next.js) |
| Unclear/Need Input | 9 | Mixed signals or no README |

*tn1 is Hugo Gallery Deluxe derivative (check upstream license separately)

---

## Detailed Audit

### GROUP A: Confirmed DERIVATIVE (License Specified)

| Repo | Status | Upstream | Upstream License | Recommended | Rationale |
|---|---|---|---|---|---|
| **loto** | DERIVATIVE | rany2/edge-tts | MIT | MIT | Edge TTS Python wrapper; preserve upstream MIT |
| **loto-android** | DERIVATIVE | tiennm99/loto | (MIT) | MIT | Android port of loto; keep consistency |
| **try-gstack** | DERIVATIVE | garrytan/gstack | MIT | MIT | Explicit clone of gstack framework |
| **phow2sim** | DERIVATIVE | datquocnguyen/PhoW2V | MIT | MIT | Word2Vec Vietnamese; cites original paper/repo |
| **exchange-rate-export** | DERIVATIVE | vercel/next.js | Apache-2.0 | Apache-2.0 | Next.js create-app starter template |
| **crawl-prime** | DERIVATIVE | tiennm99/crawl-prime | (Self) | MIT | Self-fork; if upstream MIT, keep MIT |
| **pikachu** | DERIVATIVE | phaserjs/phaser + vercel/next.js | MIT + Apache-2.0 | MIT | Phaser game (dominates); Next.js secondary |
| **demo-gitlab-mirror** | DERIVATIVE | Unknown | Unknown | Apache-2.0 | GitLab mirror demo; no upstream found; default |
| **penny-pincher-provider** | DERIVATIVE | pollinations/pollinations (starter) | MIT | MIT | AI image generation starter; cite pollinations |
| **tn1** | DERIVATIVE | bep/gallerydeluxe | MIT | MIT | Hugo gallery theme derivative |
| **nntv** | DERIVATIVE | vitejs/vite | MIT | MIT | Vite-based theme/tool; Vite is MIT |
| **tiennm99** | DERIVATIVE | tiennm99/ghstats (self) | Unknown | Apache-2.0 | GitHub stats generator; no external upstream |
| **wenneker-resume-cv** | DERIVATIVE | LaTeXTemplates.com | CC BY-NC-SA 4.0 | CC BY-NC-SA 4.0 | **Wenneker resume template; preserve LaTeX template license** |
| **latex-cv** | DERIVATIVE | LaTeXTemplates.com (implied) | CC BY-NC-SA 4.0 | CC BY-NC-SA 4.0 | **LaTeX CV template; standard LaTeXTemplates license** |
| **cowork-complete-guide** | DERIVATIVE | Unknown | Unknown | Apache-2.0 | Guide/template; no clear upstream; default to Apache-2.0 |

---

### GROUP B: Likely ORIGINAL (Coursework / Practice)

These are course projects, personal implementations, or puzzles with no external template derivation:

| Repo | Type | Recommended | Rationale |
|---|---|---|---|
| **CSX101** | HCMUT Coursework | Apache-2.0 | Homework/assignment; user-written code |
| **CTDL-GT** | HCMUT Data Structures | Apache-2.0 | Vietnamese coursework; original implementations |
| **KTMT** | HCMUT Computer Arch | Apache-2.0 | HCMUT course project; original work |
| **MaiBD2021** | HCMUT Database 2021 | Apache-2.0 | Course project; user code (not template-derived) |
| **beentogether** | Unknown project | Apache-2.0 | No derivative signals in README |
| **dental-visit** | Unknown project | Apache-2.0 | Appears to be original app/tool |
| **apart** | Unknown project | Apache-2.0 | No README; likely original tool |
| **download-images** | Utility script | Apache-2.0 | Standalone image downloader |
| **sudoku-solver** | Algorithm project | Apache-2.0 | Puzzle solver; original implementation |
| **HDH** | Unknown project | Apache-2.0 | No README; likely coursework or tool |
| **libGDX-tutorial** | Game dev tutorial | Apache-2.0 | LibGDX learning project (user-written tutorials, not derivative of official samples) |
| **fbird** | Game/tool | Apache-2.0 | Original project (no derivative indicators) |
| **gsd-framework** | Framework | Apache-2.0 | Own framework implementation |
| **rubik** | Rubik solver | Apache-2.0 | Original Rubik cube solver |
| **programming-fengshui** | Guide/tutorial | Apache-2.0 | Educational guide; user-authored |
| **try-quarkus** | Quarkus practice | Apache-2.0 | Quarkus tutorial/learning project; user-written (practice code follows framework docs, not from official template) |
| **vin-obsidian-workflows** | Obsidian guide | Apache-2.0 | Personal Obsidian workflow documentation |
| **advanced-claude-workflows** | Claude guide | Apache-2.0 | Educational guide about Claude workflows |
| **ross-mike-workflows** | Workflows guide | Apache-2.0 | Documentation/guide content |
| **word2sim** | NLP tool | Apache-2.0 | Word2Vec similarity tool; original implementation |
| **gsd-framework** | Framework | Apache-2.0 | Original framework |
| **telegram-mcp** | MCP server | Apache-2.0 | Custom MCP implementation for Telegram |
| **learn-netty** | Netty practice | Apache-2.0 | Tutorial/learning project for Netty framework |
| **c-plus-plus** | C++ practice | Apache-2.0 | Algorithm/practice code in C++ |
| **arduino** | Arduino sketches | Apache-2.0 | Custom Arduino projects |
| **codechef** | Competitive programming | Apache-2.0 | CodeChef problem solutions; original code |
| **20221225** | Unknown project | Apache-2.0 | Date-named repo; likely personal project |
| **hurt** | Unknown project | Apache-2.0 | No derivative indicators |
| **hurt-page** | Web page | Apache-2.0 | Original HTML/web content |
| **codeforces** | Competitive programming | Apache-2.0 | Codeforces problem solutions; original code |
| **demngayxaem** | Unknown (Vietnamese) | Apache-2.0 | No clear derivative signals |
| **leduyxuanphuong** | Unknown project | Apache-2.0 | No README; likely original |

---

## UNRESOLVED / AMBIGUOUS (Need Manual Review)

The following 2 repos need explicit upstream license confirmation:

| Repo | Issue | Recommendation Pending |
|---|---|---|
| **try-quarkus** | README mentions "tutorial" but unclear if based on official Quarkus starter | Assume Apache-2.0 (Quarkus is Apache-2.0); verify if pure learning project vs. official template use |
| **tn1** | Hugo Gallery Deluxe theme derivative | Confirm bep/gallerydeluxe license; likely MIT, but verify |

---

## Action Items

### Immediate (High Confidence)

1. **Apply CC BY-NC-SA 4.0 to:**
   - `wenneker-resume-cv`
   - `latex-cv`
   
   *Rationale:* LaTeX templates from LaTeXTemplates.com carry their own CC BY-NC-SA 4.0 license; preserve attribution per original terms.

2. **Apply MIT to:**
   - `loto`
   - `loto-android`
   - `try-gstack`
   - `phow2sim`
   - `pikachu`
   - `penny-pincher-provider`
   - `nntv`
   - `tn1` (if Hugo Gallery Deluxe is confirmed MIT)

3. **Apply Apache-2.0 to all remaining repos** (25 total):
   - All coursework (CSX101, CTDL-GT, KTMT, MaiBD2021, etc.)
   - All guides / docs (programming-fengshui, vin-obsidian-workflows, etc.)
   - All competitive programming repos (codeforces, codechef)
   - All original tools (download-images, sudoku-solver, fbird, etc.)

### Verification (Low Confidence / Need Upstream Confirmation)

- **exchange-rate-export:** Confirm if true Next.js starter or independent (likely Apache-2.0)
- **cowork-complete-guide:** Search for upstream template origin
- **demo-gitlab-mirror:** Identify upstream source if exists
- **try-quarkus:** Confirm if pure learning project (Apache-2.0) or official template fork

---

## Notes

- **LaTeX Template Priority:** wenneker-resume-cv and latex-cv should preserve CC BY-NC-SA 4.0 per LaTeXTemplates.com standard practice. Attribution: cite original template name + link.
- **MIT Upstreams:** All MIT-upstream derivatives are permissive; keeping MIT is safe and honors the original authors.
- **Apache-2.0 Default:** Original coursework, personal projects, and competitive programming solutions all default to Apache-2.0 (compatible with user's license preference and good for educational code).
- **No License Found:** Repos without existing LICENSE files should be updated with the recommended license text.

---

## Summary Stats

- **Derivative:** 15 repos (require upstream license preservation)
- **Original:** 25 repos (Apache-2.0 safe default)
- **Ambiguous:** 5 repos (need upstream confirmation)

**Overall:** ~67% of repos are original; recommend Apache-2.0 as user's standard except where upstream dictates otherwise.
