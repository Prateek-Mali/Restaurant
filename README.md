# Ember & Oak — QR Restaurant Ordering System

A QR-based restaurant ordering platform. Customers scan a QR code at their table to open a live digital menu, place orders directly from their phone, and pay their bill at the end — no app download, no login required. Orders go straight to the kitchen in real time, and the restaurant owner has full control over the menu, tables, staff, and revenue from an admin dashboard.

## How it works

1. Customer scans the QR code on their table
2. It opens that table's menu directly (`/menu/:tableId`) — no login needed
3. Customer browses the menu, adds items to cart, and places the order
4. The order appears instantly on the kitchen dashboard
5. Chef updates the order status as it's prepared (Preparing → Ready → Served)
6. The customer sees live status updates on their own screen
7. Once served, the customer gets an itemized bill and pays online from their phone

## Roles

- **Customer** — no account. Identified only by the table they scanned. Can browse the menu, order, track status, and pay.
- **Chef** — logs in. Sees live incoming orders and updates their status.
- **Admin (Owner)** — logs in. Manages the menu, tables (and their QR codes), staff accounts, and views revenue/analytics.

## Tech stack

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Socket.io for real-time order updates
- JWT authentication (chef/admin only)
- Razorpay for payments

**Frontend**
- React (Vite)
- Tailwind CSS
- Socket.io client
- Axios

## Project structure

```
Restaurant/
├── backend/
│   └── src/
│       ├── config/        # DB + Socket.io setup
│       ├── models/        # User, Table, MenuItem, Order, Payment
│       ├── controllers/
│       ├── routes/
│       ├── middleware/    # auth, error handling
│       ├── sockets/       # real-time event definitions
│       └── utils/         # QR code generation
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── customer/  # Menu, Cart, OrderStatus, Bill
        │   ├── chef/      # KitchenDashboard
        │   └── admin/     # Dashboard, ManageMenu, ManageTables, ManageStaff
        ├── components/
        ├── context/       # Socket, Auth, Cart state
        ├── hooks/
        └── services/      # API calls
```

## Getting started

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/` with:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

```bash
npm run dev
```

## Status

🚧 In active development.

- [x] Backend architecture and folder structure
- [x] Frontend folder structure
- [x] Admin panel UI
- [ ] Chef kitchen dashboard UI
- [ ] Customer ordering flow — connected to backend
- [ ] Payment integration
- [ ] Deployment
