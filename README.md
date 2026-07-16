# Ember & Oak — QR Restaurant Ordering System

A QR-based restaurant ordering platform. Customers scan the QR code on their table to open a live menu, order from their phone, and track their food in real time — no app, no login. Orders hit the kitchen display instantly, and the owner manages the menu, tables, staff, and revenue from an admin dashboard.

**Live demo**
- App → https://restaurant-rho-blush.vercel.app
- API → https://restaurant-t2vj.onrender.com

> The API runs on Render's free tier and sleeps after ~15 minutes of inactivity. The first request may take ~50 seconds to wake it up.

---

## How it works

1. Customer scans the QR code on their table → opens `/menu/:tableId` directly, no login
2. They browse the menu, add items to a cart, and place the order
3. The order appears on the kitchen display **instantly** (Socket.IO) with a sound alert
4. Chef advances it: **Placed → Preparing → Ready → Served**
5. The customer watches the status update live on their own phone
6. Order more? It adds to the same running tab — the bill accumulates across rounds
7. Chef confirms payment from the **Payments** tab, which settles the bill and frees the table

## Roles

| Role | Auth | Can do |
|---|---|---|
| **Customer** | None — identified only by the scanned table | Browse menu, order, track status, view bill |
| **Chef** | JWT login | See live orders, advance status, confirm payments |
| **Admin** | JWT login | Everything above + manage menu, tables/QRs, staff, revenue |

---

## Tech stack

**Backend** — Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT + bcrypt, `qrcode`, Razorpay

**Frontend** — React 18, Vite, React Router, Axios, socket.io-client

---

## Project structure

```
.
├── backend/
│   ├── server.js              # entry — starts HTTP + Socket.IO
│   └── src/
│       ├── config/            # db.js, socket.js (rooms: kitchen, table:<id>)
│       ├── models/            # User, Table, MenuItem, Order, Payment
│       ├── controllers/       # auth, menu, table, order, payment
│       ├── routes/            # Express routers
│       ├── middleware/        # auth (protect / restrictTo), errorHandler
│       ├── sockets/           # event name constants
│       └── utils/             # generateQR.js
└── Frontend/
    └── src/
        ├── pages/             # customer/  chef/  admin/
        ├── components/        # customer/  chef/  admin/  layout/
        ├── context/           # Auth, Socket, Cart
        ├── services/          # axios API clients
        └── hooks/
```

---

## Running locally

**Prerequisites:** Node.js 18+ and a MongoDB database (local or [Atlas](https://www.mongodb.com/atlas)).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then fill in your values
npm run dev
```

### 2. Frontend

In a second terminal:

```bash
cd Frontend
npm install
cp .env.example .env      # then fill in your values
npm run dev
```

Open http://localhost:5173

### Environment variables

**`backend/.env`**

| Variable | Required | Notes |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Any long random string |
| `FRONTEND_URL` | ✅ | Base URL baked into QR codes — **must be reachable by the scanning phone** |
| `PORT` | — | Defaults to 5000. Hosts like Render set this automatically |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | — | Omit to disable online payment (falls back to pay-at-counter) |

**`Frontend/.env`**

| Variable | Required | Example |
|---|---|---|
| `VITE_API_URL` | ✅ | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | ✅ | `http://localhost:5000` |

> Vite inlines these at **build** time. Changing them requires a rebuild — not just a restart.

### Creating the first admin

On an **empty database**, `POST /api/auth/register` creates the first account as admin with no token required. Once any user exists, the endpoint locks down to admin-only.

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Owner","email":"owner@example.com","password":"yourpassword"}'
```

Then sign in at `/chef/login` — admins land on `/admin`, chefs on `/chef`.

### Testing the QR flow from a real phone

`localhost` won't work — on a phone it resolves to the phone itself. Use your machine's LAN IP:

```bash
# backend/.env
FRONTEND_URL=http://192.168.x.x:5173

# Frontend/.env
VITE_API_URL=http://192.168.x.x:5000/api
VITE_SOCKET_URL=http://192.168.x.x:5000
```

Vite already binds to `0.0.0.0` (`host: true`), so a phone on the same Wi-Fi can reach it.

---

## API reference

Protected routes require `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint | Access |
|---|---|---|
| `POST` | `/api/auth/login` | Public |
| `POST` | `/api/auth/register` | Admin (public only if DB is empty) |
| `GET` | `/api/auth/me` | Authenticated |
| `GET` | `/api/auth/staff` | Admin |
| `PATCH` | `/api/auth/staff/:id/toggle-active` | Admin |
| `DELETE` | `/api/auth/staff/:id` | Admin |

### Menu
| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/api/menu` | Public — available items only |
| `GET` | `/api/menu/all` | Admin — includes unavailable |
| `POST` `PUT` `DELETE` | `/api/menu/:id?` | Admin |
| `PATCH` | `/api/menu/:id/toggle-availability` | Admin / Chef |

### Tables
| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/api/tables/resolve/:tableId` | Public — used by the scanned menu page |
| `GET` `POST` `DELETE` | `/api/tables/:id?` | Admin |
| `PATCH` | `/api/tables/:id/regenerate-qr` | Admin — rotates the table's secret id |

### Orders
| Method | Endpoint | Access |
|---|---|---|
| `POST` | `/api/orders` | Public — place an order |
| `GET` | `/api/orders/table/:tableId` | Public — that table's orders |
| `GET` | `/api/orders/kitchen` | Admin / Chef — active orders |
| `GET` | `/api/orders/open-tabs` | Admin / Chef — unpaid bills grouped by table |
| `PATCH` | `/api/orders/checkout/:tableId` | Admin / Chef — settle bill, free table |
| `PATCH` | `/api/orders/:id/status` | Admin / Chef |
| `GET` | `/api/orders` | Admin — all orders, date-filterable |

### Payments
| Method | Endpoint | Access |
|---|---|---|
| `POST` | `/api/payments/initiate` | Public |
| `POST` | `/api/payments/verify` | Public — gateway callback |
| `GET` | `/api/payments/revenue` | Admin |

### Health
`GET /api/health` → `{ "success": true, "message": "OK", "database": "connected" }`

---

## Real-time events (Socket.IO)

Clients join rooms: `kitchen` (staff) and `table:<tableId>` (a single customer's table).

| Event | Fired when | Sent to |
|---|---|---|
| `new_order` | Order placed | `kitchen` + that table |
| `order_status_updated` | Chef advances status | `kitchen` + that table |
| `payment_updated` | Bill settled | `kitchen` + that table |

Clients rejoin their room on every reconnect and resync from the API, so a dropped connection or server restart can't silently lose orders.

---

## Design notes

**QR codes are generated on read, not stored.** The image is derived from `tableId` + the current `FRONTEND_URL` on every request. Storing it meant saved QRs silently broke whenever the site URL changed. Now, updating `FRONTEND_URL` fixes every table's QR instantly — nothing to regenerate or reprint.

**Order items are snapshotted.** Each order saves the item's name and price at purchase time, so editing the menu later never rewrites historical orders or bills.

**Bills accumulate per table.** The bill is the sum of *all* unpaid orders for a table, not just the latest — a second round adds to the tab rather than replacing it. Checkout settles them together and frees the table.

**`tableId` is a UUID, not the table number.** Table 5's QR encodes a random uuid, not `5` — so customers can't reach another table by editing the address bar.

---

## Deployment

| Part | Host | Notes |
|---|---|---|
| Frontend | **Vercel** | Root dir `Frontend`. Set `VITE_API_URL` + `VITE_SOCKET_URL`, then **redeploy** (Vite inlines them at build time) |
| Backend | **Render** | Root dir `backend`, build `npm install`, start `npm start`. Set `FRONTEND_URL` to the Vercel URL |
| Database | **MongoDB Atlas** | Allow `0.0.0.0/0` under Network Access so the host can connect |

Vercel can't host the backend — it runs serverless functions, which can't hold the persistent Socket.IO connections this app depends on.

---

## Status

Working end to end and deployed.

- [x] Backend API, auth, and role-based access
- [x] Real-time kitchen display with sound alerts
- [x] Customer flow — QR → menu → cart → order → live status → bill
- [x] Admin panel — menu, tables/QR, staff, revenue
- [x] Running tabs + chef-confirmed checkout
- [x] Deployed (Vercel + Render + Atlas)
- [ ] Razorpay checkout — API wired, customer-facing modal unfinished
- [ ] Automated tests
- [ ] Dedicated waiter role/screen

## Known limitations

- **Free-tier cold starts.** The API sleeps after ~15 min idle; the first request takes ~50s.
- **Online payment is incomplete.** `/api/payments/initiate` creates a Razorpay order, but the frontend checkout modal and the signature-verification round-trip aren't finished. Without Razorpay keys set, the app cleanly falls back to "pay at the counter," which staff confirm from the Payments tab.
- **No test suite.** Verification so far has been manual.
- **Styling is inline.** Components use inline style objects rather than a CSS framework.
