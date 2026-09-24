# MarketLink – Design System

Theme: **eGreen Basket** – a calm, fresh farmers-market look: deep forest green, a bright lime
accent, warm cream paper and real produce photography. The system is written in SCSS on top of
Bootstrap 5 (`client/src/styles`).

| File | Contains |
| --- | --- |
| `_variables.scss` | colour tokens, fonts, Bootstrap overrides, container widths |
| `_base.scss` | CSS custom properties, typography, buttons, utilities, motion keyframes, scroll reveal |
| `_components.scss` | navbar, drawer, tab bar, cards, produce tiles, chips, badges, modal, toasts, chat |
| `_pages.scss` | home hero, auth banner, product / farmer / market pages, cart, checkout, map |
| `_dashboard.scss` | dashboard layout, collapsible sidebar, compact KPI cards, panels, tables, profile photo, family banner |
| `_admin.scss` | admin shell (sidebar, top bar, drawer), filter bar, DataTables theme, admin modals, analytics heat map, pending-farmer screens |

## 1. Colour

| Token | Hex | Used for |
| --- | --- | --- |
| `$ml-forest` | `#173b2c` | headings, dark panels, active states, footer |
| `$ml-forest-2` | `#1f4a37` | gradients on dark panels |
| `$ml-green` | `#2e7d4f` | primary buttons, links, icons |
| `$ml-leaf` | `#6dbe45` | hover borders, highlights |
| `$ml-lime` | `#d4f06e` | accent: "Sell with us" button, active tab pill, announcement bar, numbers on dark |
| `$ml-cream` | `#faf7f0` | page background |
| `$ml-sand` | `#f1ebdd` | soft panels, tile backgrounds |
| `$ml-carrot` | `#f28c38` | basket / notification counters, warnings |
| `$ml-tomato` | `#e0513a` | danger, sold out |
| `$ml-honey` | `#f4b93e` | star ratings |
| `$ml-sky` | `#3c8dbc` | info |
| `$ml-ink` | `#16211c` | body text |
| `$ml-muted` | `#66756d` | secondary text |
| `$ml-line` | `#e7e1d3` | borders and dividers |

Bootstrap theme colours map to these tokens (`primary` = green, `dark` = forest, `danger` = tomato,
`warning` = honey) and extra utilities exist for `forest`, `lime` and `carrot`.
Each product category has its own pastel tile colour (stored on the category).

## 2. Typography

- **Headings:** Fraunces Variable (serif, weight 650, forest colour), with italic lime or green
  accents for a key word ("*reserved* for you", "*one tap away*").
- **Body:** Plus Jakarta Sans Variable, 0.975 rem, line height 1.6.
- **Numbers:** `font-variant-numeric: tabular-nums` for stats and prices.
- Uppercase "eyebrow" labels (0.72 rem, wide letter spacing) introduce sections.
- Fonts are bundled with `@fontsource-variable`, so no external font request is needed.

## 3. Layout

On laptops and desktops (≥ 992 px) the root font size is 15 px and section spacing, page headers and the home hero are tighter, so more fits on one screen; shop grids show four products per row. Scrollbars are thin and green across the site.


- Bootstrap breakpoints: sm 576, md 768, **lg 992**, xl 1200, xxl 1400 px.
- Containers are widened for laptops (lg 1140, xl 1240, xxl 1320 px) with 1.5 rem side padding.
- Radius: 0.8 rem (inputs), 1.25 rem (cards, `--ml-radius`), 1.75 rem (hero panels, `--ml-radius-lg`).
- Navbar height `--ml-nav-h: 72px`; mobile tab bar height `--ml-tabbar-h: 64px` (+ safe area).
- Admin area: 248 px dark sidebar (74 px when collapsed), 60 px top bar, content up to 1680 px wide.
- Dashboards are compact so the key numbers and charts fit on one laptop screen: headings
  1.4–1.85 rem, KPI cards with the icon on the left (about 80 px high), panels with 1 rem padding.
- Below 992 px: the hamburger drawer and bottom tab bar replace the desktop navbar links; the page
  gets bottom padding so content is never hidden behind the tab bar.

## 4. Components

| Component | Notes |
| --- | --- |
| Buttons | `btn-primary` (green), `btn-lime`, `btn-forest`, `btn-soft`, `btn-white`, round `btn-icon`; press feedback `scale(0.98)`; labels never wrap |
| Chips | `chip`, `chip-soft`, `hero-chip` (on dark), filter chips and day dots (S M T W T F S) |
| Product card | produce tile (4:3) + category, name, farmer, rating, price per unit, add button; lifts on hover |
| Produce tile | real photos fill the tile (`img.photo`, object-fit cover); 3D illustrations float on a pastel tile |
| Status badges | orders (placed, accepted, ready, completed, declined, cancelled), accounts (active, pending, suspended, inactive), products (available, sold out, unavailable, removed) |
| KPI cards | icon on the left, label, value, sub-text (one line on laptops, up to two lines on phones); first card is the dark "lead" card |
| App shell | one layout for the customer, farmer and admin areas: flat forest sidebar (no gradient) with section labels, lime active marker and counters; icon-only collapsed mode with tooltips |
| DataTables grid | rounded table, cream header, pill search box, CSV / Excel / Print buttons, forest pagination, responsive child rows on phones |
| Filter bar | small uppercase labels over compact selects, date and number inputs; "Clear n filters" link |
| Avatar | round photo (profile upload) or initials; sizes sm / default / lg / xl |
| Write with AI | pill button with a lime gradient and the `bi-stars` icon next to the description field (product descriptions and "Generate with AI" farm descriptions) |
| Password field | one eye button inside the field to show or hide the password; the browser's own reveal button is hidden |
| Product gallery | main photo with arrows and a "1 / 3" counter, thumbnails below, swipe on phones, credit line follows the photo |
| Report link | small muted "Report" link with a flag icon under reviews, listings and stall pages; opens a reason dialog |
| Basket sidebar | slides in from the right over a dimmed page; farmer groups, small quantity steppers, cream footer with the total, Checkout and View full basket |
| Quick view | "Quick view" pill appears on the product photo on hover (always visible on touch screens); dialog with gallery, price, stock, farmer and add to basket |
| Photo zoom | the product photo is magnified 2× under the mouse; a full-screen viewer opens on click (arrows, Escape) |
| Dropdown with search | looks like a normal select; opens a small menu with a search box, highlighted option and a tick on the chosen value |
| Review badges | green "Verified purchase" pill with a check, grey "Unverified" pill |
| Social links | round icon buttons (Facebook, Instagram, X, YouTube, WhatsApp, LinkedIn) in the footer and on the Contact page |
| Panels and tables | white panels with 1 px line border; tables scroll sideways on small screens instead of squeezing names |
| Modal / drawer | backdrop blur, Escape to close; the mobile drawer is portalled to `<body>` so it never sits inside the sticky header |
| Toasts | bottom centre, above the tab bar on phones |
| Chat widget | forest header, lime "Remembers" strip showing the assistant's memory, product cards, suggestion chips, Clear chat confirmation |

## 5. Logo, icons and imagery

- **Logo:** designed in Canva (design "MarketLink logo", basket with a leaf and handle in a rounded
  frame) and rebuilt as SVG so it stays sharp: `client/public/brand/marketlink-mark.svg`, favicons,
  `marketlink-logo.png` / `marketlink-logo-white.png` and the e-mail header logo. Wordmark:
  bold "Market" in forest `#0d3017` + italic "Link" in leaf green `#268d3a` (lime on dark).

- **Icons:** Bootstrap Icons only. The interface uses no emoji; wherever a symbol is needed
  (stars, location pins, warnings, success states) a Bootstrap icon is used. The assistant sends
  `{{icon:name}}` tokens that the chat renders as icons.
- **Product photos:** real photos from the Open Images Dataset (Flickr, CC BY 2.0), cropped to
  4:3, 800 × 600 WebP. The photographer is credited on the product page and in
  `server/uploads/photos/CREDITS.md`. Farmers can upload their own photo instead.
- **Illustrations:** Microsoft Fluent 3D illustrations (MIT) are used as decoration: the login and
  sign-up banner, home hero, category icons, farmer logos and market cards.
- Farmer pages without a cover photo show three of the farmer's product photos as tilted prints.

## 6. Motion

| Animation | Where |
| --- | --- |
| `pageIn` | every route change (fade + rise) |
| `riseIn` | home hero bento cards, staggered |
| Scroll reveal (`.reveal` + IntersectionObserver) | cards and section headings fade up when they scroll into view |
| Count-up | home and About statistics count from 0 when visible |
| `floaty`, `popIn`, `glowPulse`, `twinkle` | floating produce ring on the auth banner, with mouse parallax |
| `countPop` | basket and tab-bar counters when the number changes |
| `drawerIn` | mobile drawer slides in from the right |
| `shimmer` | loading skeletons |
| `pulse` | chat launcher ring |

All animations are disabled when the device asks for reduced motion, and scroll-revealed content
is always visible when printing.

## 7. Accessibility

- Skip-to-content link, visible focus rings, labelled icon buttons (`aria-label`), `aria-expanded`
  on toggles, dialogs with `aria-modal`.
- Text colours meet contrast on cream and white; icons are decorative (`aria-hidden`) next to text.
- Forms show clear validation messages; the farmer wizard returns to the step that has the error.

## 8. Copy style

Short, friendly and practical: "Pre-order. Pick up. Pay in person." Use the user's words
(basket, pickup, stall, market day), name buttons by what they do ("Add to basket", "Send reset
link", "Clear chat") and explain errors with the fix ("Please pick a later slot").
