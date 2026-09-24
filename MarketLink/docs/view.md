# MarketLink – Views (pages and screens)

Every page of the React app, grouped by who can open it. Routes are defined in
`client/src/App.jsx`; each page is lazy-loaded. Protected pages use `ProtectedRoute`, which
sends guests to the right login page and blocks other roles.

## Shared layout (every page)

| Piece | File | What it does |
| --- | --- | --- |
| Announcement bar | `components/layout/AnnouncementBar.jsx` | active admin announcement, can be dismissed |
| Navbar | `components/layout/Navbar.jsx` | logo, main links, global search, basket, notification bell, account menu; turns a shadow on while scrolling |
| Mobile drawer | `components/layout/MobileMenu.jsx` | phones/tablets: slide-in menu with its own scroll, backdrop, Escape to close, closes after navigation |
| Bottom tab bar | `components/layout/MobileTabBar.jsx` | phones/tablets: 5 role-aware tabs (guest/customer: Home, Shop, Map, Basket, Account; farmer: Stall, Orders, Stock, Pickup, Profile; admin: Dashboard, Farmers, Orders, Markets, Reports) |
| AI assistant | `components/chat/ChatWidget.jsx` | floating chat "Basket" with memory, saved history and Clear chat (not in the admin area) |
| Footer | `components/layout/Footer.jsx` | links, team contact (Aptech Learning Centre, F.B. Area, Karachi), "Built by Team Omniverse", credits, Terms |
| Dashboard layout | `components/layout/DashboardLayout.jsx` | customer and farmer areas: collapsible sidebar (icons only), chip navigation on small screens; pending farmers only see Dashboard, Stall profile and Notifications |
| Admin layout | `components/admin/AdminLayout.jsx` | admin area only: no public navbar/footer/chat; collapsible dark sidebar (drawer on phones), top bar with Place order, Add farmer, notifications, account menu |

## Public pages (anyone)

| Route | Page | Content |
| --- | --- | --- |
| `/` | Home | hero with search and live stats (count-up), next market day, mini map, categories, popular products, how it works, markets near you (map), top-rated farmers, testimonials, farmer call-to-action |
| `/products` | Shop | search, filters (category, city, market, market day, price range, in stock), sorting, pagination |
| `/products/:slug` | Product detail (readable URL, e.g. `/products/sindhri-mangoes`; old id links redirect) | real product photo with credit, price, unit, stock bar, quantity + add to basket, farmer card, pickup windows, reviews, related products |
| `/markets` | Markets | search, city dropdown (cities table), produce category dropdown, day filter, "Near me" (distance sort), grid or map view |
| `/markets/:slug` | Market detail | days, hours, address, map with directions, farmers at this market, save market |
| `/farmers` | Farmers | search, city, market, category, day, rating and farming-practice filters, grid or map view |
| `/farmers/:slug` | Farmer profile | stall name, location, operating days, what they grow, practices, weekly stock, pickup windows, closed dates, map with route, reviews |
| `/map` | Explore map | full map of markets and stalls with a searchable list, day filter, "near me", routes |
| `/about` | About us | problem, solution, live numbers, values, "Who built MarketLink" – Team Omniverse banner and team cards |
| `/terms` | Terms & Conditions | 12 sections (accounts, pre-orders, cancellations, payment, farmers, reviews, AI assistant, privacy …) with a table of contents |
| `/contact` | Contact us | static team contact, Google Map, contact form (goes to the admin inbox) |
| `/cart` | Basket | items grouped by farmer (one pickup per farmer), quantities, totals |
| `/login`, `/register` | Customer / farmer login, customer sign-up | floating produce banner; sign-up asks name, contact number, e-mail, address and a required "I agree to the Terms & Conditions" (terms open in a dialog) |
| `/register/farmer` | Farmer sign-up wizard | 3 steps: stall & account → farm details (address, city dropdown, bio, categories, practices) → markets, map pin, Terms & Conditions |
| `/forgot-password`, `/reset-password/:token` | Password reset | one-time link valid for 30 minutes |
| `/admin/login` | Admin login | separate portal for administrators |
| `*` | Not found | friendly 404 with links back |

## Customer pages (role: customer)

| Route | Page | Content |
| --- | --- | --- |
| `/checkout` | Checkout | pickup date and time slot per farmer (inside the farmer's windows, respecting capacity, cut-off and closed dates), notes, place pre-order (pay at pickup) |
| `/checkout/success` | Order placed | order numbers and pickup summary |
| `/account` | Dashboard | greeting, ready-for-pickup alert, active and completed counts, upcoming pickups, latest updates, products picked for you |
| `/account/orders` | My orders | Active / History / All tabs, reorder |
| `/account/orders/:id` | Order detail | status timeline, pickup map with directions, modify items or slot, cancel (before cut-off), review product and farmer after completion |
| `/account/favorites` | Favourites | favourite products (restock alerts), farmers and saved markets |
| `/account/profile` | Profile & family | profile photo upload, personal details, password, full-width family sharing banner with household members |
| `/account/notifications` | Notifications | order updates, restock alerts, announcements |

## Farmer pages (role: farmer)

| Route | Page | Content |
| --- | --- | --- |
| `/farmer` | Dashboard & insights | while pending: approval steps and stall-profile checklist only; once approved: revenue, total and pending orders, average order, revenue summary (7 / 30 days / all time), revenue chart, best-selling products, orders by status, upcoming pickups |
| `/farmer/orders`, `/farmer/orders/:id` | Pre-orders | Open / New / Accepted / Ready / History tabs, accept, decline with reason, mark ready, complete |
| `/farmer/products` | Weekly stock | add / edit / delete products (name, category, price, unit, quantity, description with "Write with AI", image), sold out / unavailable, weekly template (apply now or automatically) |
| `/farmer/pickup` | Markets & pickup | markets and days, pickup windows, slot length and capacity, order cut-off hours, closed dates with clash warnings |
| `/farmer/profile` | Stall profile | stall details, city dropdown, bio, categories, practices, logo, cover photo, map pin, own profile photo |
| `/farmer/reviews` | Reviews | read and reply to reviews |
| `/farmer/notifications` | Notifications | new orders, approvals, reviews |

## Admin pages (role: admin, separate login, own layout)

Every admin table is a DataTables grid (search, sort, paging, CSV / Excel / Print) with filter controls.

| Route | Page | Content |
| --- | --- | --- |
| `/admin` | Dashboard | compact overview: greeting and quick actions, 6 KPI cards, orders/revenue chart (last 30 days), "Needs attention" list, orders by status, recent orders, most active farmers |
| `/admin/orders`, `/admin/orders/:id` | Orders | all pre-orders; filters: status, city, market, farmer, placed by, pickup and placed date ranges, min/max total; Place order (modal) |
| `/admin/farmers` | Farmers | approve, suspend or reactivate, details modal, Add farmer (modal); filters: status, city, market, category, joined dates |
| `/admin/customers`, `/admin/customers/:id` | Customers + customer history | activate / deactivate, Add customer; History: profile, spend, purchases per farmer (products and quantities), orders per month, full order history grid |
| `/admin/markets` | Markets | add, edit, remove markets (city dropdown, what is sold there, days, timings, coordinates, map link, image) |
| `/admin/cities` | Cities | cities table: add, edit, hide or delete cities used by every city dropdown |
| `/admin/categories` | Categories | master data |
| `/admin/products` | Product listings | remove or restore listings; filters: listing status, category, farmer, city, low stock, price range |
| `/admin/reviews` | Reviews | remove or restore reviews; filters: visibility, product/farmer, rating, farmer, dates |
| `/admin/announcements` | Announcements | publish site banner + in-app notification |
| `/admin/messages` | Contact messages | inbox from the Contact page (open, mark read, reply by e-mail, delete) |
| `/admin/notifications` | Notifications | system notices |
| `/admin/purchases` | Customer purchases | which customer bought what from which farmer: KPIs, top customers, top farmers, amount per day, customer × farmer heat map, pairs table, most bought products; filters and export |
| `/admin/reports` | Reports | platform overview, orders summary, revenue by market, most active farmers; CSV export and print (last item in the sidebar) |

## Responsive behaviour

- **≥ 992 px (laptop/desktop):** full navbar, dashboard sidebar (collapsible), split auth screens; admin sidebar collapses to icons.
- **< 992 px (tablet/phone):** hamburger opens the drawer, bottom tab bar is fixed at the bottom,
  dashboards switch to chip navigation, the chat button and toasts sit above the tab bar. The admin
  sidebar becomes a slide-in drawer and DataTables rows fold extra columns into an expandable row.
- Checked with no horizontal scrolling at 360, 390, 768 and 1024 px on every page.
