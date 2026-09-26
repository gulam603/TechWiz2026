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
- [x] Home page: banner carousel (4 slides with real photos, one changes with the season, 3 s autoplay), search with a category drop-down, next market day, 30-second video tour, market photos, customer reviews with a rating summary, FAQs, newsletter sign-up
- [x] FAQ page with search and topics; FAQs on the home page and in the footer
- [x] "Add" on a product card opens the quick view to choose the amount; "Empty basket" in the basket sidebar
- [x] Product page photo fits the screen (no scrolling to see the whole picture)
- [x] Loading skeletons: the page shape shows while the app, a page or its data loads (slow connections)
- [x] Home link in the navbar and the phone menu
- [x] Category-wise search (navbar and home page) and keyword search
- [x] Real product photos on the cards again (round 7: cut-outs and illustrations removed)
- [x] Newsletter: subscribe (home page and footer), welcome e-mail, one-click unsubscribe page
- [x] Terms & Conditions page linked from the footer (sign-up forms still open it in a dialog)
- [x] "Table" or "Cards" view for My orders (DataTables)
- [x] Basket sidebar slides in at a calm, normal speed (round 8)
- [x] Customer reviews on the home page: rating summary card and a sliding wall of review cards with product photos
- [x] Whole site in Urdu (language switch; right to left; Urdu products, FAQs, terms, messages and assistant)

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
- [x] Search engine (SEO) title, description and keywords for each product, with "Fill in for me" and a Google preview
- [x] DataTables for weekly stock (edit stock, template and status in the table), pre-orders (Table / Cards) and reviews (Table / Cards, reply and report from the table)
- [x] AI product schema written automatically for every product (summary, season, storage, uses, Urdu name and Urdu tips), editable with a JSON-LD preview
- [x] Urdu product description and Urdu farm bio fields
- [x] Farmer dashboard, stock, inventory, orders, sales and reviews in Urdu
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
- [x] Seasonal announcements: pick the months (or a season) for each notice; the banner shows only the notices of the current month, with an optional link
- [x] Markets, categories, announcements and newsletter subscribers in DataTables (search, sort, CSV / Excel / Print)
- [x] FAQ management (add, edit, order, hide, delete, show on the home page)
- [x] DataTables warning "Requested unknown parameter" fixed for every table (empty values allowed, warnings go to the console)

## 4. Other requirements

- [x] Role-based access control (API and UI)
- [x] Responsive: laptop layout, mobile drawer menu, mobile bottom tab bar; every account page checked at 360, 390 and 768 px
- [x] One show/hide eye button in password fields (browser's own reveal button hidden); flat sidebar colour
- [x] SEO: per-page titles, descriptions, canonical links, Open Graph / X tags (1200 × 630 share picture), JSON-LD (Product, LocalBusiness, Place, BreadcrumbList, ItemList, FAQPage, HowTo, VideoObject, Organization), image sitemap, robots.txt, web app manifest, 404 for unknown pages
- [x] AEO: answer-first page text with links in the HTML for crawlers without JavaScript, /llms.txt and /llms-full.txt, AI crawlers allowed in robots.txt
- [x] Every picture is a real photo (banner, market, farm, category and product photos with credits); no illustrations
- [x] Alt text on every image
- [x] Compact desktop layout (more content per screen), custom scrollbars, social media links
- [x] Database validators kept in step with the code automatically (fixes "Document failed validation" on older databases)
- [x] SMTP: server picked from the address when SMTP_HOST is empty (Gmail), SMTP_FROM accepted
- [x] E-mail and in-app notifications for confirmations and ready-for-pickup (Nodemailer SMTP, e.g. Gmail app password; branded HTML e-mails)
- [x] About Us and Contact Us (static contact + Google Map)
- [x] No emoji in the interface – Bootstrap icons everywhere
- [x] Real product photos (Open Images, CC BY 2.0) with photographer credits
- [x] Non-functional: security headers, rate limits, bcrypt, NoSQL-injection protection, lazy-loaded pages, pagination, reduced-motion support
- [x] Faster first load: React loads first; charts, maps and DataTables load only with the pages that use them (about 1 MB less JavaScript on the home page)
- [x] Meta keywords on every page (site, category, product, farmer and market keywords)
- [x] No em dashes in the interface text
- [x] Responsive check of every page at 18 screen widths from 320 to 1920 px
- [x] Round 8 SEO: dynamic meta title, description, keywords, canonical and preview tags on every page change; Product JSON-LD with the AI schema (additionalProperty, alternateName, countryOfOrigin); semantic layout for AI extraction (article, titled sections, dl fact lists); static public/sitemap.xml, robots.txt and llms.txt (`npm run seo-files`); unknown addresses answer 404
- [x] Urdu (اردو): language switch on every page, right to left layout mirrored exactly (English layout unchanged), Urdu fonts, Urdu punctuation, no missing translations, server messages in Urdu, Urdu assistant, Urdu SEO (lang / dir, hreflang, og:locale, sitemap in both languages); admin forms have Urdu fields, the admin area stays English

## 5. Quality checks (last full run)

- [x] ESLint (client and server) – no errors
- [x] API suites: 69 + 23 checks, 32 extra SRS checks, 33 admin-tools checks, 31 round-4 checks (inventory, alerts, sales, reviews, moderation, reports), 25 round-5 and 44 round-6 checks (257 in total)
- [x] Round-4 browser test: 111 checks (password eye, shells, reviews, gallery, report, inventory, sales, gallery upload, AI bio, moderation, reports, mobile at 360 / 390 / 768)
- [x] Low-stock and sold-out e-mails delivered through a local SMTP server
- [x] Every API suite also run against a real MongoDB 8 server (not only FerretDB), including a database with the old validators
- [x] Round-5 checks: 45 browser checks + 25 API checks (single login, dropdown search, compact layout, categories row, search bar, map popup, quick view, basket sidebar, zoom, related products, verified reviews, checkout without an account, e-mailed password, SEO tags, sitemap, robots, phones)
- [x] Round-6 checks: 64 browser checks + 44 API checks (carousel autoplay / pause / swipe, Home link, category search, skeletons on a slow connection, video playback, reviews section, newsletter and unsubscribe, seasonal announcements, product SEO fields and page head, product images, DataTables with inline editing, Table / Cards views, no dashes on 21 pages)
- [x] Round-7 checks: 80 browser checks + 72 API checks (banner photos and 3 s autoplay, no illustrations or cut-outs on 12 pages, alt text on every image, Add opens the quick view with an amount on desktop and phone, empty basket with confirmation, product photo fits 5 screen sizes, FAQ page / home block / admin CRUD with RBAC and validation, JSON-LD per page type, crawler text without JavaScript, llms.txt, robots, image sitemap, manifest)
- [x] Round-8 checks: 39 browser checks + 65 API checks (calm basket sidebar, reviews wall, meta tags and JSON-LD after in-app navigation, semantic layout, language switch and saved choice, 17 public pages and every customer / farmer page in Urdu on a phone with no missing text, right to left details, a guest pre-order from start to finish in Urdu, server messages and errors in Urdu, Urdu assistant, admin stays English; Urdu SEO head, hreflang, sitemap in both languages, 404 for unknown addresses, Urdu content in the API)
- [x] English unchanged by the Urdu work: every page's text and labels, the assistant's answers, the crawler text, JSON-LD, llms.txt and robots.txt compared with the version before (only the language switch and the new Urdu form fields were added), and every element's box compared at 1280 and 390 px
- [x] Right to left mirror check: every public, customer and farmer page laid out left to right and right to left must be exact mirror images (1280 and 390 px)
- [x] DataTables sweep: every admin, farmer and customer table at 1440 and 390 px (paging, sorting, search, expanded rows) without a single DataTables warning
- [x] Responsive sweep: every public page at 18 widths (320 to 1920 px) and every account page at 9 widths, in English and in Urdu (567 page views each); no horizontal scrolling and nothing sticking out of the screen
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
