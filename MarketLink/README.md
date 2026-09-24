# MarketLink — eGreen Basket

**MarketLink** connects local farmers-market stalls with customers. Farmers publish their weekly
stock, prices and pickup windows; customers find nearby markets on a map, browse and filter
products, pre-order for a pickup slot, and pay the farmer in person at pickup. Administrators
approve farmers, manage markets and categories, moderate content and generate reports.

Built by **Team Omniverse** (Aptech Learning Centre, F.B. Area, Karachi) for
**TechWiz 2026 — End-to-End Web Solutions** with the **MERN** stack.

| Layer | Technology |
| --- | --- |
| Frontend | React 19 (Vite), React Router, Bootstrap 5 (custom SCSS theme), Bootstrap Icons, Recharts, DataTables 3 (datatables.net, Bootstrap 5 styling, Responsive + Buttons) |
| Maps | OpenStreetMap tiles (automatic CARTO fallback) with Leaflet / React-Leaflet, OSRM driving routes, Google Maps links & embed |
| Backend | Node.js 20+, Express 5 REST API, JWT auth in an httpOnly cookie, Multer uploads, Nodemailer |
| Database | MongoDB (Mongoose ODM) — local MongoDB or MongoDB Atlas |

---

## 1. Features (mapped to the SRS)

**Customer**
- Register (name, contact number, e-mail, address, **Terms & Conditions** checkbox) and log in to a personal dashboard
- **Profile photo** upload, profile details, password and family sharing on one page
- **Forgot password**: a one-time reset link (valid 30 minutes) is e-mailed to customers and farmers
- Browse markets by location (“near me”), city (from the cities table), produce category and day; see the farmers at each market
- Farmers directory with location (city), market, category and day filters, plus a map view of all stalls
- Farmer profiles: stall name, location, operating days, pickup windows, current weekly stock, reviews
- Map of markets and farmer stalls (Leaflet + OpenStreetMap) with markers, in-app driving route and Google Maps / OSM directions
- Shop with search and filters: location (city), category, market, market day, price range, rating, farming practice, in stock; sorting
- Readable product URLs: `/products/sindhri-mangoes`
- Product details: price, unit, quantity available, farmer, reviews
- Cart grouped by farmer → choose a pickup **date and time slot** inside the farmer’s windows → place pre-order (no online payment)
- Order status: placed → accepted → ready for pickup → completed (or declined / cancelled)
- View, **modify** (items + slot) and **cancel** orders before the farmer’s cut-off time; order history and **reorder**
- Favourite farmers and products (with **restock alerts**) and saved markets
- Reviews and ratings for farmers and products after a completed order
- In-app notifications + e-mail for order confirmation and “ready for pickup”, including route-friendly pickup details (market, address, time slot and a Google Maps directions link)
- Optional **family sharing**: linked household members can see each other’s pre-orders
- **AI assistant** “Basket” (chat widget) answering market timings, farmer availability, pickup windows and product questions from live data,
  with **memory** (follow-up questions such as “which farmers are there?”, your name and city), saved chat history and a **Clear chat** button

**Farmer**
- Register with a 3-step wizard — ① stall name, contact person, contact number, e-mail, password;
  ② farm address, city, “about your farm”, what they grow/sell (categories) and farming practices;
  ③ markets they sell at, optional map pin, summary and acceptance of the Terms & Conditions —
  needs admin approval before listing; until then only the approval status, stall profile and
  notifications are shown (stock, pre-orders and pickup settings stay locked)
- Stall profile: bio, categories grown/sold, farming practices, logo and cover photo, markets, operating days, pickup windows, **map pin (lat/lng)**
- Products: add / edit / delete with name, category, price, unit, quantity, description, image;
  **“Write with AI”** writes the description from the product name (Claude with an API key, a built-in writer otherwise)
- **Recurring weekly stock template** (manual “apply now” or automatic every week) — reserved pre-orders are respected
- Mark items sold out or temporarily unavailable
- Pre-orders: accept / decline (with reason) / mark ready / complete; set slot length, slot capacity and order cut-off hours
- **Closed dates** (“not at the market this week”): customers cannot book pickups on those days and the farmer is warned about existing pre-orders on them
- Insights: total orders, pending orders, revenue summary (7 / 30 days / all time), best-selling products, charts
- Read and reply to customer reviews

**Admin** (separate login at `/admin/login`, own back-office layout without the shop navbar)
- Collapsible sidebar (Reports as the last item), compact dashboard: KPIs, orders/revenue chart, “needs attention”, recent orders, top farmers
- **DataTables** on every admin table (server-side paging, search, sorting, CSV / Excel / Print) with filters
  (status, city, market, farmer, category, date ranges, amounts …)
- Approve / suspend farmers; activate / deactivate customers; **create farmer and customer accounts** (invite e-mail)
- **Place an order for a customer** from a dialog (same stock and pickup-slot checks as the checkout)
- **Customer history**: everything a customer bought, from which farmer, how much, orders per month
- **Customer purchases** analytics: who buys what from which farmer — charts, heat map, exportable tables
- Add / edit / remove markets (city dropdown, what is sold there, days, timings, map coordinates, map link, image)
- **Cities table** used by every city dropdown
- Moderate product listings and reviews
- Reports: platform overview, orders summary, revenue by market, most active farmers (saved, printable, CSV export)
- Master data: product categories; publish announcements (site banner + in-app notification)
- Contact-us inbox

**Other:** role-based access control (API + UI), responsive / mobile-friendly UI (laptop layout, slide-in mobile menu,
app-style bottom navigation bar on phones), Bootstrap icons instead of emoji, About Us and Contact Us
(static team contact — Aptech Learning Centre, F.B. Area, Karachi — + Google Maps location + contact form).
Subtle motion: floating produce on the login / sign-up banner (with mouse parallax), scroll-reveal cards,
counting-up statistics; all animations switch off when the device asks for reduced motion.

---

## 2. Project structure

```
MarketLink/
├── client/                 React front-end (Vite)
│   ├── public/             favicon and 3D produce illustrations
│   └── src/
│       ├── api/            fetch wrapper for the REST API
│       ├── components/     layout, cards, maps, charts, chat widget, order widgets
│       ├── context/        Auth, Cart and Toast providers
│       ├── pages/          public, auth, customer, farmer and admin pages
│       ├── styles/         Bootstrap SCSS theme + custom styles
│       └── utils/          formatting helpers
├── server/                 Express REST API
│   ├── src/
│   │   ├── config/         environment + MongoDB connection
│   │   ├── models/         Mongoose schemas (User, Farmer, Market, Product, Order, Review, …)
│   │   ├── controllers/    request handlers per area (auth, public, customer, farmer, admin)
│   │   ├── services/       pickup slots, stock reservation, notifications, e-mail, reports, assistant
│   │   ├── middleware/     auth / roles, uploads, error handling
│   │   ├── routes/         all /api routes
│   │   └── seed/           demo data, seed and export scripts
│   └── uploads/            images: seed illustrations (uploads/seed), product photos + credits (uploads/photos), farmer uploads
├── database/
│   ├── marketlink-schema.mongodb.js   collections, JSON-schema validators and indexes (mongosh)
│   └── sample-data/                   exported demo / test data (JSON, one file per collection)
├── docs/                   architecture.md, view.md, design.md, task.md, memories.md
└── package.json            helper scripts for the whole project

(render.yaml, the Render.com deployment blueprint, is in the repository root next to this folder.)
```

---

## 3. Installation

### Prerequisites
- **Node.js 20 or newer** (includes npm) — https://nodejs.org
- **MongoDB** — either
  - MongoDB Community Server running locally (`mongodb://127.0.0.1:27017`, MongoDB Compass is handy), or
  - a free **MongoDB Atlas** cluster (copy its connection string)

### Steps

```bash
# 0. open a terminal inside the MarketLink folder
cd MarketLink

# 1. install all dependencies (root, server and client)
npm run install:all

# 2. create the server configuration
#    Windows:  copy server\.env.example server\.env
#    Mac/Linux: cp server/.env.example server/.env
#    then edit MONGO_URI (and JWT_SECRET) in server/.env

# 3. (optional) create collections, validators and indexes
mongosh "mongodb://127.0.0.1:27017" database/marketlink-schema.mongodb.js

# 4. insert the demo data (deletes existing MarketLink data!)
npm run seed

# 5. start API (port 5000) + React dev server (port 5173)
npm run dev
```

Open **http://localhost:5173**.

**Code quality:** `npm run lint` runs ESLint on the server and the client.

**Production build** (one server on port 5000 serves both the API and the React app):

```bash
npm run build
npm start          # then open http://localhost:5000
```

### Configuration (`server/.env`)

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | secret used to sign login tokens — use a long random value |
| `PORT` | API port (default 5000) |
| `CLIENT_URL` | React dev URL allowed by CORS (default `http://localhost:5173`) |
| `CURRENCY` | currency symbol used in e-mails / assistant (default `Rs`) |
| `TZ` | time zone of the markets, used for pickup slots and cut-off times (default `Asia/Karachi`) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `APP_URL` | e-mail settings (Nodemailer). Empty `SMTP_HOST` → e-mails are printed to the server console; `SMTP_HOST=ethereal` → free Ethereal test inbox; `smtp.gmail.com` + port 587 + a Gmail **app password** → real e-mails (see section 6). `APP_URL` is used for the buttons in e-mails |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | optional: “Write with AI” product descriptions by Claude (without a key a built-in writer is used) |

The front-end currency symbol can be changed with `VITE_CURRENCY` in `client/.env` (default `Rs`).

---

## 4. Demo user credentials

Created by `npm run seed`:

| Role | E-mail | Password | Login page |
| --- | --- | --- | --- |
| Administrator | admin@marketlink.com | Admin@123 | `/admin/login` |
| Farmer (approved) — Malir Green Fields | farmer@marketlink.com | Farmer@123 | `/login` |
| Farmer (pending approval) — Sunny Acres Poultry | pending.farmer@marketlink.com | Farmer@123 | `/login` |
| Farmer (suspended) — Old Town Goat Dairy | suspended.farmer@marketlink.com | Farmer@123 | login is blocked |
| Other approved farmers | orchard@, dairy@, bakery@, herbs@, honey@, grains@, nursery@, lahore.farm@, islamabad.farm@ `marketlink.com` | Farmer@123 | `/login` |
| Customer — Ayesha Khan (household owner) | customer@marketlink.com | Customer@123 | `/login` |
| Customer — Omar Khan (family member of Ayesha) | omar@marketlink.com | Customer@123 | `/login` |
| Other customers | bilal@, sara@, usman@, fatima@, hamza@ `marketlink.com` | Customer@123 | `/login` |
| Customer (deactivated) | inactive.customer@marketlink.com | Customer@123 | login is blocked |

Demo data: 8 markets (Karachi, Lahore, Islamabad), 8 categories, 12 farmers, 62 products,
~440 orders over the last 8 weeks (including upcoming pre-orders in every status), ~330 reviews,
notifications, announcements, a saved report and a closed date for Bloom & Bough Nursery (next Friday).

---

## 5. Database

MongoDB collections: `users`, `farmers`, `markets`, `cities`, `categories`, `products`, `orders`, `reviews`,
`notifications`, `announcements`, `reports`, `contactmessages`, `assistantchats`.

- `database/marketlink-schema.mongodb.js` — the database definition: every collection with its
  JSON-schema validator (fields, types, required fields, allowed values) and indexes.
  It is the MongoDB equivalent of the “.sql table definitions” asked for in the SRS.
- `database/sample-data/*.json` — the test data used in the project (`npm run export-data`
  re-creates it from the current database; password hashes are masked).
- Order items are embedded in each order together with the price at the time of ordering,
  so order history stays correct when a farmer changes a price later.

---

## 6. Maps, AI assistant and e-mail

- **Maps:** OpenStreetMap tiles through Leaflet — no API key needed. The server sends a
  `strict-origin-when-cross-origin` Referrer-Policy because the OpenStreetMap tile server
  rejects tile requests without a Referer (“403 Access blocked”). If OpenStreetMap tiles still
  fail (network / firewall), the map switches automatically to CARTO tiles, and if no tiles load
  at all the markers and directions links keep working. “Route from my location”
  uses the browser’s geolocation and the free OSRM routing service; every map also links to
  Google Maps / OpenStreetMap directions. The Contact page embeds Google Maps.
- **AI assistant:** a rule-based assistant built into the API (`server/src/services/assistant.js`).
  It detects the intent of a question (market timings, farmer availability, pickup windows,
  product search, payment / delivery / cancellation FAQs, order status) and answers from live
  database data. No external AI service or key is required. It remembers the conversation
  (market, farmer, product, day, your name and city) so follow-up questions work; signed-in users'
  history is saved in the `assistantchats` collection, guests' history stays in the browser, and
  the chat's Clear chat button deletes both.
- **E-mail:** Nodemailer — order confirmation, status updates (“ready for pickup” with directions),
  farmer approval, invites for admin-created accounts and password-reset e-mails, in a branded HTML
  layout with the MarketLink logo and an action button. By default they are printed in the server
  terminal (the reset link can be copied from there). To send real e-mails with Gmail:
  1. turn on 2-Step Verification for the Gmail account;
  2. Google Account → Security → **App passwords** → create one called “MarketLink”;
  3. in `server/.env` set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER=your@gmail.com`,
     `SMTP_PASS=` the 16-letter app password (spaces are fine) and leave `MAIL_FROM` empty;
  4. check it: `npm run mail:test -- you@example.com`.
  The server also checks the SMTP login when it starts and prints a clear hint if something is wrong.
  Other providers (Outlook, Zoho, Brevo, Mailtrap …) work the same way with their host, port and login.

---

## 7. Security

bcrypt password hashing · JWT stored in an httpOnly, SameSite cookie · role-based route guards
on the API and in the UI · farmers must be approved before listing · rate limiting on failed
logins and forms · Helmet security headers and Content-Security-Policy · NoSQL-operator
sanitising and escaped search input · image-only uploads (2 MB, random file names) ·
atomic stock reservation so two customers can never buy the same last item.

---

## 8. Deployment (optional)

1. Create a free MongoDB Atlas cluster, allow network access and copy the connection string.
2. On Render choose **New → Blueprint** and select this repository — `render.yaml` (repository root) sets up the
   web service from the `MarketLink` folder (build: `npm run install:all && npm run build`, start: `npm start`).
   Enter `MONGO_URI` when asked.
   (Manual setup works too: root directory `MarketLink`, same build/start commands with `NODE_ENV=production`,
   `TZ=Asia/Karachi`, `MONGO_URI` and a random `JWT_SECRET`.)
3. Run the seed once from your computer with `MONGO_URI` pointing to Atlas: `npm run seed`.

---

## 9. Assumptions

- Payment is settled in person at pickup; there is no payment gateway (per SRS).
- Pickup only — no delivery or courier logistics (per SRS).
- Farmer identity / organic certification is not verified; tags such as “Pesticide-free” are the farmer’s own description.
- All markets are in one time zone (`TZ`, default Asia/Karachi); pickup slots and cut-off times use it.
- The e-mail address is the login name (the SRS example table’s `username`).
- The project uses MongoDB, so the database definition is provided as a mongosh script plus JSON sample data instead of `.sql` files.

---

## 10. Credits & AI tools

- Product photos: real photos from the **Open Images Dataset** (Google), published on Flickr by their
  authors under **CC BY 2.0**. Every photographer is credited on the product page and in
  `server/uploads/photos/CREDITS.md`.
- 3D produce illustrations (banners, categories, farmer logos): **Microsoft Fluent Emoji** (MIT licence).
- Logo: designed in **Canva** by the team and rebuilt as SVG / PNG (`client/public/brand`).
- Tables: **DataTables** (datatables.net, MIT licence).
- Map data © OpenStreetMap contributors; routing by OSRM.
- UI: Bootstrap 5, Bootstrap Icons, Fraunces and Plus Jakarta Sans fonts (SIL Open Font Licence).
- AI tools used: **Claude Code (Anthropic)** was used as a coding assistant during development.
  Update this section with any other AI tools your team used, as required by the SRS.
