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
| Admin area has its own layout (`AdminLayout`) | the admin works in a back-office tool, not the shop; no navbar, footer or chat |
| DataTables 3 (datatables.net) with server-side processing | the "JavaScript table solution" the team asked for; server-side paging keeps large tables fast |
| Tables are requested with `POST /api/admin/tables/:name` (JSON body) | Express 5's default query parser does not turn `order[0][column]` into objects; a JSON body keeps DataTables' request intact |
| Cities are a collection, market/farmer `city` stores the city name | dropdowns and filters use one list; renaming a city in the admin updates markets, farmers and customers |
| "Write with AI" uses Claude only when `ANTHROPIC_API_KEY` is set | works offline and for free with the built-in writer; the key makes the text richer |
| Admin-created accounts get an invite link instead of a password by e-mail | passwords are never sent in e-mails |
| Customer, farmer and admin areas share one `AppShell` | the team asked for the same sidebar everywhere; one component keeps collapse, drawer and counters identical |
| Every stock change is logged in `stockmovements` | farmers can see where stock went (pre-orders, cancellations, template, stall sales, waste) and the log explains the numbers |
| Reviews with blocked words are saved hidden and queued, not rejected | customers are not told which word triggered it, and an admin can still publish a false positive |
| Buyers' reviews are "Verified purchase", others "Unverified" | the team asked for both; buyers review each completed order, everyone else once per product / stall |
| One login page for every role | the team asked for a single portal; the role decides where the user lands |
| Checkout without an account e-mails a generated password | the team asked for it; the customer is told to change it in Profile |
| Server-side SEO tags on top of a React app | crawlers and link previews read the first HTML; the client hook keeps tags right while browsing |
| Urdu with our own small `t()` (`client/src/i18n`), English text as the key | no i18n library to learn; a missing Urdu text simply shows the English, and the English code reads as before |
| Urdu content stored next to the English (`nameUr`, `descriptionUr`, `bioUr`, `questionUr` …) | admins and farmers write both; the Urdu site falls back to English when a field is empty |
| Right to left by postcss-rtlcss at build time, not a second stylesheet | one set of SCSS; the Urdu layout is always the mirror of the English one |
| Admin area stays English | it is a back-office tool; its forms have Urdu fields for the content the public sees |
| Home banner autoplays even with "reduce motion" and under the mouse | the team saw it standing still: Windows' "animation effects off" turns on reduced motion, and the mouse usually rests on the banner. The pause button, keyboard focus and a hidden tab still stop it; reduced motion only drops the zoom |
| Offers use `compareAtPrice` (the usual price) next to `price` | orders keep storing the price paid; the "Up to N% off" banner is worked out from real offers, so it never promises a discount nobody gives |
| "Generate with AI" for free-text boxes goes through one endpoint (`/api/ai/write`) with a list of kinds | each kind says which role may use it, has a Claude prompt and a built-in writer, so the button works without an API key |
| One reviews carousel instead of two sliding rows | the team found two rows that both stop under the mouse confusing; one large review is easier to read |
| Urdu page choice in a cookie (`ml_lang`) as well as localStorage | the server can send the Urdu page (lang, dir, title) from the first paint and search engines get `?lang=ur` pages |

## Conventions

- Days are numbers 0–6 (0 = Sunday), matching `Date#getDay()`; names come from `DAY_NAMES`.
- Dates for pickups are `YYYY-MM-DD` strings ("date keys"); times are `HH:MM` strings.
- Money is a number in rupees; the symbol comes from `CURRENCY` / `VITE_CURRENCY` (default `Rs`).
- Errors: throw `AppError(message, status)`; the error middleware turns it into `{ message }`.
- Images: every picture is a real photo and fills its frame (`/uploads/photos`, `/uploads/photos/thumbs`,
  `/uploads/places`, `/images/hero`, farmer uploads in `/uploads/products`). There are no illustrations
  or cut-outs any more (removed in round 7).
- No emoji anywhere in the UI or in text the server sends; use Bootstrap Icons. The assistant uses
  `{{icon:name}}` tokens that the chat widget renders.
- Keep the SRS words in the UI: pre-order, pickup, stall, market day, weekly stock.
- Product links use `productPath(p)` (`utils/links.js`) so URLs show the product name.
- DataTables cells are HTML strings built with `utils/cells.js` (everything escaped with `esc`).
  Links use `data-href` and buttons `data-action`; `DataGrid` routes clicks through React Router /
  `onAction(action, row)`. Columns meant for export use `display(fn, plain)` so CSV/Excel get plain text.

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
- **Stacked panels:** `.panel` only stretches to 100 % height when it is alone in its column
  (`:only-child`); stacked panels with `height: 100%` overflowed into the footer on the profile page.
- **`DataTable.use()` and the hooks linter:** the React hooks rule treats any `.use()` call as the
  React `use` hook; assign it to another name first (`const registerLibrary = DataTable.use`).
- **DataTables and React context:** cells are rendered by DataTables, not React, so they cannot use
  `<Link>` or hooks – use `data-href` / `data-action` instead.
- **Gmail SMTP:** needs 2-Step Verification and an App Password; the 16 letters may be pasted with
  spaces (they are removed). Error 535 = wrong login; the server prints a hint at start-up.
- **Testing e-mail without the internet:** a local SMTP server (Python `aiosmtpd`) receives the
  messages; `npm run mail:test -- you@example.com` checks any settings.
- **AI descriptions:** the main word of a product name is usually the last one ("Mango Chutney" is a
  chutney), so the built-in writer picks the keyword found last in the name.

- Bootstrap's `.d-flex` uses `!important`, so DataTables' collapsed-row arrow is positioned in the cell padding
  instead of forcing the first cell's content to `inline-flex`.
- Stock alerts fire once per level: `lowStockAlertedAt` at the alert level, `soldOutAlertedAt` at zero; both are
  cleared when the farmer restocks above the level.
- A CSS grid track grows to the min-content of `text-truncate` children; use a flex column for lists of
  truncating rows on phones.

- FerretDB (used while building) accepts some things real MongoDB rejects; round 5 tests also run against
  MongoDB 8. Databases prepared with an older `marketlink-schema.mongodb.js` rejected the new notification
  type `stock` ("Document failed validation"): `syncValidators()` now updates them at start-up.
- `html { scroll-behavior: smooth }` makes `window.scrollTo` animate, so scripted full-page screenshots must
  scroll with `behavior: 'instant'` or scroll-reveal content stays hidden.
- React Router keeps the previous page's data while the next product loads: compare the loaded product with
  the URL before redirecting to the readable URL (this caused "You may also like" links to jump back).

- Vite 8 bundles with rolldown: a code-splitting group also takes the dependencies of its modules, so
  React ended up inside the charts chunk and every page downloaded charts and DataTables. The groups in
  `vite.config.js` now have priorities (React first) and the home page loads about 1 MB less JavaScript.
- DataTables Responsive reads raw cell data without the column renderer (`dt.cells(null, fn)`), so a
  missing nested value such as `reporter.name` raised "Requested unknown parameter". `DataGrid` gives every
  column `defaultContent: ''` and sends DataTables warnings to the console instead of an alert.
- Announcements have `months`; `inSeason()` (models/Announcement.js) filters them by the current month in
  the platform time zone. A notice created for another season is saved but not sent as a notification.
- Round 7 went back to full product photos (the cut-outs and illustrations were removed). Only
  `storage.googleapis.com` / `open-images-dataset.s3.amazonaws.com` are reachable from the build machine,
  so banner, market and farm photos were picked from Open Images by label and cropped per frame.
- A product card's "Add" opens the quick view (`QuickViewModal`, `focusAdd`) to choose the amount;
  tests use a `quickAdd()` helper (card button, then `.qv-add`).
- FAQs live in the `faqs` collection (admin page `/admin/faqs`); the seed takes them from
  `server/src/content/faqs.js`. The first paragraph of an answer is the short answer used in llms.txt.
- SEO/AEO: `services/seo.js` writes head tags + JSON-LD, and `services/aeo.js` writes the page text for
  crawlers into `<!--prerender-->` inside `#root` (React replaces it) and serves `/llms.txt` and
  `/llms-full.txt`. The CSP forbids inline scripts, so the crawler text is hidden with CSS, not JS.
- The footer has a second form (newsletter), so browser tests select `form:not(.nl-form)` and
  `main input[type=email]` for the login form.
- **Urdu texts** are in `client/src/i18n/ur.js` (English text → Urdu). Wrap every visible string in `t('…')`
  (or `rich()` when it has `<b>` parts); placeholders `{name}` stay the same in both languages. Server messages
  (notifications, errors) stay English in the database and are matched by the templates in
  `client/src/i18n/server.js` (`tServer`), so keep those in step with the server texts. In development,
  `window.__mlMissing` lists texts that have no Urdu yet.
- Urdu writing rules used everywhere: Urdu punctuation (، ۔ ؟ ؛), curly quotes “ ”, Urdu letters (ی ک ہ, never the
  Arabic ي ك ة), numbers stay 0-9, names / e-mails / phone and order numbers stay as written (wrapped in `<bdi>`
  when they sit inside Urdu text). Glossary: basket ٹوکری, pre-order پیشگی آرڈر, pickup وصولی, farmer کسان,
  stall اسٹال, products اشیاء, favourites پسندیدہ, category زمرہ.
- **RTL build:** postcss-rtlcss runs in *combined* mode with `:where(html[dir="rtl"])` /
  `:where(html:not([dir="rtl"]))` prefixes (vite.config.js). *Override* mode was tried first: its extra
  `[dir=rtl]` rules outweighed single-class rules (breadcrumbs and lists got an extra 2 rem) and its "reset to 0"
  broke classes that change one side only (`.form-select-sm` lost the room for its arrow). `:where()` adds no
  weight, so the cascade is the same in both directions. DataTables' CSS is mirrored the same way; Leaflet and
  Recharts stay left to right.
- rtlcss does **not** mirror the `translate` property, 4-value `inset` shorthands or inline `style={{ right: 12 }}`:
  use longhands (`top / bottom / left`), logical properties (`insetInlineEnd`) or a `[dir='rtl']` rule in
  `styles/_urdu.scss` (which is wrapped in `rtl:begin:ignore`).
- Two checks keep the layouts honest: the English layout snapshot (every element's box on every page, compared
  before / after a change) and the mirror check (the same page laid out LTR and RTL must be exact mirror images).
- Urdu fonts: Noto Nastaliq Urdu for headings and reading text, Noto Naskh Arabic for the interface; never
  `letter-spacing` (breaks joined letters), no italics or capitals.
- postcss-rtlcss mirrors `left` / `right`, margins, borders and `transform-origin`, but **not** gradient angles:
  a shade that runs `90deg` needs its own `[dir='rtl']` rule with `270deg` (inside `rtl:begin:ignore`).
- Inline styles are not mirrored either; use logical properties (`insetInlineStart`) or CSS variables that a
  stylesheet rule turns into `left` (the reviews arc does this).
- A swipe row with `scroll-snap-type: x mandatory` snaps its first card to the very edge; give it
  `scroll-padding-inline` equal to its side padding.
- React sets `muted` on `<video>` as a property, not an attribute; call `play()` from code (here when the
  video scrolls into view) instead of relying on the `autoplay` attribute alone.
- Category photos live in `uploads/photos/categories`: the `uploads/categories` folder is for admin uploads and
  is ignored by git.

## Useful commands

```bash
npm run install:all        # root, server and client dependencies
npm run seed               # demo data (deletes existing MarketLink data)
npm run dev                # API on :5000 + React on :5173
npm run build && npm start # production build served by Express on :5000
npm run export-data        # database/sample-data/*.json from the current database
npm run lint               # ESLint for server and client
npm run mail:test -- you@example.com   # send a test e-mail with the SMTP settings
npm run seo-files          # static sitemap.xml, robots.txt, llms.txt and llms-full.txt in client/public
```

Demo logins for every role are in `README.md` (section 4). E-mails are printed in the server
terminal unless `SMTP_HOST` is set (`ethereal` gives a free test inbox).

## Still open

See `docs/task.md` section 6: member names on the About page, real SMTP details, the team's own
project report, ReadMe.doc, the demo video, hosting and the AI-tools acknowledgement.
