# Community Hub — Poster Studio

A static React application with one page and three poster modules: community collaboration, speaker/attendee, and community leads.

## Run locally

Requires Node.js 18 or newer.

```sh
npm install
npm run dev
```

Run `npm run build` to generate a static production bundle in `dist/`. Deploy `dist/` to a static host configured to serve `index.html` for the application route.

## Workflow

1. Select a community.
2. Enter its name and upload its logo. The three previews update as the fields change.
3. Optionally enable **Admin templates** to upload artwork for each module, position the name/logo overlay with X/Y controls, set its size, and save that design as the locked background for that community.
4. Download any module as a full-resolution PNG.

Template artwork is stored in this browser's IndexedDB. Older LocalStorage configurations are migrated when possible. All images are processed locally; there is no server or shared login, so community data is not shared across browsers or devices. The app allows images up to 12 MB.

Uploaded artwork remains the unmodified background. Only the community logo and name are drawn on top, side by side, at the selected normalized X/Y position. Other poster content must already be part of the uploaded image.

## Privacy

This static app does not provide authenticated admin roles. The admin-template switch exposes local template controls but is not an access-control mechanism. Do not store sensitive content in a shared browser profile.
