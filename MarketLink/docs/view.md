# MarketLink – Views (pages and screens)

Every page of the React app, grouped by who can open it. Routes are defined in
`client/src/App.jsx`; each page is lazy-loaded. Protected pages use `ProtectedRoute`, which
sends guests to the right login page and blocks other roles.

## Shared layout (every page)

| Piece | File | What it does |
| --- | --- | --- |
| Announcement bar | `components/layout/AnnouncementBar.jsx` | the admin announcement for the current season (months chosen by the admin), optional "Shop now" link, can be dismissed |
| Navbar | `components/layout/Navbar.jsx` | logo, main links (Home, Shop, Markets, Farmers, Map, About, Contact), search with a category drop-down, basket, notification bell, account menu; turns a shadow on while scrolling |
| Loading skeletons | `components/common/Skeletons.jsx`, `client/index.html` | grey page shapes while the app, a page or its data loads (slow connections): a first skeleton inside `index.html`, a home-page and a general page skeleton while a page's code downloads, and placeholders inside each home section |
| Mobile drawer | `components/layout/MobileMenu.jsx` | phones/tablets: slide-in menu with its own scroll, backdrop, Escape to close, closes after navigation |
| Bottom tab bar | `components/layout/MobileTabBar.jsx` | phones/tablets: 5 role-aware tabs (guest/customer: Home, Shop, Map, Basket, Account; farmer: Stall, Orders, Stock, Pickup, Profile; admin: Dashboard, Farmers, Orders, Markets, Reports) |
| Basket sidebar | `components/cart/CartDrawer.jsx` | basket on the right (on the left in Urdu), sliding in at a calm speed: lines per farmer, quantities, total, Checkout and View full basket; opens from the basket icon and after adding from a product page or quick view |
| Language switch | `i18n/LanguageProvider.jsx` (`LanguageSwitch`) | English / اردو button in the navbar, phone menu and the customer and farmer dashboards; Urdu turns the page right to left and is remembered |
| Dropdown with search | `components/common/SearchSelect.jsx` | replaces long `<select>` lists (cities, markets, categories, farmers, customers, all filter bars): search box, arrow keys, Enter, Escape |
| AI assistant | `components/chat/ChatWidget.jsx` | floating chat "Basket" with memory, saved history and Clear chat (not in the admin area) |
| Newsletter strip | `components/home/NewsletterCta.jsx` | "Get the weekly harvest list in your inbox" with a fruit basket photo, sitting half over the top of the footer on every public page |
| Footer | `components/layout/Footer.jsx` | Shop, For farmers, Help & legal (Terms & Conditions, Privacy) and Contact (e-mail, phone) links, social icons and one line at the bottom: "© 2026 MarketLink · Built by Team Omniverse · Terms & Conditions" |
| Toasts | `context/ToastContext.jsx` | messages in four kinds with their own colour, icon and title: success (Done), error (Something went wrong), warning (Please note) and info (Good to know); top right on laptops, bottom centre on phones; close by themselves (the timer waits under the mouse) or with × |
| Filter sidebar | `components/common/FilterSidebar.jsx` | phones and tablets: the filters of the shop, farmers and markets slide in from the right (left in Urdu) with Clear all and Show results; Escape or the backdrop closes it |
| App shell | `components/layout/AppShell.jsx` | shared back-office layout of the customer, farmer and admin areas: flat forest sidebar with sections and counters, collapse to icons (remembered), drawer on phones, top bar with page title, quick actions, notification bell and account menu; no public navbar |
| Dashboard layout | `components/layout/DashboardLayout.jsx` | customer and farmer sidebars on the app shell (counters: ready orders, pickups to review, new pre-orders, low stock); pending farmers only see Dashboard, Stall profile and Notifications; keeps the chat and the bottom tab bar |
| Admin layout | `components/admin/AdminLayout.jsx` | admin sidebar on the app shell (counters: open orders, pending farmers, open reports, new messages), top bar with Place order, Add farmer; no chat |

## Public pages (anyone)

| Route | Page | Content |
| --- | --- | --- |
| `/` | Home | banner of full-width photos with the words on them (welcome, this season's harvest, pickup, farmers; changes by itself every 3 s, also with reduced motion and under the mouse; pause, dots, arrows, swipe) and four promises under it; search card (category drop-down, next market day); Shop by category cards with photos and item counts; Top picks this week (grid, a swipe row on phones); "Up to 30% off fresh vegetables" offers banner from the real offers; Why choose us; video tour (plays by itself, muted) + 4 steps; markets near you (map); top-rated farmers with their location; From our farms to your table (live numbers, Register your stall); customer reviews carousel (faces on an arc, one large review, moves on by itself); FAQs (6 questions, one open at a time, + link to all); a product card's Add opens the quick view to choose the amount |
| `/products` | Shop | search, filters (category, city, market, market day, price range, rating, farming practice, in stock, on offer only), sorting, pagination; on phones the filters open as a sidebar from the right |
| `/products/:slug` | Product detail (readable URL, e.g. `/products/sindhri-mangoes`; old id links redirect) | real product photo with credit (fits the screen, stays in view on laptops), price, unit, stock bar, quantity + add to basket, farmer card, pickup windows, reviews, related products |
| `/markets` | Markets | search, city dropdown (cities table), produce category dropdown, day filter, "Near me" (distance sort), grid or map view |
| `/markets/:slug` | Market detail | days, hours, address, map with directions, farmers at this market, save market |
| `/farmers` | Farmers | search, city, market, category, day, rating and farming-practice filters, grid or map view |
| `/farmers/:slug` | Farmer profile | stall name, location, operating days, what they grow, practices, weekly stock, pickup windows, closed dates, map with route, reviews |
| `/map` | Explore map | full map of markets and stalls with a searchable list, day filter, "near me", routes |
| `/about` | About us | problem, solution, live numbers, values, "Who built MarketLink" – Team Omniverse banner and team cards |
| `/terms` | Terms & Conditions | 12 sections (accounts, pre-orders, cancellations, payment, farmers, reviews, AI assistant, privacy …) with a table of contents (a fold-out list on phones); linked from the footer, while the sign-up forms open the same text in a dialog |
| `/faq` | FAQs | 17 questions in 4 topics (shopping, pickup & payment, farmers, account & privacy) with bigger topic headings, one question open at a time (smooth open animation), search, topic chips, help box; FAQPage structured data |
| `/unsubscribe?token=` | Unsubscribe | opened from the newsletter e-mail; stops the newsletter for that address |
| `/contact` | Contact us | static team contact, Google Map, contact form (goes to the admin inbox) |
| `/cart` | Basket | items grouped by farmer (one pickup per farmer), quantities, totals; the basket icon opens the same basket as a sidebar on the right |
| `/login`, `/register` | Customer / farmer login, customer sign-up | floating produce banner; sign-up asks name, contact number, e-mail, address and a required "I agree to the Terms & Conditions" (terms open in a dialog) |
| `/register/farmer` | Farmer sign-up wizard | 3 steps: stall & account → farm details (address, city dropdown, bio, categories, practices) → markets, map pin, Terms & Conditions |
| `/forgot-password`, `/reset-password/:token` | Password reset | one-time link valid for 30 minutes |
| `/admin/login` | (old link) | redirects to `/login`: one login page for customers, farmers and administrators |
| `*` | Not found | friendly 404 with links back |

## Customer pages (role: customer)

| Route | Page | Content |
| --- | --- | --- |
| `/checkout` | Checkout (guests too) | guests first give first name, last name, e-mail, number and address (account created, password e-mailed); then pickup date and time slot per farmer (inside the farmer's windows, respecting capacity, cut-off and closed dates), notes, place pre-order (pay at pickup) |
| `/checkout/success` | Order placed | order numbers and pickup summary |
| `/account` | Dashboard | greeting, ready-for-pickup alert, active and completed counts, upcoming pickups, latest updates, favourite farmers, products picked for you |
| `/account/orders` | My orders | Active / History / All tabs, reorder |
| `/account/orders/:id` | Order detail | status timeline, pickup map with directions, modify items or slot, cancel (before cut-off), review product and farmer after completion |
| `/account/favorites` | Favourites | favourite products (restock alerts), farmers and saved markets |
| `/account/reviews` | My reviews | To review: completed pickups grouped by order (rate the stall, review each product); My reviews: posted reviews, farmer replies, reviews waiting for a check |
| `/account/profile` | Profile & family | profile photo upload, personal details, password, full-width family sharing banner with household members |
| `/account/notifications` | Notifications | order updates, restock alerts, review replies, announcements |

## Farmer pages (role: farmer)

| Route | Page | Content |
| --- | --- | --- |
| `/farmer` | Dashboard & insights | while pending: approval steps and stall-profile checklist only; once approved: revenue, total and pending orders, average order, revenue summary (7 / 30 days / all time), revenue chart, best-selling products, orders by status, upcoming pickups |
| `/farmer/orders`, `/farmer/orders/:id` | Pre-orders | Open / New / Accepted / Ready / History tabs, accept, decline with reason, mark ready, complete |
| `/farmer/products` | Weekly stock | add / edit / delete products (name, category, price, unit, quantity, description with "Write with AI", main photo + up to 4 gallery photos), sold out / unavailable, weekly template (apply now or automatically); `?new=1` opens the Add product form |
| `/farmer/inventory` | Inventory | KPIs (products, units, stock value, reserved, low stock, sold out), low-stock banner, products grid with Adjust / alert level / history, stock log with filters |
| `/farmer/pickup` | Markets & pickup | markets and days, pickup windows, slot length and capacity, order cut-off hours, closed dates with clash warnings |
| `/farmer/profile` | Stall profile | stall details, city dropdown, bio with "Generate with AI", categories, practices, logo, cover photo, map pin, own profile photo |
| `/farmer/reviews` | Reviews | read and reply to reviews, report an abusive review |
| `/farmer/notifications` | Notifications | new orders, approvals, reviews, low-stock and sold-out alerts |
| `/farmer/sales` | Sales report | period presets or custom dates, KPIs vs previous period, insights, revenue per day, categories, pickup days and times, markets, products and customers grids, print |

## Admin pages (role: admin, same login page, own layout)

Every admin table is a DataTables grid (search, sort, paging, CSV / Excel / Print) with filter controls.

| Route | Page | Content |
| --- | --- | --- |
| `/admin` | Dashboard | compact overview: greeting and quick actions, 6 KPI cards, orders/revenue chart (last 30 days), "Needs attention" list, orders by status, recent orders, most active farmers |
| `/admin/orders`, `/admin/orders/:id` | Orders | all pre-orders; filters: status, city, market, farmer, placed by, pickup and placed date ranges, min/max total; Place order (modal) |
| `/admin/farmers` | Farmers | approve, suspend or reactivate, details modal, Add farmer (modal); filters: status, city, market, category, joined dates |
| `/admin/customers`, `/admin/customers/:id` | Customers + customer history | activate / deactivate, Add customer; History: profile, spend, purchases per farmer (products and quantities), orders per month, full order history grid |
| `/admin/markets` | Markets | DataTable of markets; add, edit, remove markets (city dropdown, what is sold there, days, timings, coordinates, map link, image) |
| `/admin/cities` | Cities | cities table: add, edit, hide or delete cities used by every city dropdown |
| `/admin/categories` | Categories | master data in a DataTable (icon, products, order, colour, status) |
| `/admin/products` | Product listings | remove or restore listings; filters: listing status, category, farmer, city, low stock, price range |
| `/admin/reviews` | Reviews | remove or restore reviews; filters: visibility, product/farmer, rating, farmer, dates |
| `/admin/moderation` | Moderation | KPIs, Open / Resolved / Dismissed tabs, reports about reviews, listings and stalls plus reviews held by the word filter; publish, remove, restore, suspend stall, dismiss (with a note) |
| `/admin/announcements` | Announcements | publish or edit a site banner + in-app notification; season presets or months, optional link; DataTable with Live / Waiting for its season / Hidden |
| `/admin/faqs` | FAQs | add / edit questions (topic, home page), order numbers in the table, hide, delete, CSV / Excel |
| `/admin/newsletter` | Newsletter | subscribers in a DataTable (status, where they signed up, dates), remove, CSV / Excel export |
| `/admin/messages` | Contact messages | inbox from the Contact page (open, mark read, reply by e-mail, delete) |
| `/admin/notifications` | Notifications | system notices |
| `/admin/purchases` | Customer purchases | which customer bought what from which farmer: KPIs, top customers, top farmers, amount per day, customer × farmer heat map, pairs table, most bought products; filters and export |
| `/admin/reports` | Reports | platform overview, orders summary, revenue by market, most active farmers, sales by category, customer activity, inventory & low stock, cities overview, reviews & moderation; CSV export and print (last item in the sidebar) |

## Responsive behaviour

- **≥ 992 px (laptop/desktop):** full navbar on public pages; the customer, farmer and admin areas share one back-office layout (flat green sidebar that collapses to icons), split auth screens.
- **< 992 px (tablet/phone):** hamburger opens the drawer, bottom tab bar is fixed at the bottom,
  dashboards switch to chip navigation, the chat button and toasts sit above the tab bar. The admin
  sidebar becomes a slide-in drawer and DataTables rows fold extra columns into an expandable row.
  On phones KPI labels wrap to two lines and tab pills scroll sideways instead of wrapping.
- Checked with no horizontal scrolling at 360, 390, 768 and 1024 px on every page.
- **Urdu (right to left):** every layout above is mirrored: sidebars and drawers come from the right, the
  basket sidebar from the left, arrows point the other way, table columns read from the right. Maps and charts
  keep their left to right drawing; map popups and chart labels are in Urdu. Checked at 1280 and 390 px on every
  public, customer and farmer page.
