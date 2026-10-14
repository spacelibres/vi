# Version and release policy

The source of truth is package.json; VERSION, the UI version and the matching vMAJOR.MINOR.PATCH tag must agree. Every substantive improvement within this VI line increments PATCH by one and has a separate descriptive commit and CHANGELOG entry. New major identity/system revisions deliberately change MINOR or MAJOR; never move or reuse a published tag.

Keep commits linear and preserve the repository history. Never force-push published branches. Record what changed, verification performed and material limitations. A tag points to the exact source used for the release archive. Publish the GitHub Release only after checks pass and the matching tag is pushed.

CI runs on pushes and pull requests. Generated archives are release/build artifacts and are not source-controlled. No tokens, environment files or local credentials belong in source or release archives.

## What to commit

Commit only **substantive changes to the deliverable**. When you do, that single commit is a release and follows the procedure below. Do not open a commit or release for purely local or trivial work.

## Release procedure (substantive changes)

1. `node scripts/set-version.mjs <MAJOR.MINOR.PATCH>` — bump PATCH by one (never hand-edit versions).
2. Prepend a `## <version> - <YYYY-MM-DD>` section to CHANGELOG.md (English, existing style).
3. Verify: `npm ci && npm test && npm run check` must all pass.
4. Commit with a descriptive message ending in `(v<version>)`.
5. Create the matching **annotated** tag `v<version>` on the release commit and push it; CI publishes the Release.

## Do not commit

Purely local changes (environment and OS configuration, installed skills under `~/.agents/skills` or `~/.codex/skills`, editor settings), temporary or generated files (`node_modules/`, `artifacts/`, `*.zip`, scratch scripts, caches) and trivial non-deliverable tweaks stay local. Batch small edits or leave them local instead of opening a release.

## Forbidden

- Pushing to `main` without a patch bump and CHANGELOG entry — every pushed commit is a release.
- Moving, deleting or reusing a published tag.
- Force-pushing a published branch or rewriting published history.
- Committing tokens, credentials, `.env` files or generated artifacts (`artifacts/`, `*.zip`, `node_modules/`).

The binding rulebook for automated contributors is [AGENTS.md](../AGENTS.md) and [.rules](../.rules).
