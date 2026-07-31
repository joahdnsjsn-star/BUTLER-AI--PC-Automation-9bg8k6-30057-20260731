# OnSpace.ai Main-Only Zip Replace Spec

## Important warning

`wjjehehe` is currently public. Do not upload any zip that contains decoded server code, `decoder_reference.md`, or other sensitive material until the real project repository is private, because anything pushed to a public repository is exposed in Git history.

## Confirmed OnSpace.ai behavior

- OnSpace.ai only syncs the repository default branch.
- If the default branch is `main`, that is already the branch OnSpace.ai watches.
- No extra activation step is required after connection. Once the OnSpace project shows **Connected**, every push to `main` is picked up automatically by webhook.

## Guarded workflow file

- Path: `.github/workflows/unzip-replace.yml`
- Purpose: replace repository contents from one uploaded zip while preserving the guarded workflow and this spec file.

## Workflow rules

1. The workflow only runs on:
   - pushes to `main` that include a `.zip` file change
   - manual `workflow_dispatch`
2. The job is hard-locked to `main` and exits if the ref is anything else.
3. Exactly one zip is allowed per run.
4. The zip is validated with `unzip -t` and extracted to a temporary directory before any destructive action.
5. If the extracted upload is empty or corrupt, the workflow stops before touching repository contents.
6. A rollback tag is created and pushed before the repository is wiped.
7. The repository is then replaced with the validated extracted content.
8. The guarded workflow file and this spec file are restored after the replace step.
9. The replacement commit is pushed back to `main`.
10. OnSpace.ai syncs automatically after that push if the project is still **Connected**.

## Operational notes

- Use one zip upload per run.
- The rollback tag format is `rollback-before-zip-replace-YYYYMMDD-HHMMSS`.
- A zip that unwraps into a single top-level folder is supported; that folder becomes the import root.
- There is no separate OnSpace.ai “sync activation” step beyond having the repo connected and pushing to `main`.
