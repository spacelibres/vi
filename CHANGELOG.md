# Changelog

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
