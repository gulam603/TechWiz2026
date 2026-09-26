# MarketLink – ReadMe

> The SRS asks for a ReadMe.doc with the assumptions made by the team. This file (and `ReadMe.docx`) is
> that document. It was drafted with Claude Code from the project itself; please check it and add your
> team's own notes before submitting.

## 1. What is in the submission

| Item | Where |
| --- | --- |
| The web application (React client, Node.js / Express server) | `MarketLink/client`, `MarketLink/server` |
| Database scripts (MongoDB, instead of .sql) | `MarketLink/database/marketlink-schema.mongodb.js` and `MarketLink/database/sample-data/*.json` |
| Project report | `MarketLink/docs/MarketLink-Project-Report.docx` (and `.pdf`) |
| Test plan and test report | `MarketLink/docs/MarketLink-Test-Report.docx` (and `.pdf`) |
| Technical notes | `MarketLink/docs/architecture.md`, `design.md`, `view.md`, `task.md` |
| Screenshots of every page | `screenshots/` (in the Complete zip) |
| Installation and credentials in short | `MarketLink/README.md`, `HOW-TO-RUN.txt` |
| Demo video (.mp4) | to be recorded by the team (SRS 1.9) |

## 2. How to run

1. Install Node.js 20 or newer and MongoDB (or use a free MongoDB Atlas database).
2. In the `MarketLink` folder run `npm run install:all`.
3. Copy `server/.env.example` to `server/.env`; set `MONGO_URI` and `JWT_SECRET`.
4. Run `npm run seed` to load the demo data.
5. Run `npm run dev` and open http://localhost:5173 (or `npm run build` and `npm start`, then http://localhost:5000).

## 3. User credentials

| Role | E-mail | Password |
| --- | --- | --- |
| Administrator | admin@marketlink.com | Admin@123 |
| Farmer | farmer@marketlink.com | Farmer@123 |
| Farmer waiting for approval | pending.farmer@marketlink.com | Farmer@123 |
| Customer | customer@marketlink.com | Customer@123 |
| Customer (family member) | omar@marketlink.com | Customer@123 |

More accounts are listed in the project report, section 7.

## 4. Assumptions

1. **Payment** is made in person to the farmer at pickup; there is no online payment (SRS 1.5).
2. **Pickup only**; there is no delivery or courier service (SRS 1.5).
3. **Farmer identity** and claims such as "organic" or "pesticide-free" are not verified by the platform
   (SRS 1.5); the admin only approves or suspends stalls.
4. **One time zone** (Asia/Karachi) is used for market days, pickup slots, cut-off times and "today".
5. **The e-mail address is the login name**; one login page serves customers, farmers and administrators.
6. **MongoDB** is used (MERN stack), so the database is described by a `mongosh` script and JSON sample
   data instead of `.sql` files.
7. **OpenStreetMap** with Leaflet is used for maps (the SRS allows Google Maps API or OpenStreetMap);
   directions use the free OSRM service and a Google Maps link.
8. **An order belongs to one farmer and one pickup slot.** A basket with products from two farmers
   becomes two pre-orders, each with its own slot.
9. **Stock is reserved when a pre-order is placed** and returned when it is declined or cancelled.
10. **Customers can change or cancel** an order only before the farmer's cut-off time (set by each
    farmer, in hours before the pickup slot).
11. **Reviews are verified** when they come from a customer who collected the order; the customer first
    confirms "Did you receive your order?".
12. **Guests can check out**; an account is created for them and the password is e-mailed.
13. **E-mail** is sent through the SMTP server in `server/.env`; without one, e-mails are printed in the
    server window so the app still works during a demo.
14. **Stock photos** are from the Open Images Dataset (CC BY 2.0). Their photographers are listed on the
    website's Photo credits page instead of on the photos.
15. **Languages:** English and Urdu for public, customer and farmer pages; the admin area is in English.

## 5. AI tools used

| Tool | Used for |
| --- | --- |
| Claude Code (Anthropic) | Coding assistant during development and tests; first drafts of the documents |
| Canva | Logo |
| EDSR super-resolution (OpenCV) | Larger copies of the banner photos |
| *(add any other tools your team used)* | |
