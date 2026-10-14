# Changelog

## 1.5.14 - 2026-10-14

- Add a light/dark appearance choice (follow system / light / dark) that adapts the whole site, including `color-scheme`, the browser theme color and the recolored SVG logos.
- Separate the page base from the brand deep panels (`--panel`, `--chip`, `--photo-base`), so dark panels and reverse logo assets stay correct in both modes.
- Add the four new UI strings (跟随系统 / 浅色 / 深色 / 外观) to all 21 translations.
- Verify: `npm test` and `npm run check` pass at 1.5.14.

## 1.5.13 - 2026-10-14

- Fix the sticky theme bar jitter: its offset is now measured from the real top bar height (`--topbar-h`) instead of a hard-coded `66px`, so it no longer slides under the frosted top bar while scrolling.
- Drop the redundant `backdrop-filter` on the theme bar; two stacked blurred sticky layers were a scroll-jank source.
- Verify: `npm test` and `npm run check` pass at 1.5.13.

## 1.5.12 - 2026-10-14

- Add client-side internationalization: the site auto-detects the visitor's language (`?lang` → saved choice → `navigator.languages`), ships 22 languages (including RTL Arabic, Hebrew and Persian) and offers a language switcher.
- Bundle the translations into an offline `i18n-data.js`; add `scripts/extract-i18n.mjs`, `scripts/i18n-merge.mjs` and `scripts/build-i18n.mjs`, and route the app's runtime strings through a `t()` helper.
- Enforce i18n in CI: `validate.mjs` checks that every locale fully covers the base catalogue, preserves placeholders and keeps `i18n-data.js` in sync.
- Verify: `npm test` and `npm run check` pass at 1.5.12.

## 1.5.11 - 2026-10-14

- Make the site follow its own manual: snap the layout to the 8px spacing rhythm with `--space-*` tokens, raise h1 into the documented 48–80px display range in Arial Bold, and bring the header/footer wordmarks to the 240px minimum with an icon swap on small screens.
- Replace the remaining ad-hoc colors (photo card background, error text, swatch outline) with palette tokens.
- Enforce the manual in CI: `scripts/validate.mjs` now also checks the typography scale, the 8px spacing rhythm, spacing tokens, logo minimum sizes and token-only colors.
- Verify: `npm test` and `npm run check` pass at 1.5.11.

## 1.5.10 - 2026-10-14

- Refine the version policy: only substantive changes to the deliverable are committed and released; purely local changes (environment, installed skills, temporary and generated files) are left uncommitted.
- Update `AGENTS.md`, `.rules` and `docs/versioning.md` with the "what to commit" / "do not commit" wording.
- Verify the policy docs keep validation green: `npm test` and `npm run check` pass at 1.5.10.

## 1.5.9 - 2026-10-14

- Add a Nebula Spectrum (preset 03) icon set under `icons/nebula`: light and reverse marks, a deep-background app icon, light and reverse wordmarks, plus PNG exports for avatars and favicons.
- Switch the README wordmark to the Nebula Spectrum variant so the identity reads more vividly on GitHub.
- Verify the new vector assets pass validation: `npm test` and `npm run check` pass at 1.5.9.

## 1.5.8 - 2026-10-14

- Add the horizontal wordmark (light and dark variants) and status badges to the top of the README so the identity is visible directly on GitHub.
- Complete the repository presentation on GitHub: description, homepage link and topics.
- Verify README assets resolve and validation stays green: `npm test` and `npm run check` pass at 1.5.8.

## 1.5.7 - 2026-10-14

- Add a binding rulebook for automated contributors (`AGENTS.md` and `.rules`): every change must be a patch release with a CHANGELOG entry and an annotated tag.
- Spell out the mandatory per-change procedure in `docs/versioning.md` and link the rulebook from the README.
- Verify the rulebook keeps validation green: `npm test` and `npm run check` pass at 1.5.7.

## 1.5.6 - 2026-10-14

- Add one-click Caddy deployment tooling for the vi.spacelibre.cn static site: server-side install script, local wrapper, and a reference site block.
- Add a GitHub Webhook receiver that verifies the HMAC signature and triggers an idempotent redeploy on push and release, exposed through Caddy at /hooks/deploy.
- Persist the webhook secret and read it per request so routine redeploys and secret rotation never break GitHub signature verification.
- Verify the deployment end to end: Caddy file_server on 443, HTTP-to-HTTPS redirect, signed and unsigned webhook responses, and an automatic sync from a pushed commit.

## 1.5.5 - 2026-10-14

- Restore black, white and navy monochrome logo variants to one original ink across all theme changes and SVG downloads.
- Explicitly mark all nine monochrome masters and bypass auxiliary recoloring in both website and portable skill renderer.
- Clarify that auxiliary planet colors apply only to full-color variants; include monochrome masters in the installed skill.
- Add regression coverage for all nine monochrome variants under six presets and a custom primary.

## 1.5.4 - 2026-10-14

- Align handoff instructions with theme-aware logo colors and editable text in new application SVGs.
- Align the reusable skill with the manual's 240px horizontal-wordmark guidance.
- Verify website theme, SVG download parity, application search and the tagged GitHub release pipeline.

## 1.5.3 - 2026-10-14

- Package the approved VI as a reusable spacelibre-vi skill with vector masters, portable palette engine and document rules.
- Add GitHub verification and tagged-release automation, version documentation and download artifacts.
- Verify independent skill behavior, token engine parity and the installed global visual default.

## 1.5.2 - 2026-10-14

- Expand application examples from 16 to 40 across interfaces, documents, video, events and physical brand materials.
- Replace opaque decorative cover-up panels with continuous curves and feathered masks.
- Bind decorative gradient stops to the active palette and correct observed title/tagline collisions.
- Verify all 40 renders, gradient recoloring and the 16-role token set.

## 1.5.1 - 2026-10-14

- Bind the canonical planet ring to the auxiliary color with light/dark contrast variants.
- Preserve circle geometry, orbit silhouette and mask channels during recoloring and SVG export.
- Add a regression test for the previously fixed-text-ink planet.

## 1.5.0 - 2026-10-14

- Import the previously verified local VI 1.5 draft as the GitHub baseline.
- Include global theme controls, SVG templates, palette presets and attributed NASA imagery.
- This import records the initial repository state; it does not invent earlier GitHub releases.
