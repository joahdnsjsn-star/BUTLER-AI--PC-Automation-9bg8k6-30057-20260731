# Automated Zip-Replace → GitHub → OnSpace.ai Pipeline

Repo: `shawnjan-cmd/wjjehehe` · Branch scope: `main` only

## What this does

1. You upload a `.zip` to the repo root on `main`.
2. GitHub Actions validates it, tags the current state for rollback, wipes every
   tracked file except `.git`/`.github`, extracts the zip in, commits, and pushes.
3. Because OnSpace AI's GitHub integration watches your **default branch only**
   via webhook, that push is picked up automatically — no separate "activate
   sync" step exists or is needed, as long as the project shows **Connected**
   in OnSpace AI.

## Scope guarantee: main branch only

- Workflow trigger is hard-restricted to `branches: [main]`.
- Job also carries `if: github.ref == 'refs/heads/main'` as a second, independent
  check — a manual run against any other branch will refuse to execute.
- OnSpace AI itself only tracks the default branch and ignores feature branches
  until they're merged, so there's no path for this to touch anything else.

## Guardrails already built into the workflow

| Guard | Why |
|---|---|
| Zip integrity check (`unzip -tq`) before any deletion | A corrupt upload aborts safely instead of wiping the repo and leaving it empty |
| Empty-zip check | Same — refuses to proceed if the archive has 0 entries |
| Rollback tag (`pre-replace-<timestamp>`) pushed before the wipe | Every replace is one `git checkout <tag>` away from being undone |
| `.git` / `.github` excluded from the wipe | The workflow can't delete itself; git history is never touched |
| Auto-flatten single wrapping folder | Handles zips exported either as "files at root" or "one folder containing files" |
| `[skip ci]` in the auto-commit message | GitHub natively skips re-triggering workflows on commits tagged this way — prevents an infinite loop from the bot's own push |
| `contents: write` explicit permission | Fails loudly instead of silently no-op'ing if repo Action permissions are set to read-only |

## Warnings — read before using this for real

- **This repo (`wjjehehe`) is currently public.** Anyone can view full commit
  history, including every prior version. Do not upload a zip here that
  contains anything sensitive — your decoded server source or your
  `decoder_reference.md` decode notes — or it becomes permanently visible in
  git history even if you delete it in a later commit. For your actual Butler
  AI repo, confirm it's set to **Private** before doing this for real.
- **This is destructive by design.** Every file not in the new zip is gone
  from `main` after the run (recoverable only via the rollback tag or git
  history — there's no "undo" button in the GitHub UI).
- **Large files:** GitHub blocks pushes with any single file over 100MB.
  Nothing in your current app package is close to that, but keep it in mind
  if asset sizes grow.
- **Action permissions must stay enabled**: Settings → Actions → General →
  Workflow permissions → Read and write. If this ever gets reset (GitHub does
  this on some account/org changes), the push step fails with a 403 and the
  run shows red in the Actions tab — check there first if a sync stops working.
- **One zip at a time.** If more than one `.zip` exists in the repo when the
  workflow runs, it takes the first match alphabetically. Delete stale zips
  or use the manual `workflow_dispatch` run with an explicit `zip_path`.

## "Deploy everything possible" — what that would add

Getting files into `main` and synced to OnSpace AI is what's built above.
Actual store/hosting deployment (Expo EAS build + submit to App Store/Play,
or a web host like Vercel) is a separate pipeline that needs its own secrets
(`EXPO_TOKEN`, Apple/Google signing credentials, etc.) added to the repo —
I don't have visibility into whether those are already set up on your end.
Say the word and I'll build that stage too once this one's confirmed working.
