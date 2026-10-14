# Orbit Birth 3D / 轨道诞生

The owner requested a Three.js 3D remake with close camera approaches and full multilingual support. This supersedes the flat video draft. Both final MP4s were recorded from the actual WebGL scene, then normalized to 1920×1080 / 30fps / exactly 30 seconds / H.264 yuv420p with fast-start metadata. The sound version contains original synthesized audio; the silent version has no audio track. No sampled music or voice is used.

## Story and visual standard

0–6s: approach the planet ring surface and its beveled edge. 6–13s: track the approved orbit silhouette at close range. 13–22s: travel through layered three-dimensional trajectories. 22–27s: pull back and align the brand. 27–30s: hold the exact approved SVG lockup, without changing its paths or letterforms. Materials, lighting and depth belong to the authorized cinematic representation; they do not replace the flat official logo masters. White monochrome uses white material colors and neutral lights, ending with exact #FFFFFF foregrounds.

## Files and offline playback

- `three-intro.js`: extruded annular planet, approved SVG orbit extrusion, physical materials, lighting, star field, 3D trajectories and exact final SVG composite.
- `camera.js`: deterministic 30s closeup/flyby/traversal/pullback camera poses.
- `three-player.js`: playback, seeking, palette/monochrome controls, original audio and native browser recording.
- `locales.json`: complete UI dictionaries for all 22 website languages; no English fallback for the new intro UI. Arabic, Persian and Hebrew use RTL layout. Native-speaker proofreading remains unperformed.
- `masters.js`, `scene.js`, `final-frame.svg`: preserve approved outline geometry for the closing brand frame. The standalone animated SVG is a vector reference; it does not simulate the physical 3D camera.
- `vendor/`: pinned Three.js 0.186.1, required loaders/environment and MIT license. No CDN requests are needed.
- `manifest.json`: media checksums, encoding metadata, full-decode verification and audio levels.

Run `python -m http.server 8765` from the repository or source package root, then open `/08-motion/index.html`. When embedded in the VI manual, the player receives the parent's language and palette. Standalone language and palette controls remain available.

## Export

Choose a palette and color/white mode, then press the localized Export button. Keep the tab visible for the 30-second recording. The export freezes controls, renders the real Three.js camera sequence and includes original sound when the sound checkbox is enabled. MediaRecorder selects MP4 when available, otherwise WebM. Use FFmpeg to normalize browser output to delivery MP4 with 30fps, 30s duration, H.264, AAC and fast-start metadata. Browser record rate depends on device performance; the supplied normalized delivery files each contain 900 frames.

The sound source is `orbit-birth-sound.m4a`, synthesized by `scripts/synth-intro.py`. It starts only after Play-with-sound or sound-enabled Export interaction. The static SVG poster and rendered MP4 offer alternatives where WebGL is unavailable. `npm run build` also creates `spacelibre-motion-source.zip` with the required local runtime and assets.
