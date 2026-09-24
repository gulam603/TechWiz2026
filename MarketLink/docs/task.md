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

## 3. Admin features

- [x] Separate secure login and dashboard (totals: farmers, customers, markets, orders)
- [x] Approve / suspend farmers; activate / deactivate customers
- [x] Markets: add, edit, remove (name, address, days, timings, coordinates, map link)
- [x] Remove inappropriate product listings and reviews
- [x] Reports: orders, revenue across markets, most active farmers (CSV export, print)
- [x] Product categories and platform announcements

## 4. Other requirements

- [x] Role-based access control (API and UI)
- [x] Responsive: laptop layout, mobile drawer menu, mobile bottom tab bar
- [x] E-mail and in-app notifications for confirmations and ready-for-pickup
- [x] About Us and Contact Us (static contact + Google Map)
- [x] No emoji in the interface – Bootstrap icons everywhere
- [x] Real product photos (Open Images, CC BY 2.0) with photographer credits
- [x] Non-functional: security headers, rate limits, bcrypt, NoSQL-injection protection, lazy-loaded pages, pagination, reduced-motion support

## 5. Quality checks (last full run)

- [x] ESLint (client and server) – no errors
- [x] API suites: 68 + 23 checks, plus 32 extra SRS checks
- [x] Browser flows: customer → farmer → admin, filters, maps, closed dates, sign-up wizard, password reset
- [x] Assistant memory and chat history (guest and signed-in)
- [x] No horizontal scrolling at 360, 390, 768, 1024 px; no React warnings in development mode

## 6. Submission items for the team (SRS 1.9)

- [ ] Put the team's real names and roles on the About page (`client/src/config.js` → `TEAM`)
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
