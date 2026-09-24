# MarketLink – Project Memory

Decisions, conventions and lessons learned while building MarketLink. Read this before changing
the code so the same problems are not solved twice.

## Key decisions

| Decision | Why |
| --- | --- |
| MERN stack (MongoDB, Express 5, React 19, Node 20+) | allowed by the SRS; one language across the stack |
| E-mail is the login name | the SRS example table has `username`; e-mail is unique and easy to remember |
| JWT in an httpOnly, SameSite cookie (`ml_token`) | no token in localStorage, so injected scripts cannot read it |
| Farmers start as `pending` | the SRS says admins approve farmers before they can list products |
| Stock is reserved when a pre-order is placed and released on cancel / decline | customers never pre-order more than the farmer has |
| Order items store name, price and unit | history stays correct after a farmer changes the price |
| Pickup slots are generated from the farmer's windows | slot length, capacity, cut-off hours and closed dates are all checked again on the server |
| Time zone comes from `TZ` (default Asia/Karachi) | all markets are in one time zone; slot and cut-off maths depend on it |
| No payment gateway, pickup only | SRS constraint (1.5) |
| Rule-based assistant, no external AI service | answers come from live data, works offline and costs nothing; the SRS lists the assistant as optional |
| Assistant memory is a small object returned with every answer | follow-up questions work for guests (memory kept in the browser) and signed-in users (saved in `assistantchats`) |
| Real product photos from Open Images (CC BY 2.0) | Unsplash/Pexels were not reachable from the build machine; Open Images photos come with author and licence data, so every photographer is credited |
| One Express server serves the API and the built React app | simplest deployment (one Render service) |

## Conventions

- Days are numbers 0–6 (0 = Sunday), matching `Date#getDay()`; names come from `DAY_NAMES`.
- Dates for pickups are `YYYY-MM-DD` strings ("date keys"); times are `HH:MM` strings.
- Money is a number in rupees; the symbol comes from `CURRENCY` / `VITE_CURRENCY` (default `Rs`).
- Errors: throw `AppError(message, status)`; the error middleware turns it into `{ message }`.
- Images: `/uploads/seed/*` and `/illustrations/*` are 3D illustrations (float on a tile);
  `/uploads/photos/*` (stock photos) and `/uploads/products/*` (farmer uploads) are photos
  (fill the tile). `utils/images.js → isIllustration()` decides.
- No emoji anywhere in the UI or in text the server sends; use Bootstrap Icons. The assistant uses
  `{{icon:name}}` tokens that the chat widget renders.
- Keep the SRS words in the UI: pre-order, pickup, stall, market day, weekly stock.

## Lessons learned (gotchas)

- **OpenStreetMap tiles "403 Access blocked":** helmet's default `Referrer-Policy: no-referrer`
  makes OSM reject tile requests. The server sends `strict-origin-when-cross-origin`, and the map
  falls back to CARTO tiles after repeated errors.
- **Sticky header + backdrop-filter:** an element with `backdrop-filter` becomes the containing
  block for `position: fixed` children, so the mobile drawer is rendered with a React portal into
  `<body>`.
- **Scroll reveal and screenshots:** cards start hidden until they scroll into view. Automated
  full-page screenshots must scroll the page first (with `behavior: 'instant'`, because the site
  uses smooth scrolling) and use `animations: 'disabled'`.
- **Rate limits in tests:** the login limiter counts only failed attempts
  (`skipSuccessfulRequests`), so test suites that log in many times do not lock themselves out.
- **Flex children in scroll areas:** give children of a scrolling flex column `flex-shrink: 0`,
  otherwise horizontally scrolling rows (chat product cards) get squeezed.
- **Leaflet in flex/grid boxes:** call `invalidateSize()` and re-fit when the container resizes,
  or markers end up off-centre.
- **Laptop widths (992–1199 px):** navbar buttons need `white-space: nowrap`; containers were
  widened so admin tables do not wrap names word by word.
- **FerretDB (used for local testing):** it lacks some aggregation operators such as `$avg`, so
  ratings and reports are calculated in JavaScript; this also works on real MongoDB.
- **React hooks lint rules (eslint-plugin-react-hooks v6):** avoid calling `setState`
  synchronously inside effects; derive state instead (e.g. the drawer stores the path it was
  opened on and closes itself after navigation).
- **Seeding deletes data:** `npm run seed` clears every MarketLink collection first.

## Useful commands

```bash
npm run install:all        # root, server and client dependencies
npm run seed               # demo data (deletes existing MarketLink data)
npm run dev                # API on :5000 + React on :5173
npm run build && npm start # production build served by Express on :5000
npm run export-data        # database/sample-data/*.json from the current database
npm run lint               # ESLint for server and client
```

Demo logins for every role are in `README.md` (section 4). E-mails are printed in the server
terminal unless `SMTP_HOST` is set (`ethereal` gives a free test inbox).

## Still open

See `docs/task.md` section 6: team names on the About page, the team's own project report,
ReadMe.doc, the demo video, hosting and the AI-tools acknowledgement.
