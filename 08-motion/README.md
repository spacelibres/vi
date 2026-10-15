# Orbit Birth — Planet & Satellite

The approved metaphor is a planet and a satellite orbit. The physical scene is a solid Earth with a surface, atmosphere and day/night shading. The cinematic scene is not an extruded version of the logo's circular stroke.

## Sequence

- 0–7s: near-horizon approach, gradually pulling back from the globe.
- 7–14s: reveal the planet and one tilted blue orbital path; a modeled satellite moves along that same closed path, with depth-buffer occlusion behind Earth.
- 14–21s: approach the satellite in the foreground, with Earth filling the background, then pull away.
- 21–27s: settle into the final composition, dissolve surface detail toward an auxiliary-color circular outline, and resolve to the original SVG geometry and wordmark.
- 27–30s: hold the complete approved SVG lockup.

The planet is opaque during the physical sequence. Only the explicit closing transition removes its interior. The satellite scale and orbital timing are artistic, not a scientific simulation.

## Runtime and color

`planet-scene.js` builds the solid globe, atmospheric shell, satellite and single tilted orbit. `camera.js` defines the orbit and camera poses, including clearance from the surface and the satellite close approach. `three-intro.js` renders WebGL and composites the exact approved closing SVG. `three-player.js` handles the theme handshake, audio, timeline and guarded browser export; its interface strings come from the site-wide `i18n/` framework rather than a private catalogue.

The vendored Three.js 0.186.1 runtime and NASA surface texture work without CDN access. Run `python -m http.server 8765` from the repository/package root and open `/08-motion/index.html`. The player shares the site's language and palette: it loads `i18n-data.js` and `i18n.js`, has no language switcher of its own, and follows the manual's choice (the parent sets `?lang=` on the frame). Opened on its own it auto-detects the browser language exactly like the rest of the site. Native-speaker proofreading has not been performed.

Natural Earth color is preserved in full-color mode. The orbit, interface and final identity follow selected VI roles. The final full-color planet uses the auxiliary role; white mode produces an achromatic physical scene and an exact #FFFFFF planet, orbit and complete wordmark in the closing SVG. The final brand geometry is never reconstructed or distorted.

NASA Blue Marble source and credits are in `textures/credits.json`, with a visible credit link in the player. The surface includes clouds; no NASA endorsement is implied.

## Delivery and verification

Both MP4s are 30s, 1920×1080, 30fps, 900 frames, H.264/yuv420p, fast-start MP4. The sound version includes original synthesized stereo audio; the silent version has no audio track. `manifest.json` records full-decode checks, hashes and measured audio levels, plus hashes of the exact camera, scene and texture used for the recording.

Choose a palette, color/white mode and optional sound, then export. Keep the tab visible for the 30-second browser capture. Sound is captured only when enabled. Browser recording selects MP4 where supported and otherwise WebM; device frame timing may vary. Supplied delivery masters are normalized to 30fps. The near arc follows the approved lower-left to upper-right logo direction and is rendered after the planet depth pass, so Earth cannot incorrectly cover it. Camera movement stays near this logo-facing orientation.

Use FFmpeg to reset timestamps, normalize fps, pad only the final hold when needed, trim to 30 seconds and encode H.264/AAC. `python scripts/verify-motion.py --ffmpeg <ffmpeg-path>` rechecks both masters without changing their provenance. After an actual new capture and normalization, use --record-new-master <raw-capture-file> to explicitly generate new provenance.

`masters.js`, `scene.js` and `final-frame.svg` preserve approved SVG geometry for the ending. The standalone animated SVG and `scripts/render-intro.cjs` remain a flat vector reference, not the planet film. `npm run build` creates the complete `spacelibre-motion-source.zip`. Temporary browser captures and review frames do not ship.
