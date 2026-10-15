# Planet and Satellite Intro Implementation Plan

> Use executing-plans to implement the approved 2026-10-15 storyboard as one substantive release.

**Goal:** Express the logo as a real planet with an orbiting satellite before resolving to the immutable approved SVG.

**Architecture:** A solid, textured Three.js globe with atmosphere and directional sunlight replaces the extruded annulus. A single tilted orbital path and a satellite share a deterministic trajectory. A camera timeline stays outside the globe and pulls back continuously; a composited, registered SVG outline supplies the closing identity.

**Tech Stack:** Vendored Three.js 0.186.1, native canvas capture, NASA Blue Marble surface texture, existing 22-locale player, FFmpeg H.264/AAC.

## Constraints

- 30 seconds, 1920×1080, 30fps, original sound and silent delivery masters.
- Keep the official SVG paths and complete wordmark unchanged.
- Natural Earth color in the physical scene; final full-color logo uses VI roles. White mode uses an achromatic physical scene and exact white final mark.
- One planet and one main orbit, with real depth occlusion. No hollow mechanical ring or orbit tunnel.
- Do not enter the globe with the camera. Inspect representative frames before recording.
- Keep all 22 locales and palette interaction; update descriptions that describe the rejected sequence.

## Tasks

- [x] Write failing camera/trajectory tests: solid radius, exterior camera, closed orbit, front/back traversal, continuity, stable final hold.
- [x] Acquire and credit NASA texture; build globe, atmosphere, satellite and orbit. Implement camera and smooth registered SVG closing.
- [x] Review actual browser frames at 3, 10, 17, 23 and 29 seconds; check white mode and a custom palette.
- [x] Capture the complete Three.js scene, normalize and fully decode both 900-frame masters; update hashes and documentation.
- [x] Run npm ci/test/check/build, bump PATCH once, update release notes, sync local output, commit/tag/push and verify CI/release/online delivery.
