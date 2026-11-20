# Phase 2: CI README sync and docs move

## Files

- `.github/workflows/deploy.yml`: copy the built README back to the repo.
- Create `docs/development.md` from the current README body.
- Root `README.md`: replaced by the generated file.

## Steps

1. Move the current README sections (how it works, local development,
   deployment, base URL, other hosts, project layout) into
   `docs/development.md`. Update them for the new layout: the profile lives in
   `config/_default/params.yml`, and the README is generated.
2. In the build job, after the build step:
   - copy `public/README.md` to `README.md`;
   - if `git diff --quiet README.md` fails, commit it as
     `docs(readme): regenerate from profile` with the `github-actions[bot]`
     identity, and push to `main`.
   - Give that job `contents: write`. The other permissions stay as they are.
3. Keep the job safe with concurrent pushes: if the push is rejected because
   `main` moved, skip it and let the next run regenerate the README. Do not
   rebase or force-push.
4. Push, then check that the run is green, that the README commit appears, and
   that a second push with no profile change makes no commit.
5. Open `/README.md` on the live site and confirm it is served.

## Validation

- Acceptance criteria in [plan.md](plan.md), all of them.

## Risks

- A bot commit on `main` means a local clone falls one commit behind after
  each profile change; pull before the next edit.
- If the repo's workflow permissions are read-only, the push fails. Then set
  **Settings → Actions → General → Workflow permissions** to read and write.

## Rollback

Revert the workflow change; the last generated README stays as a normal file.
