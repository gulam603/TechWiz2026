# MarketLink — eGreen Basket

**MarketLink** connects local farmers-market stalls with customers. Farmers publish their weekly
stock, prices and pickup windows; customers find nearby markets on a map, browse and filter
products, pre-order for a pickup slot, and pay the farmer in person at pickup. Administrators
approve farmers, manage markets and categories, moderate content and generate reports.

Built for **TechWiz 2026 — End-to-End Web Solutions** with the **MERN** stack.

| Layer | Technology |
| --- | --- |
| Frontend | React 19 (Vite), React Router, Bootstrap 5 (custom SCSS theme), Bootstrap Icons, Recharts |
| Maps | OpenStreetMap tiles with Leaflet / React-Leaflet, OSRM driving routes, Google Maps links & embed |
| Backend | Node.js 20+, Express 5 REST API, JWT auth in an httpOnly cookie, Multer uploads, Nodemailer |
| Database | MongoDB (Mongoose ODM) — local MongoDB or MongoDB Atlas |

---

## 1. Features (mapped to the SRS)

**Customer**
- Register (name, contact number, e-mail, address) and log in to a personal dashboard
- Browse markets by location (“near me”), city and day; see the farmers at each market
- Farmers directory with location (city), market, category and day filters, plus a map view of all stalls
- Farmer profiles: stall name, location, operating days, pickup windows, current weekly stock, reviews
- Map of markets and farmer stalls (Leaflet + OpenStreetMap) with markers, in-app driving route and Google Maps / OSM directions
- Shop with search and filters: location (city), category, market, market day, price range, in stock; sorting
- Product details: price, unit, quantity available, farmer, reviews
- Cart grouped by farmer → choose a pickup **date and time slot** inside the farmer’s windows → place pre-order (no online payment)
- Order status: placed → accepted → ready for pickup → completed (or declined / cancelled)
- View, **modify** (items + slot) and **cancel** orders before the farmer’s cut-off time; order history and **reorder**
- Favourite farmers and products (with **restock alerts**) and saved markets
- Reviews and ratings for farmers and products after a completed order
- In-app notifications + e-mail for order confirmation and “ready for pickup”, including route-friendly pickup details (market, address, time slot and a Google Maps directions link)
- Optional **family sharing**: linked household members can see each other’s pre-orders
- **AI assistant** “Basket” (chat widget) answering market timings, farmer availability, pickup windows and product questions from live data

**Farmer**
- Register (stall/business name, contact person, contact number, e-mail, address) — needs admin approval before listing
- Stall profile: bio, tags, logo and cover photo, markets, operating days, pickup windows, **map pin (lat/lng)**
- Products: add / edit / delete with name, category, price, unit, quantity, description, image
- **Recurring weekly stock template** (manual “apply now” or automatic every week) — reserved pre-orders are respected
- Mark items sold out or temporarily unavailable
- Pre-orders: accept / decline (with reason) / mark ready / complete; set slot length, slot capacity and order cut-off hours
- **Closed dates** (“not at the market this week”): customers cannot book pickups on those days and the farmer is warned about existing pre-orders on them
- Insights: total orders, pending orders, revenue summary (7 / 30 days / all time), best-selling products, charts
- Read and reply to customer reviews

**Admin** (separate login at `/admin/login`)
- Dashboard: total farmers, customers, markets, orders, revenue, charts, most active farmers, recent orders
- Approve / suspend farmers; activate / deactivate customers
- Add / edit / remove markets (address, days, timings, map coordinates, map link, image)
- Moderate product listings and reviews
- Reports: platform overview, orders summary, revenue by market, most active farmers (saved, printable, CSV export)
- Master data: product categories; publish announcements (site banner + in-app notification)
- Contact-us inbox and all orders

**Other:** role-based access control (API + UI), responsive / mobile-friendly UI, About Us and Contact Us
(static team contact + Google Maps location + contact form).

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
│   └── uploads/            uploaded images (seed illustrations are in uploads/seed)
├── database/
│   ├── marketlink-schema.mongodb.js   collections, JSON-schema validators and indexes (mongosh)
│   └── sample-data/                   exported demo / test data (JSON, one file per collection)
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
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | optional e-mail settings. If `SMTP_HOST` is empty, e-mails are printed to the server console instead of being sent |

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

MongoDB collections: `users`, `farmers`, `markets`, `categories`, `products`, `orders`, `reviews`,
`notifications`, `announcements`, `reports`, `contactmessages`.

- `database/marketlink-schema.mongodb.js` — the database definition: every collection with its
  JSON-schema validator (fields, types, required fields, allowed values) and indexes.
  It is the MongoDB equivalent of the “.sql table definitions” asked for in the SRS.
- `database/sample-data/*.json` — the test data used in the project (`npm run export-data`
  re-creates it from the current database; password hashes are masked).
- Order items are embedded in each order together with the price at the time of ordering,
  so order history stays correct when a farmer changes a price later.

---

## 6. Maps, AI assistant and e-mail

- **Maps:** OpenStreetMap tiles through Leaflet — no API key needed. “Route from my location”
  uses the browser’s geolocation and the free OSRM routing service; every map also links to
  Google Maps / OpenStreetMap directions. The Contact page embeds Google Maps.
- **AI assistant:** a rule-based assistant built into the API (`server/src/services/assistant.js`).
  It detects the intent of a question (market timings, farmer availability, pickup windows,
  product search, payment / delivery / cancellation FAQs, order status) and answers from live
  database data. No external AI service or key is required.
- **E-mail:** Nodemailer. Configure SMTP (e.g. Gmail app password or Mailtrap) in `server/.env`;
  otherwise e-mails are logged to the console for demos.

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

- 3D produce illustrations: **Microsoft Fluent Emoji** (MIT licence).
- Map data © OpenStreetMap contributors; routing by OSRM.
- UI: Bootstrap 5, Bootstrap Icons, Fraunces and Plus Jakarta Sans fonts (SIL Open Font Licence).
- AI tools used: **Claude Code (Anthropic)** was used as a coding assistant during development.
  Update this section with any other AI tools your team used, as required by the SRS.
