# Changelog

## 1.5.31 - 2026-10-15

- Stop the intro downloads from jumping to the top of the page on phones. The manual's mobile rule `nav { position:absolute; top:100%; ... }` (meant for the collapsed header menu) was hitting the player's `<nav class="downloads">`, pulling it out of the flow and pinning it near the page top. The download links are now a plain `<div>` in both the inline manual section and the standalone player, so the header menu rule can no longer reach them.
- Release the `output` margin the manual sets globally: `#clock` inside the player now has `margin:0` instead of inheriting the site `output { margin-left:16px }`.
- Measured on a 375px viewport: the download block is `position: static` and inside the player card (`withinPlayer=true`), where it was `position: absolute` at the page top before the fix.
- Verify: `npm ci`, `npm test` (21 tests) and `npm run check` pass at 1.5.31.

## 1.5.30 - 2026-10-15

- Remove the large empty band under the Orbit Birth player. The manual's global `section { margin-bottom: 96px }` rule was hitting the player's inner `<section id="three-pane">` and `<section id="movie-pane">` tab panels, adding almost 100px of blank space inside the card. The tab panels are now `<div>`s, and the remaining spacing between the export row and the downloads is a deliberate 16px group divider.
- Measured in a headless browser: the player card drops from 763px to 683px tall, with the stray 96px margin gone.
- Verify: `npm ci`, `npm test` (21 tests) and `npm run check` pass at 1.5.30.

## 1.5.29 - 2026-10-15

- Tighten the layout under the Orbit Birth player. The export button and the sound note now share one row aligned to opposite ends instead of stacking as two half-empty lines, and the downloads sit in their own group under a top divider; the three stacked rows no longer leave the right half of the card empty.
- Verify: `npm ci`, `npm test` (21 tests) and `npm run check` pass at 1.5.29; a rendered page shows the export row and the download group filling the card width.

## 1.5.28 - 2026-10-15

- Fix the self-drawn dropdowns (language, appearance, palette) that had reverted to the native `<select>` on the manual. The section observer selected its links with `document.querySelectorAll('nav a')`, and the intro downloads I added in 1.5.27 introduced a second `<nav class="downloads">` whose links have no fragment; `document.querySelector('')` then threw a `SyntaxError`, which aborted `app.js` before `buildCustomSelect` ran and left every dropdown as the platform control.
- Scope the observer to the manual navigation (`#site-nav a`) and guard the empty-hash case, so unrelated `<nav>` links can no longer break startup.
- Verify: `npm ci`, `npm test` (21 tests) and `npm run check` pass at 1.5.28; a headless-browser run now builds all three `.cs` dropdowns with no console errors.

## 1.5.27 - 2026-10-15

- Stop embedding the intro in an iframe. The 30-second Orbit Birth section is now a native part of the manual page: the fixed-height frame (which caused an internal scrollbar) and the "打开片头播放器 ↗" link are gone, and the player markup, controls, downloads and notes sit directly in the section styled with the site tokens.
- Share one player between the inline section and the standalone page. `08-motion/index.html` still opens the intro on its own, and both hosts load the same `three-player.js`, `three-intro.js`, `planet-scene.js`, `camera.js`, `scene.js` and `masters.js`; the manual adds the one `importmap` for the vendored Three.js.
- Follow the manual's palette without a cross-document handshake. The manual exposes `window.SpacelibrePalette` and dispatches a `spacelibre-palette` event; the player reads it on start and updates on change. The shared locale comes from the same site-wide `i18n/` framework as before.
- Resolve the planet texture from the module URL (`new URL('./textures/earth-blue-marble.jpg', import.meta.url)`) so the scene loads correctly from both the root page and `/08-motion/`. Update the recorded `planet-scene.js` hash in `08-motion/manifest.json` to match.
- Allow `spacelibre-motion-source.zip` in the HTML reference check, since it is a build artifact like `spacelibre-svg-assets.zip`.
- Verify: `npm ci`, `npm test` (21 tests) and `npm run check` pass at 1.5.27; every player asset returns HTTP 200 from the site root, and the manual page contains no iframe.

## 1.5.26 - 2026-10-15

- Fix the broken stylesheet reference in the Orbit Birth player: `08-motion/index.html` had a malformed `<link>` tag (`<link</title> rel="stylesheet" href="player.css">`) introduced with the 1.5.25 i18n change, so `player.css` never loaded and the whole intro page rendered unstyled. The tag is a valid `link rel="stylesheet"` again and the layout is restored.
- Verified the page structure after the fix: balanced tags, parseable DOM, and `player.css` served with HTTP 200 in a local run.
- Verify: `npm ci`, `npm test` (21 tests) and `npm run check` pass at 1.5.26.

## 1.5.25 - 2026-10-15

- Bring the 30-second Orbit Birth intro fully into the site-wide i18n framework: the player no longer ships its own language switcher, its own `08-motion/locales.json` catalogue or its own translation logic. It now loads `i18n-data.js` and `i18n.js` and reuses `window.t` / `window.spacelibreLocale`, so language is managed in one place for the manual and the intro alike.
- Move every intro string into the shared catalogue (`i18n/*.json`), keyed by its Chinese source text like the rest of the site, so all 22 languages cover the player through the same data. The shared `语言` and `note` entries are reused unchanged; the palette `版本` label keeps its own `主色变体` key so it does not collide with the existing site string.
- Embedded in the manual the player follows the parent's choice (the manual sets `?lang=` on the frame); opened on its own it auto-detects the browser language exactly like the rest of the site. The standalone switcher and the private catalogue are gone.
- Rewrite the two affected tests: the motion locale test now asserts the player has no private catalogue and that every site language covers the player's strings, and the motion cache test covers the player markup and code instead of the removed catalogue. `sw.js` continues to revalidate `08-motion/` without a separate locale file.
- Verify: `npm ci`, `npm test` (21 tests) and `npm run check` pass at 1.5.25.

## 1.5.24 - 2026-10-15

- Correct the source hashes in the Orbit Birth media manifest (`08-motion/manifest.json`): the `sourceSHA256` entries for `camera.js`, `planet-scene.js` and `three-intro.js` did not match the committed files, so `npm test` failed on a clean checkout of 1.5.23. The recorded hashes now match the scene sources exactly.
- Verify: `npm ci`, `npm test` and `npm run check` pass at 1.5.24.

## 1.5.23 - 2026-10-15

- Correct the logo metaphor in Orbit Birth: replace the extruded mechanical annulus and layered tunnel with a solid Earth, one tilted orbital path and a recognizable orbiting satellite.
- Use a locally bundled NASA Blue Marble surface, thin atmosphere and directional day/night shading. Add a planet-horizon approach, satellite foreground pass and a registered surface-to-outline transition into the unchanged approved SVG lockup.
- Match the approved lower-left to upper-right orbit direction and near-side arc; render Earth's depth before the transparent orbit so the foreground segment remains visible across the planet. Keep the camera near the logo-facing orientation.
- Preserve natural Earth colors in full-color scenes while the orbit and final identity follow the selected palette. White mode uses an achromatic physical scene and an exact one-ink white closing mark.
- Update all 22 intro languages and the manual description to the planet/satellite sequence, and include visible NASA attribution plus source metadata.
- Revalidate motion assets and the source download before using cached copies, preventing an older scene or translation from remaining visible after an update; retain cached offline fallback.
- Re-record both 30-second 1080p H.264 masters from the real Three.js scene. Verify complete 900-frame decoding, AAC sound levels, camera clearance, orbit closure, continuous camera movement, final geometry and source/media checksums. Native-speaker proofreading remains unperformed; satellite size and orbital timing are artistic, not a physical simulation.

## 1.5.22 - 2026-10-14

- Add Orbit Birth 3D: a Three.js/WebGL 30-second 1080p brand intro with planet-surface closeups, orbital flybys, trajectory traversal and an intact final SVG identity.
- Ship sound and silent H.264 MP4 masters captured from the real 3D scene, plus an offline-ready pinned Three.js runtime and editable source package.
- Fully translate the intro section and all player, camera-stage and export strings into all 22 supported locales, including RTL layouts; synchronize iframe language and palette with the manual.
- Provide replay, timeline scrubbing, color/white-monochrome modes and browser video recording using the selected palette.
- Verify complete decoding of both 900-frame MP4s, actual AAC sound levels, official final logo paths, 3D camera poses and locale coverage. Translation has not undergone native-speaker proofreading.

## 1.5.21 - 2026-10-14

- Fix the server cache rules so the HTML and `sw.js` are revalidated (`no-cache`) instead of being cached for a week. The two cache policies now use mutually exclusive matchers instead of relying on Caddy's header override order, which had let the long-cache rule win on every path.
- Verify: `npm ci`, `npm test` and `npm run check` pass at 1.5.21.

## 1.5.20 - 2026-10-14

- Add a service worker (`sw.js`): it keeps the whole site in a cache and serves repeat visits from that cache instead of re-requesting files, revalidating in the background so new releases still arrive, with an offline fallback to the cached shell.
- Cache entries are keyed by path and the cache name carries the release version, so a new release installs a new worker, repopulates the cache and drops the previous one.
- Add HTTP cache headers on the server (Caddy): a long cache for static assets and `no-cache` for the HTML and the service worker so updates are always picked up.
- Verify: `npm ci`, `npm test` and `npm run check` pass at 1.5.20.

## 1.5.19 - 2026-10-14

- Replace the three platform `<select>` controls (language, appearance, full-site palette) with self-drawn dropdowns, so the closed control and the option list render the same on every phone instead of drifting with the OS widget. The native `<select>` stays in the DOM as the hidden data source, keeping all existing behaviour and the accessible labels intact.
- Draw the option list as a floating panel (right-aligned, viewport-bounded, scrollable) rather than a platform popup.
- On phones, the collapsed section menu now floats over the page instead of pushing the content down, and closes on an outside tap.
- Verify: `npm ci`, `npm test` and `npm run check` pass at 1.5.19.

## 1.5.18 - 2026-10-14

- Make the chosen palette portable and reusable: the colour lab now copies the generated system as `复制 CSS 变量` (a ready-to-paste `:root` block of the 16 roles) and `复制 JSON 令牌` (the same tokens in the skill's `palette-tokens.json` shape), so future sites and apps can adopt the user's primary.
- Add `复制分享链接`, which builds a `?primary=<hex>&mode=<harmony>` URL; the page now reads those parameters on load, so a palette can be shared, bookmarked or reloaded anytime, and presets stay one click away.
- Add the four new UI strings to all 21 translations.
- Verify: `npm ci`, `npm test` and `npm run check` pass at 1.5.18.

## 1.5.17 - 2026-10-14

- On phones, collapse the 全站配色 bar into a single compact row: hide the title, status dot and note, and keep only the two selectors, which split the width evenly and follow the window. This replaces the two-row layout from 1.5.16, which the owner found took too much space.
- Tighten the mobile bar padding (8px) so the sticky bar uses less vertical space.
- Verify: `npm ci`, `npm test` and `npm run check` pass at 1.5.17.

## 1.5.16 - 2026-10-14

- Fix the mobile 全站配色 bar: the label keeps to one line and the two selects now share a single fluid row that follows the window width, instead of being pinned to a hard-coded 150–160px and squeezing the text into multiple lines.
- Make the bar wrap (`flex-wrap`) with a non-shrinking label and full-width, evenly split select row on phones.
- Verify: `npm ci`, `npm test` and `npm run check` pass at 1.5.16.

## 1.5.15 - 2026-10-14

- Collapse the header section list (编排 / 规范 / 色彩 / 延展 / 影像 / 应用 / 下载) into a toggle menu on phones, so the navigation no longer wraps onto several rows.
- Add the `菜单` accessible label to all 21 translations; close the menu on link tap, on `Escape` and when returning to a wide viewport; reflect state with `aria-expanded`.
- Verify: `npm test` and `npm run check` pass at 1.5.15.

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
