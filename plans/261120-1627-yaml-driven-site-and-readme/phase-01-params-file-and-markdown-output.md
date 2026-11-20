# Phase 1: params file and Markdown output

## Files

- Move `hugo.yml` to `config/_default/hugo.yml`, without its `params:` block.
- Create `config/_default/params.yml` from that block, with its keys at the top
  level.
- In the banyan repo, create `layouts/index.markdown.md`, the Markdown template, and release it as `v0.7.0`.
- In the banyan repo, document the Markdown output in `README.md`, then run `hugo mod get github.com/tiennm99/banyan@v0.7.0` here.

## Steps

1. Before changing anything, build once and keep `public/index.html` as the
   baseline, outside the repo (`<workspace>/.tmp/iammiti99-baseline/`).
2. Split the config as listed above. Rebuild and diff `index.html` against the
   baseline; it must be identical.
3. In `config/_default/hugo.yml`, add:

   ```yaml
   disablePathToLower: true
   outputFormats:
     markdown:
       mediaType: text/markdown
       baseName: README
       isPlainText: true
   outputs:
     home: [html, markdown]
   ```

   Check that `disablePathToLower` changes no other output path (the build has
   only the home page, the manifest and the vCard).
4. Write the template. It follows `bio-card.html` and `link-button.html`:
   - `# {{ name }}`, then the tagline and bio, and the avatar as an image with
     an absolute URL (`absURL`).
   - `sections` win over flat `links`, as in `bio-card.html`. A section becomes
     `## title`, its description a paragraph, and each link a list item
     `- [title](url)`, with ` — note` when a note is set.
   - Skip links outside their `startDate`/`endDate` window, with the same test
     as `link-button.html`. Move that test into a shared partial if both
     templates would otherwise repeat it.
   - End with the fixed footer: a link to the live site and to `docs/`.
5. Build with `hugo --gc --minify --baseURL https://tiennm99.github.io/iammiti99/`
   and check `public/README.md`: valid Markdown, absolute URLs, no blank-line
   noise, and `--minify` left it alone.

## Validation

- `index.html` is identical to the baseline after step 2, and differs after
  step 3 only by the added alternate link, if one is added.
- `README.md` matches the page's visible links in step 5.

## Rollback

Revert the phase commit. Nothing outside the repo changes.
