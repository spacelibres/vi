# AGENTS.md — rules for automated contributors

This file is the binding rulebook for any AI agent, bot, or automated tool that
changes this repository. Read it before your first edit and follow it on every
change. The canonical policy is [`docs/versioning.md`](docs/versioning.md); if
this file and that document ever disagree, `docs/versioning.md` wins.

## 1. What to commit

Commit only **substantive changes to the deliverable** — the site, vector
assets, palette engine, the reusable skill, or tooling that ships with them.
When you make such a change, that single commit **is** a release and follows the
full procedure in section 2.

**Do not commit** (leave these local — no commit, no CHANGELOG, no release):

- Purely local changes: environment and OS configuration, installed skills
  (`~/.agents/skills`, `~/.codex/skills`), editor or machine settings.
- Temporary or generated files: scratch scripts, `node_modules/`, `artifacts/`,
  `*.zip`, caches.
- Trivial wording or formatting tweaks that do not change the deliverable.

Batch small edits, or leave them local, rather than opening a release for them.

## 2. Release procedure (for substantive changes)

1. **Bump PATCH by one** using the repository script — never edit versions by hand:

   ```sh
   node scripts/set-version.mjs <MAJOR.MINOR.PATCH>
   ```

   This keeps `package.json`, `VERSION`, `package-lock.json` and the UI labels in
   `index.html` (header, footer and `?v=` cache-busting queries) in sync.

2. **Add a CHANGELOG entry.** Prepend a new `## <version> - <YYYY-MM-DD>` section
   to [`CHANGELOG.md`](CHANGELOG.md), in English, matching the existing bullet
   style. Describe what changed, what was verified, and any material limitation.

3. **Verify before committing:**

   ```sh
   npm ci
   npm test
   npm run check
   ```

   All tests and the validator must pass. Never commit with a red check.

4. **Commit** with a descriptive message that ends with `(v<version>)`.

5. **Tag and release.** Create the matching **annotated** tag `v<version>` on the
   release commit and push it. CI (`Verify and release VI`) re-verifies the tag,
   then publishes the GitHub Release and the download archives automatically.
   The tag must equal `v$(cat VERSION)`.

### Absolute prohibitions

- **NEVER** push a commit to `main` without a patch bump *and* a CHANGELOG entry —
  every pushed commit is a release.
- **NEVER** move, delete, or reuse a published tag.
- **NEVER** force-push a published branch or rewrite published history.
- **NEVER** put tokens, credentials, `.env` files or local secrets into source
  or release archives.
- **NEVER** commit generated artifacts (`artifacts/`, `*.zip`, `node_modules/`).

If the correct version, the changelog wording, or the scope is ambiguous,
**ask the owner before committing** rather than guessing.

## 3. Repository map

- `index.html`, `styles.css`, `app.js`, `svg-sources.js` — the static VI site
  (no Node runtime required; Node is only used for verification/build).
- `01-logos/` … `07-palettes/`, `icons/` (incl. `icons/nebula/`), `05-imagery/` — vector and image assets.
- `scripts/` — `set-version.mjs` (version sync), `validate.mjs` (`npm run check`),
  `build_artifacts.py` (`npm run build`).
- `tests/` — Node test suite (`npm test`).
- `docs/versioning.md` — the canonical version and release policy.
- `deploy/` — deployment tooling for `vi.spacelibre.cn` (see `deploy/README.md`).

## 4. Verification commands

```sh
npm ci            # install pinned dev dependencies
npm test          # run tests/*.test.cjs
npm run check     # validate version sync, SVGs, references, secret exclusion
npm run build     # build release archives (generated, never committed)
```

`npm run check` currently runs `scripts/validate.mjs`, which among other things
fails if the version files disagree, if a referenced asset is missing, or if a
credential-like string appears in source. It also enforces the manual's own
rules on the site itself: the typography scale (主标题 48–80, 分区标题 28–40,
正文 16–20), the 8px spacing rhythm and `--space-*` tokens, the logo minimum
sizes, and token-only colors.
