# Version and release policy

The source of truth is package.json; VERSION, the UI version and the matching vMAJOR.MINOR.PATCH tag must agree. Every verified improvement within this VI line increments PATCH by one and has a separate descriptive commit and CHANGELOG entry. New major identity/system revisions deliberately change MINOR or MAJOR; never move or reuse a published tag.

Keep commits linear and preserve the repository history. Never force-push published branches. Record what changed, verification performed and material limitations. A tag points to the exact source used for the release archive. Publish the GitHub Release only after checks pass and the matching tag is pushed.

CI runs on pushes and pull requests. Generated archives are release/build artifacts and are not source-controlled. No tokens, environment files or local credentials belong in source or release archives.

## Mandatory per-change procedure

Every change, without exception, follows these steps in a single release commit:

1. `node scripts/set-version.mjs <MAJOR.MINOR.PATCH>` — bump PATCH by one (never hand-edit versions).
2. Prepend a `## <version> - <YYYY-MM-DD>` section to CHANGELOG.md (English, existing style).
3. Verify: `npm ci && npm test && npm run check` must all pass.
4. Commit with a descriptive message ending in `(v<version>)`.
5. Create the matching **annotated** tag `v<version>` on the release commit and push it; CI publishes the Release.

Forbidden: pushing to `main` without a patch bump and CHANGELOG entry; moving, deleting or reusing a published tag; force-pushing a published branch or rewriting published history; committing tokens, credentials, `.env` files or generated artifacts (`artifacts/`, `*.zip`, `node_modules/`). The binding rulebook for automated contributors is [AGENTS.md](../AGENTS.md) and [.rules](../.rules).
