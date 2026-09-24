# MarketLink – Tasks

Status of the work against the SRS (TechWiz 2026, End-to-End Web Solutions, theme eGreen Basket).
`[x]` = done and tested, `[ ]` = still to do.

## 1. Customer features (SRS 1.6)

- [x] Register (name, contact number, e-mail, address – all required), log in, personal dashboard
- [x] Forgot / reset password (one-time link, 30 minutes)
- [x] Multiple favourite farmers and products; saved markets
- [x] Family (household) account sharing – optional in the SRS
- [x] Browse markets by location (near me, city) and day; farmers at each market
- [x] Farmer profile: stall name, location, operating days, weekly stock, pickup windows
- [x] Map of markets and stalls with markers and directions (OpenStreetMap + CARTO fallback, OSRM route, Google Maps link)
- [x] Categories with filters for price, category, market, day, city and stock; search and sorting
- [x] Product details: price, unit, quantity available, farmer, reviews, real photo with credit
- [x] Cart and pre-order against the farmer's stock (stock reserved on order)
- [x] Pickup date and time slot inside the farmer's windows (capacity, cut-off, closed dates)
- [x] Order status placed → accepted → ready for pickup → completed; view, modify and cancel before the cut-off
- [x] Order history and reorder
- [x] Restock alerts for favourite products
- [x] Route-friendly pickup details (address, slot, directions link) in e-mails and notifications
- [x] AI assistant: items across markets, market timings, farmer availability, pickup windows, product details
- [x] AI assistant memory (follow-up questions, name, city), saved chat history and Clear chat
- [x] Reviews and ratings for products and farmers after completion; read reviews before ordering
- [x] Readable product URLs (`/products/sindhri-mangoes`)
- [x] Terms & Conditions page and required checkbox on both sign-up forms
- [x] Profile photo upload (all roles)
- [x] More filters: rating and farming practice (shop, farmers), produce category and city (markets)
- [x] Write reviews for farmers and products from the product page, the stall page or "My reviews" (grouped by pickup)
- [x] Report a review, a product listing or a stall to the admin
- [x] Favourite farmers from the stall page, farmer cards and the product page; favourite farmers on the dashboard
- [x] Product photo gallery (up to 5 photos, thumbnails, arrows, swipe, keyboard, credit per photo)
- [x] Own account area with the same sidebar layout as the admin area
- [x] Checkout without an account: details form, account created automatically, password e-mailed
- [x] Basket sidebar (right side) with a link to the full basket page; quick view dialog on product cards
- [x] Photo zoom and full-screen viewer on the product page; "From the same stall" and "You may also like"
- [x] Verified purchase / Unverified badges on reviews (reviews without a purchase are allowed once)
- [x] Search inside dropdowns (cities, markets, categories, farmers, customers, filters)

## 2. Farmer features

- [x] Registration wizard: stall/business name, contact person, contact number, e-mail, address, city, bio, categories, practices, markets, map pin
- [x] Admin approval before listing products
- [x] Profile: markets, operating days, pickup windows, address, map pin, latitude/longitude, logo, cover
- [x] Products: add, edit, view, delete (name, category, price, unit, quantity, description, image)
- [x] Recurring weekly stock template (apply now or automatically each week)
- [x] Sold out / temporarily unavailable
- [x] Pre-orders: accept, decline with reason, mark ready, complete
- [x] Order cut-off hours, slot length, slot capacity, closed dates
- [x] Insights: total orders, pending orders, revenue summary, best sellers, sales history
- [x] Read and reply to reviews
- [x] Selling features (stock, pre-orders, pickup, reviews) hidden and blocked until admin approval
- [x] "Write with AI" product descriptions (Claude with an API key, built-in writer otherwise)
- [x] City chosen from the cities table
- [x] Inventory: stock on hand, stock reserved by open pre-orders, stock value, adjust (restock, stall sale, waste, correction), full stock log
- [x] Low-stock alerts per product (alert level) by e-mail (Nodemailer SMTP) and in-app notification, plus a sold-out alert
- [x] Sales insights report: revenue vs previous period, best sellers, categories, markets, busiest days and pickup times, returning customers, printable
- [x] Extra product photos (gallery) in the product form
- [x] "Generate with AI" for the "About the farm" text
- [x] Same sidebar layout as the admin area (collapsible, mobile drawer)

## 3. Admin features

- [x] Secure login (the same login page for every role) and admin dashboard (totals: farmers, customers, markets, orders)
- [x] Approve / suspend farmers; activate / deactivate customers
- [x] Markets: add, edit, remove (name, address, days, timings, coordinates, map link)
- [x] Remove inappropriate product listings and reviews
- [x] Reports: orders, revenue across markets, most active farmers (CSV export, print)
- [x] Product categories and platform announcements
- [x] Own admin layout (no public navbar), collapsible sidebar, Reports last, compact revamped dashboard
- [x] DataTables on every admin table with server-side processing, filters and CSV / Excel / Print export
- [x] Admin creates farmer and customer accounts (invite e-mail) and places orders for customers
- [x] Customer order history and customer × farmer purchase analytics with charts
- [x] Cities table (admin CRUD) used by city dropdowns; market categories dropdown
- [x] "Generate with AI" farm description when the admin adds a farmer
- [x] Content moderation queue: user reports and reviews held by the word filter; publish, remove, restore, suspend stall or dismiss
- [x] Platform-wide reports: sales by category, customer activity, inventory & low stock, cities overview, reviews & moderation (DataTables with CSV / Excel / Print)

## 4. Other requirements

- [x] Role-based access control (API and UI)
- [x] Responsive: laptop layout, mobile drawer menu, mobile bottom tab bar; every account page checked at 360, 390 and 768 px
- [x] One show/hide eye button in password fields (browser's own reveal button hidden); flat sidebar colour
- [x] SEO: per-page titles, descriptions, canonical links, Open Graph / X tags, JSON-LD, sitemap.xml, robots.txt, 404 for unknown pages
- [x] Compact desktop layout (more content per screen), custom scrollbars, social media links
- [x] Database validators kept in step with the code automatically (fixes "Document failed validation" on older databases)
- [x] SMTP: server picked from the address when SMTP_HOST is empty (Gmail), SMTP_FROM accepted
- [x] E-mail and in-app notifications for confirmations and ready-for-pickup (Nodemailer SMTP, e.g. Gmail app password; branded HTML e-mails)
- [x] About Us and Contact Us (static contact + Google Map)
- [x] No emoji in the interface – Bootstrap icons everywhere
- [x] Real product photos (Open Images, CC BY 2.0) with photographer credits
- [x] Non-functional: security headers, rate limits, bcrypt, NoSQL-injection protection, lazy-loaded pages, pagination, reduced-motion support

## 5. Quality checks (last full run)

- [x] ESLint (client and server) – no errors
- [x] API suites: 69 + 23 checks, 32 extra SRS checks, 33 admin-tools checks, 31 round-4 checks (inventory, alerts, sales, reviews, moderation, reports)
- [x] Round-4 browser test: 111 checks (password eye, shells, reviews, gallery, report, inventory, sales, gallery upload, AI bio, moderation, reports, mobile at 360 / 390 / 768)
- [x] Low-stock and sold-out e-mails delivered through a local SMTP server
- [x] Every API suite also run against a real MongoDB 8 server (not only FerretDB), including a database with the old validators
- [x] Round-5 checks: 45 browser checks + 25 API checks (single login, dropdown search, compact layout, categories row, search bar, map popup, quick view, basket sidebar, zoom, related products, verified reviews, checkout without an account, e-mailed password, SEO tags, sitemap, robots, phones)
- [x] Admin browser test: shell, collapse, place order, CSV export, add farmer, customer history, analytics, cities, mobile drawer, pending-farmer lock, Write with AI
- [x] SMTP delivery tested with a local SMTP server (login, order, approval and reset e-mails)
- [x] Browser flows: customer → farmer → admin, filters, maps, closed dates, sign-up wizard, password reset
- [x] Assistant memory and chat history (guest and signed-in)
- [x] No horizontal scrolling at 360, 390, 768, 1024 px; no React warnings in development mode

## 6. Submission items for the team (SRS 1.9)

- [ ] Add each member's name on the About page (`client/src/config.js` → `TEAM`; the team name Team Omniverse is already shown)
- [ ] Put real SMTP details (e.g. a Gmail app password) in `server/.env` and run `npm run mail:test`
- [ ] Project report written by the team: problem definition, design specifications, flowcharts and data-flow diagrams, database design, test data (no source code; the SRS does not allow fully AI-made documentation)
- [ ] Installation steps and user credentials in the report (see README sections 3 and 4)
- [ ] ReadMe.doc with the assumptions (start from README section 9)
- [ ] Demo video (.mp4) showing every functional requirement
- [ ] Host the app and share the URL (render.yaml + MongoDB Atlas)
- [ ] List every AI tool the team used (README section 10)
- [ ] Final zip: project, ReadMe.doc, database scripts, report, video

## 7. Ideas for later (not required by the SRS)

- [ ] Real-time order updates with WebSockets
- [ ] Farmer bulk import of weekly stock from a spreadsheet
- [ ] Customer SMS reminders on pickup day
- [ ] Urdu language option
