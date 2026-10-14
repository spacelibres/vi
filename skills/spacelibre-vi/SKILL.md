---
name: spacelibre-vi
description: Apply the approved spacelibre visual identity to websites, apps, dashboards, documents, slides, charts, print layouts and branded written material. Use for the user's visual design and development work, including reviews of existing interfaces. Preserve explicit user templates or other requested brands; pure backend changes do not need visual alterations.
---

# spacelibre visual standard

Use this skill as the default visual standard for the user's branded deliverables. Read [the visual rules](references/visual-standard.md) before designing. Use the actual SVG masters in `assets/`; do not reconstruct the logo from text or independent circle fragments. The authoritative source is https://github.com/spacelibres/vi. The intended website domain is https://vi.spacelibre.cn; its presence here does not confirm deployment.

## Workflow

1. Inspect the existing deliverable and preserve the user's explicit content, template and approved logo geometry. Determine canvas, reading distance and output format. Apply the standard directly to visual work; explain only the choices relevant to the result.
2. Choose a preset from `assets/palette-tokens.json` or generate the entire palette from the user's selected primary with `assets/theme-engine.js`. The selected primary remains exact. Apply all contextual roles across the full deliverable, including headers, applications, charts, icons, photo overlays and exported SVGs.
3. First distinguish monochrome and full-color assets. Monochrome black, white and navy masters use one original ink for planet, orbit and entire wordmark, and never acquire auxiliary colors when themes change. Preserve `data-color-mode="monochrome"` and bypass palette recoloring for these masters. For full-color assets only, bind the planet to `planetOnLight` / `planetOnDark` and orbit to `primaryOnLight` / `primaryOnDark`. A navy planet that stays fixed while the rest of a custom palette changes is a defect. Keep mask black/white structural values unchanged.
4. Build content-safe continuous orbital compositions. Put decoration behind content. Keep curves and fades continuous; do not conceal joins with opaque rectangles or let art obscure typography. Intentional edge bleed is allowed; arbitrary internal cuts are not.
5. Choose relevant examples from [the 40 application cases](references/application-cases.md). Use SVG for vectors and HTML for readable copy and interactions. Recolor gradient stop roles as well as solid fills/strokes. Resolve colors in downloadable SVGs so they match the preview.
6. Verify actual rendered output at its intended size, responsive sizes and alternate themes. Check text contrast, the planet color, all SVG downloads, smooth transitions and content collisions. In the VI Git repository, follow `docs/versioning.md`: verified milestone, patch bump, changelog, commit and immutable annotated tag.

For documents and slides, apply the same palette, logo, spacing and restrained orbital language to the native editable format. Keep prose clear and readable; do not force graphic treatments into code, emails or plain text when the format cannot carry them. Explicit user instructions and required external templates take precedence.
