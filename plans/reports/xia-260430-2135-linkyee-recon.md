# xia recon: ZhgChgLi/linkyee → iammiti99

**Mode:** `--port` (idiomatic rewrite; target stack TBD in Phase 4)
**Source:** https://github.com/ZhgChgLi/linkyee (cloned to /tmp/linkyee-src, depth=1)
**Local:** /config/workspace/tiennm99/iammiti99 (empty: README + LICENSE only)
**Date:** 2026-04-30

## Source manifest

| Item | Value |
| --- | --- |
| Repo | ZhgChgLi/linkyee |
| Stars | (not measured — out of scope) |
| License | MIT (LICENSE file in source) |
| Stack | Ruby 3.4.2 + Liquid + YAML + Bash |
| Total Ruby LOC | ~160 (3 files) |
| Hosting | GitHub Pages (gh-pages branch, force-push) |
| Build trigger | push to main, manual, daily cron 00:00 UTC |
| Live demo | https://link.zhgchg.li/ |

## Source anatomy

### Components

| Layer | File | LOC | Role |
| --- | --- | --- | --- |
| Build entry | `scaffold.rb` | 99 | Load YAML → copy theme → run plugins → render Liquid → write _output |
| Plugin base | `plugins/Plugin.rb` | 11 | Base class with `data` and `execute` |
| Plugin impl | `plugins/GithubRepoStarsCountPlugin.rb` | 43 | Scrapes github.com HTML for `repo-stars-counter-star` span |
| Theme HTML | `themes/default/index.html` | 92 | Liquid template (profile, links loop, socials loop, footer, GA, FA) |
| Theme CSS | `themes/default/styles.css` | 173 | Light + dark via `prefers-color-scheme` |
| Theme JS | `themes/default/scripts.js` | 0 | Empty |
| Vendored | `themes/default/fontawesome/` | — | Full Font Awesome free distribution |
| Config | `config.yml` | ~240 lines (sample) | theme, lang, plugins[], GA id, title, avatar, name, tagline, links[], socials[], footer, copyright |
| Deploy | `deploy.sh` | 81 | git checkout gh-pages → backup _output → flush → force push |
| CI | `.github/workflows/build.yml` | 32 | ruby/setup-ruby@v1 + bundler-cache → bash deploy.sh |
| Deps | `Gemfile` | 6 | bigdecimal, base64, yaml ~3, liquid ~5.5, nokogiri >=1.18.4 |

### Execution path

```
push to main / daily cron / workflow_dispatch
  └─ GitHub Actions (build.yml)
      └─ ruby/setup-ruby@v1 + bundler-cache
          └─ bash deploy.sh
              ├─ build():     bundle exec ruby scaffold.rb
              │                ├─ YAML.load_file(config.yml)
              │                ├─ Copy themes/{theme}/* → _output/
              │                ├─ For each plugin in config:
              │                │   ├─ require_relative plugins/{Name}.rb
              │                │   ├─ Plugin.new(values).execute()  # e.g. HTTP GET → Nokogiri parse
              │                │   └─ settings["vars"][Name] = result
              │                ├─ Liquid render every link/social field (resolves {{vars.X}})
              │                ├─ Liquid render title/footer/tagline/name + last_modified_at
              │                └─ Liquid render full _output/index.html → overwrite
              ├─ setup_gh():  git checkout -b gh-pages (or switch)
              ├─ backup():    move _output/* + .git + CNAME → /tmp
              ├─ flush():     wipe working tree → restore from /tmp
              └─ deploy():    git update-ref -d HEAD → add -A → commit → push -f gh-pages
```

### Config schema (essential fields)

```yaml
theme: default                       # selects themes/{theme}/
lang: "en"
plugins:                             # array of single-key hashes
  - PluginName: [arg1, arg2]
google_analytics_id:
title: "..."
avatar: "./images/profile.jpeg"
name: "@handle"
tagline: "..."
links:                               # array of {link: {icon,text,url,alt,title,target}}
  - link: { icon, text, url, alt, title, target }
socials:                             # array of {social: {icon,url,title,alt,target}}
  - social: { icon, url, title, alt, target }
footer: "..."
copyright: "..."
```

Liquid variable resolution: `{{ vars.PluginName }}` or `{{ vars.PluginName['key'] }}` works in all string fields.

## Dependency matrix (source → local)

Local repo is empty. There is no existing equivalent to override.

| Source dep | Local equivalent | Status | Notes |
| --- | --- | --- | --- |
| Ruby + Liquid | — | NEW | Stack choice is open — see Phase 4 |
| YAML config | — | NEW | Schema can be reused as-is or simplified |
| HTML/CSS theme | — | NEW | Can reuse design wholesale (MIT license permits) |
| Font Awesome (vendored) | — | NEW | CDN vs vendored is a choice |
| GitHub Actions + Pages | — | NEW | Modern GH Pages supports Actions artifact deploy (no gh-pages branch) |
| GithubStars plugin (HTML scrape) | — | NEW | Optional; could use GH API + workflow token |
| Liquid templating | — | NEW | Stack-dependent (Nunjucks/Handlebars/JSX/Astro) |

## Observations / red flags

1. **Force-push to gh-pages is legacy.** GitHub now recommends `actions/deploy-pages` artifact deployment. No branch-overwrite needed.
2. **Scraping github.com for stars is fragile.** A CSS-class change breaks it silently. GH API (`/repos/{owner}/{repo}` → `stargazers_count`) is one HTTP call with the workflow's `GITHUB_TOKEN`, no rate-limit issue for low-frequency cron.
3. **Empty `scripts.js`.** Theme JS is unused — pure CSS interactivity.
4. **Vendored Font Awesome is heavy.** `fontawesome/js/all.js` adds significant bytes. CDN or subsetting (only used icon classes) is leaner.
5. **Theme system is overengineered for single-user.** "Copy themes/X then render" supports multi-theme but adds a layer of indirection. A single-user page can inline.
6. **Plugin contract is loose.** No type checking on plugin output → `{{vars.X['repo']}}` patterns rely on convention.
7. **Config nesting is verbose.** `- link: { ... }` wrapper in YAML serves no purpose; `- { ... }` would be cleaner.
8. **Daily cron is only justified by plugins.** If no dynamic vars, cron + nightly redeploy is wasted CI minutes.

## Cross-cutting concerns

- **SEO/social meta**: og:*, twitter:*, theme-color (light+dark), apple-mobile-web-app-* — solid; reuse.
- **Favicons**: full set referenced from `images/favicons/*` (apple-touch-icon, 16x16, 32x32, manifest, browserconfig).
- **Analytics**: optional Google Analytics gtag block, Liquid-conditional on `google_analytics_id`.

## Local map

`iammiti99` is empty: README + LICENSE (Apache-2.0) + plans/. No prior stack commitment. **All decisions open**.

## Risk assessment

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Stack choice mismatch with user preference | HIGH | Resolve in Phase 4 before any code |
| License compatibility | LOW | linkyee MIT → iammiti99 Apache-2.0: compatible (MIT permits sublicensing under Apache-2.0; preserve linkyee copyright in NOTICE if reusing CSS/HTML) |
| Plugin port complexity | LOW | Single optional plugin; can omit or reimplement trivially |
| Deploy pipeline divergence | LOW | Modern GH Pages workflow is well-documented |

## Unresolved questions (carry into Phase 4)

1. Target stack? (vanilla HTML, 11ty, Astro, Hugo, Next.js static, plain JS)
2. Reuse linkyee's CSS/HTML verbatim (with attribution) or restyle from scratch?
3. Need plugins / dynamic vars at all? (impacts cron + complexity)
4. Single page or extensible (multi-page, blog, etc.)?
5. Custom domain planned? (affects CNAME handling)
6. Analytics? (GA, Plausible, none)
7. Modern Pages deploy (Actions artifact) vs gh-pages branch?
