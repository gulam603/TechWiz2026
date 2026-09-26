# MarketLink – Test Plan and Test Report

**TechWiz 2026 · End-to-End Web Solutions · Team Omniverse**

> **Note for the team.** This report was drafted by Claude Code (an AI coding assistant) from the real
> automated test runs listed in section 6. The SRS does not allow fully AI-made documentation, so please
> review it, repeat some of the manual checks yourselves, write the conclusions in your own words and keep
> the AI tool in your list of AI tools used.

---

## 1. Purpose and scope

This document describes how MarketLink was tested and what the results were. It covers every functional
requirement of SRS section 1.6 (customer, farmer, admin and other features), the non-functional
requirements of section 1.7 (responsive design, compatibility, security, usability) and the extra
features added by the team (Urdu, the AI assistant in three languages, restock reminders, receipt
confirmation, best sellers, the offer banner and others).

Out of scope, as in the SRS: online payment, delivery and verification of farmer licences.

## 2. Test approach

| Level | What is tested | How |
| --- | --- | --- |
| API tests | Every REST endpoint: correct answers, input checks, error messages, role checks (guest / customer / farmer / admin), rate limits | Node.js scripts that call the running server and compare the answers (`PASS` / `FAIL` per check) |
| Browser tests (end to end) | Complete user journeys in a real browser: register, log in, browse, filter, map, basket, checkout, orders, reviews, farmer and admin work | Playwright driving Chromium against the built app |
| Responsive tests | Every page at many screen widths in English and Urdu: nothing sticks out, no sideways scrolling | Playwright at widths from 320 to 1920 px |
| Regression tests | English text unchanged by the Urdu work; old features still working after each round of changes | The full set of suites run again after every round |
| Manual checks | Look and feel, screenshots of every page, e-mails in a local SMTP inbox | Screenshots reviewed page by page |
| Static checks | Code style and common mistakes | ESLint on the server and the client |

**Test data:** the demo data made by `npm run seed` (project report, section 5). The database is seeded
again before every suite, so each suite starts from the same data.

## 3. Test environment

| Item | Value |
| --- | --- |
| Operating system | Linux (container), 4 CPU cores |
| Node.js | 22 |
| Database | MongoDB 8 (also run earlier against FerretDB, a MongoDB-compatible database) |
| Browser | Chromium (Playwright) at desktop, tablet and phone sizes, with touch for phones |
| Server | The production build (`npm run build`, `npm start`) on port 5000, time zone Asia/Karachi |
| E-mail | A local SMTP server that stores every e-mail, so e-mails can be checked without sending them |
| Maps | Map tiles replaced by a local image during tests (the tests do not depend on the internet) |

## 4. Entry and exit criteria

- **Entry:** the build succeeds, ESLint reports no errors, the demo data loads.
- **Exit:** every automated check passes; any failure is either fixed in the code or, when the test
  itself expected old behaviour that was changed on purpose, the test is updated and the reason written
  down (section 7).

---

## 5. Test cases

Status: **Pass** means the case passed in the final run (section 6). The "Suite" column names the
automated test that covers the case.

### 5.1 Customer features

| ID | Requirement (SRS 1.6) | Steps | Test data | Expected result | Status | Suite |
| --- | --- | --- | --- | --- | --- | --- |
| C-01 | Customer registration | Open `/register`, fill every field, accept the terms, submit | New User, new@x.com, +92 300 1234567, Passw0rd | Account made, customer logged in and taken to the dashboard | Pass | smoke, e2e2 |
| C-02 | Registration checks | Submit with an empty name, a wrong e-mail, a short password, no terms | noterms@x.com and similar | Each is refused with a clear message; no account is made | Pass | smoke, e2e2 |
| C-03 | Phone number with country | Type a Pakistani number in the phone box | +92 321 5551234 | Flag and dial code shown; saved as +923215551234 | Pass | r10test, phone test |
| C-04 | Login and logout | Log in with the demo customer, log out | customer@marketlink.com / Customer@123 | Dashboard opens; after logout protected pages ask to log in | Pass | smoke, e2e |
| C-05 | Wrong password / blocked account | Log in with a wrong password; with the deactivated customer | inactive.customer@marketlink.com | Refused with a message; blocked account cannot log in | Pass | smoke |
| C-06 | Forgot password | Ask for a reset link, open it, set a new password | customer@marketlink.com | Link e-mailed, valid 30 minutes, new password works, old one does not | Pass | fp |
| C-07 | Favourite farmers and products | Press the heart on a farmer and a product, open Favourites | Malir Green Fields, Sindhri Mangoes | Both listed in Favourites; heart can be pressed again to remove | Pass | smoke, r4test |
| C-08 | Family sharing (optional) | Add a family member, log in as the member | omar@marketlink.com | Member sees the shared household orders | Pass | smoke, api4 |
| C-09 | Browse markets by location and day | Open `/markets`, choose a day, a city, "near me" | Karachi, Saturday | Only matching markets; the page opens on the markets open today | Pass | audit3, r10test |
| C-10 | Farmers at a market | Open a market page | Clifton Seaview Farmers Market | Farmers listed in a scroll box with "at the market today" status | Pass | r10test |
| C-11 | Farmer profile | Open a farmer page | Malir Green Fields | Stall name, location, days, pickup windows, this week's stock, reviews | Pass | e2e, r4test |
| C-12 | Map with markers and directions | Open `/map`, choose a market, ask for directions | Clifton market | Markers for markets and stalls; route drawn; Google Maps link | Pass | e2e2 |
| C-13 | Categories and filters | Filter products by category, price, market, day, rating and offers | Fruits, Rs 100 to 500 | Only matching products; active filters shown as removable chips | Pass | smoke, r10test |
| C-14 | Search while typing | Type in the shop search without pressing Enter; press X | "mango" | Results change after a short pause; X clears the box and the results | Pass | r10test |
| C-15 | Navbar search suggestions | Type part of a word in the top search | "hon" | Suggestions (products, farmers, markets) appear after a short pause | Pass | r10test |
| C-16 | Grid and list view | Switch the shop between grid and list | | Products shown as cards or as rows | Pass | r10test |
| C-17 | Product details | Open a product page | Sindhri Mangoes | Price, unit, quantity left, farmer, photos, reviews | Pass | smoke, r7test |
| C-18 | Add to basket | Press Add, choose an amount, add | 3 × a product | Basket count goes up; a toast offers "View basket"; the basket does not open by itself | Pass | r7test, r10test |
| C-19 | Pre-order with pickup slot | Check out, choose a pickup date and slot for each farmer | Next free slot | Order placed, stock reserved, confirmation page `/checkout/<order number>` that can be bookmarked | Pass | e2e, r5test, r10test |
| C-20 | Slot and stock checks | Order more than the stock, or after the cut-off | Quantity above stock | Refused with a message; nothing is reserved | Pass | smoke, audit3 |
| C-21 | Guest checkout | Check out without an account | A new e-mail | Account made, password e-mailed, toast "we sent your password to your email" | Pass | r5test |
| C-22 | View, modify, cancel orders | Open an order, change the amount or slot, cancel | An order before its cut-off | Changes saved; cancelled order returns the stock; after the cut-off changes are refused | Pass | smoke, e2e |
| C-23 | Order history and reorder | Open My orders, press "Order again" | A completed order | Past orders listed; items go back into the basket | Pass | smoke, r4test |
| C-24 | Restock reminder | On a sold-out product press "Remind me" (as guest with an e-mail, and as customer) | A sold-out product | Reminder saved; refused for a product in stock; notification and e-mail when restocked | Pass | r10test |
| C-25 | AI assistant | Ask about timings, farmers, products in English, Urdu and Roman Urdu | 15 questions (section 5.4) | Correct answer from live data in the language asked | Pass | r10test, r8api |
| C-26 | Receipt confirmation | After the farmer completes an order, answer "Did you receive your order?" | Demo customer's unconfirmed pickup | Yes → review form opens; No → farmer and admin told | Pass | r10test |
| C-27 | Reviews and ratings | Rate a farmer and a product after pickup | 4 stars and a comment | Review shown as a verified purchase; rating updated | Pass | e2e, r4test |
| C-28 | See reviews before ordering | Open product and farmer pages | | Reviews and average rating visible to everyone | Pass | r8test |
| C-29 | Notifications | Place and update an order | | In-app notification and e-mail for placed, accepted, ready, completed | Pass | smoke, e2e |

### 5.2 Farmer features

| ID | Requirement (SRS 1.6) | Steps | Test data | Expected result | Status | Suite |
| --- | --- | --- | --- | --- | --- | --- |
| F-01 | Farmer registration | Fill the sign-up wizard (account, stall, farm, markets, pickup days) | A new stall | Account made with status "pending"; selling features locked until approved | Pass | wizard, apitools, r4test |
| F-02 | Profile with markets, days, windows and map pin | Edit profile, set a map pin, pickup windows and slot size | Latitude / longitude from the map | Saved and shown on the public profile and the map | Pass | e2e2 |
| F-03 | Add, edit, view, delete products | Manage products with photos | A new product with an image | Product listed in the shop; edits and deletes take effect | Pass | smoke, r4test |
| F-04 | Weekly stock template | Set a recurring weekly amount | 20 kg a week | Stock is refilled each week; history shows the template run | Pass | smoke |
| F-05 | Sold out / unavailable | Mark a product sold out or hidden | | Sold out shows "Remind me"; hidden products disappear from the shop | Pass | smoke, r4test, r10test |
| F-06 | Low-stock alert | Let stock drop below the threshold | Threshold 5 | Notification and e-mail to the farmer | Pass | api4 |
| F-07 | Handle pre-orders | Accept, decline (with a reason), mark ready, complete | Upcoming orders | Status changes; customer told each time; decline returns stock; buttons show a spinner while working | Pass | e2e, smoke |
| F-08 | Cut-off time and slots | Change the cut-off hours and slot capacity | 12 hours, 3 per slot | Checkout offers only allowed slots | Pass | audit3 |
| F-09 | Closed dates / not coming today | Add a closed date; press "I cannot come today" | Next Friday; today | Customers see it on the farmer and market pages; customers with a pickup are told | Pass | e2e2, r10test |
| F-10 | Order history and insights | Open the dashboard and sales page | | Total orders, pending orders, revenue, best-selling products, charts | Pass | api4, r4test |
| F-11 | Reply to reviews | Write a reply to a review | | Reply shown under the review | Pass | smoke, r8test |

### 5.3 Admin and other features

| ID | Requirement (SRS 1.6) | Steps | Test data | Expected result | Status | Suite |
| --- | --- | --- | --- | --- | --- | --- |
| A-01 | Separate admin dashboard | Log in as admin | admin@marketlink.com / Admin@123 | Admin layout with totals of farmers, customers, markets, orders | Pass | adminui |
| A-02 | Approve or suspend farmers | Approve the pending farmer; suspend one with a reason | Sunny Acres Poultry | Status changes; farmer e-mailed; customers of that market told about a new farmer | Pass | audit3, apitools |
| A-03 | Activate or deactivate customers | Deactivate and activate a customer | | Deactivated customer cannot log in | Pass | smoke |
| A-04 | Manage markets and cities | Add, edit, remove a market with map position | A new market | Market shown on the map and in lists | Pass | apitools |
| A-05 | Content moderation | Remove a product listing and a review; handle a report | Reported review | Removed content disappears from the site | Pass | api4, r4test |
| A-06 | Reports | Open the reports page, export CSV | Last 30 days | Total orders, revenue by market, most active farmers | Pass | api4, adminui |
| A-07 | Farmer rankings | Rank farmers by revenue, rating, orders | | Ranked table; admins only | Pass | r10test |
| A-08 | Categories and announcements | Add a category; publish a seasonal announcement | Mango season, May to August | Category in filters; announcement shown only in its months | Pass | apitools, r6api |
| A-09 | Offer banner | Change the percent, headline, photo and link; hide it | 45%, "Up to {percent}% off summer mangoes" | Home page shows the new banner; outside links and percent over 90 refused; customers cannot change it | Pass | r10test |
| A-10 | Contact messages by topic | Send a message with a topic; filter the admin inbox | Request a new market | Message saved with its topic; the filter shows only that topic | Pass | r10test |
| O-01 | Role-based access | Call customer, farmer and admin endpoints with the wrong role or no login | | 401 without login, 403 with the wrong role | Pass | smoke, audit3 |
| O-02 | Search, sort, filter with map | Search markets, farmers, products; sort; use the map | | Correct results and markers | Pass | smoke, e2e2 |
| O-03 | Responsive design | Open every page at many widths | 320 to 1920 px | No sideways scrolling, nothing cut off; phone bottom bar on every page; dialogs as bottom sheets | Pass | resp8, r10test |
| O-04 | Notifications on phones | Open the bell on a 360 px phone | | Menu fits the screen | Pass | r10test |
| O-05 | About us and contact us | Open `/about` and `/contact` | | Team information; contact details with a map; topic chosen from the link | Pass | r3test, r10test |
| O-06 | Urdu | Switch to Urdu on every public, customer and farmer page | | All text in Urdu, layout mirrored right to left, no English left | Pass | r8test, resp8, r10test |
| O-07 | Photo credits | Check banners, product, farmer and market pages; open `/credits` | | No credits on the photos; the credits page lists every photographer | Pass | r10test |

### 5.4 AI assistant questions

| ID | Question | Language | Expected answer | Status |
| --- | --- | --- | --- | --- |
| AI-01 | which farmer is highly rated | English | The highest-rated farmer (Malir Green Fields, 4.55 from 56 reviews) and a top-5 list | Pass |
| AI-02 | sab se acha kisan kaunsa hai? | Roman Urdu | Same as AI-01 | Pass |
| AI-03 | سب سے اچھی ریٹنگ والا کسان کون ہے؟ | Urdu | Same, written in Urdu | Pass |
| AI-04 | tamatar kahan milega | Roman Urdu | Vine Tomatoes, price, farmer and pickup days | Pass |
| AI-05 | sab se sasti sabzi | Roman Urdu | The five cheapest vegetables in stock | Pass |
| AI-06 | zyada bikne wali cheezen | Roman Urdu | Top 5 best sellers with a link to the best sellers page | Pass |
| AI-07 | kitne kisan hain | Roman Urdu | Number of approved farmers | Pass |
| AI-08 | kaun se shehar mein mandi hai | Roman Urdu | Cities with their number of markets | Pass |
| AI-09 | any offers this week? | English | Products on offer with the percent off | Pass |
| AI-10 | markets open now | English | Markets open at this moment, or the ones opening later today | Pass |
| AI-11 | what can I buy | English | Categories with the number of items in stock | Pass |
| AI-12 | password bhool gaya | Roman Urdu | How to reset the password, with a link | Pass |
| AI-13 | I want to complain about a market | English | Contact page with the topics | Pass |
| AI-14 | top rated fruits in karachi | English | Top-rated fruits sold at Karachi markets | Pass |
| AI-15 | is Malir Green Fields at the market today? | English | Whether the farmer is there now, later today, has left, or is away | Pass |
| AI-16 | how do I leave a review | English | The receipt question and the review form | Pass |
| AI-17 | mera naam kya hai | Roman Urdu | Asks for the name instead of saving a wrong one | Pass |

---

## 6. Test results

{{RESULTS}}

## 7. Defects found and fixed

Serious or visible problems found by the tests during development, and how they were fixed:

| # | Defect | Found by | Fix |
| --- | --- | --- | --- |
| 1 | Pages with a saved phone number (the customer profile) showed a blank page: the phone box asked for the full number before its number rules had loaded | r10test (bottom bar on the profile page) | The phone box uses the typed number until the rules are loaded |
| 2 | "Did you receive your order?" pop-up could cover the dashboard for every test user | Regression (older tests) | Expected behaviour for the demo customer; older tests skip that question, r10test checks it |
| 3 | The basket side panel shook when it opened | Manual check | The page keeps space for the scroll bar and the panel is focused without scrolling |
| 4 | The notification menu went off the left edge on phones | Responsive test | Full-width menu under the bell on phones |
| 5 | The assistant read "mera naam kya hai" as a new name ("What") | Assistant test | Roman Urdu phrase for "what's my name" added |
| 6 | "Top rated fruits in Karachi" was read as the farmer "Karachi Artisan Bakehouse" | Assistant test | A city name alone no longer picks a farmer |
| 7 | Map tiles were blocked (HTTP 403) | Manual check | Correct referrer policy and a second tile server as fallback |
| 8 | The home banner did not change by itself | Manual check (round 9) | Autoplay timer fixed; it pauses only with the pause button or keyboard focus |
| 9 | Farmer inventory page failed with a database error on an older database | API test against MongoDB | Query rewritten to work with the stored data |

**Tests changed on purpose** (the behaviour was changed at the customer's request, not a defect):

- Adding to the basket no longer opens the basket; the old tests now open it from the toast's
  "View basket" button.
- After checkout the address is `/checkout/<order number>` instead of `/checkout/success`.
- The markets page opens on the markets open today.
- The home page trust row, category heading and banner classes changed with the redesign.

## 8. Known limitations

- Tests ran in Chromium only; Firefox and Safari were not tested automatically. The site uses standard
  features, but a short manual check in those browsers is recommended before the final demo.
- Real e-mail delivery depends on the SMTP details in `server/.env`; the tests use a local SMTP server.
- Maps need an internet connection for the map tiles; directions use the free OSRM service.
- The AI assistant is rule-based; very unusual questions get a polite "I couldn't find an answer" with
  suggestions.

## 9. Conclusion

{{CONCLUSION}}
