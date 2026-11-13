# Community Hub — Poster Studio

A static React application for creating approved community posters with local, browser-only community and template configuration.

## Features

- Community directory, individual community dashboards, and three poster categories.
- Community-specific, locked template backgrounds with category-specific editable fields.
- Optional additional approved template designs for each category, selectable in the shared editor.
- Canvas-based live previews and original-dimension PNG downloads.
- Browser-local template and community management, including JSON configuration import/export.
- Local poster download history that stores file details only (not uploaded attendee photographs).
- Image validation, crop/zoom/position controls, responsive layouts, and mobile navigation.

## Run locally

Requires Node.js 18 or newer.

```sh
npm install
npm run dev
```

Create a static production bundle with `npm run build`. The generated site is in `dist/` and can be deployed to any static hosting provider. Configure the provider to fall back to `index.html` for client-side routes.

## Local configuration behavior

Community profiles, logos, and template artwork are stored in this browser's LocalStorage. They are not shared with other users or devices. Use **Local template management → Export JSON** to transfer settings. Importing a configuration replaces the communities stored in the current browser.

The sample configurations are starter templates, not externally supplied official artwork. Replace them with each community's approved assets before using them for official communications.

Uploaded poster photos are kept in editor memory only and are not added to browser history. The application does not send photographs to an external service. Clear browser storage or use **Reset local data** to remove locally configured communities and history.

## Editing permissions

- Collaboration: collaborating community name and logo.
- Attendee: photograph, with name entry only when enabled in its template configuration.
- Leads & working committee: photograph, community name, and description.

Template backgrounds and non-editable elements are drawn as an immutable image layer. Maintainers can add multiple approved designs per category, name and remove variants, and configure each design's overlays independently. Placeholder coordinates are normalized to the template dimensions. The same editor and permission rules apply to every community and design.

## Future backend integration

The community context and storage helpers isolate local persistence from the UI. A future API-backed provider can replace the LocalStorage implementation without changing the poster rendering workflow.
