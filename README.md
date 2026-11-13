# Dev Carnival 2027 — Community Poster Generator

A single-purpose web app. A community lead enters:

1. **Community logo** (with 3 × 3 alignment and a size slider),
2. **QR code** (generated from a link, or an uploaded image),
3. **Community name** (names the file; optionally printed below, left or right of the logo),

and downloads a 1254 × 1254 px PNG of the official Dev Carnival "community partner" poster.

Everything runs in the browser. Nothing is uploaded and nothing is stored.

## Run

```sh
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests for the pure helpers
npm run build    # static site in dist/
```

Requires Node.js 18+. `dist/` can be hosted on any static host.

## Project layout

| Path | Purpose |
| --- | --- |
| `src/config/poster.js` | All artwork coordinates (logo area, divider, QR square) and upload limits |
| `src/assets/dev-carnival-template.png` | The official artwork |
| `src/lib/renderPoster.js` | Canvas drawing. Used by both the live preview and the PNG export |
| `src/lib/geometry.js`, `text.js` | Pure helpers (placement/alignment, QR text, file names) |
| `src/lib/images.js`, `qr.js` | Image loading/validation and QR creation |
| `src/components/`, `src/App.jsx` | UI |

## Notes

- Logos with an opaque white background (typical JPGs) are blended so the white disappears into the poster. Transparent PNGs work best.
- To use new artwork, replace the PNG and update the coordinates in `src/config/poster.js`.
