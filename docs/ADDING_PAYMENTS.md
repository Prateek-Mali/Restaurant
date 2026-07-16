# Handoff: Finishing the Online Payment System

**Read this before touching payment code.** It explains what exists, what's deliberately unfinished, and the one architectural trap that will silently overcharge/undercharge customers if you miss it.

Estimated effort: **half a day** if you follow this. Longer if you don't read the trap section.

---

## 1. What works today

**Cash / counter payment is fully working.** Do not break this — it's the only payment path currently in production use.

The flow:
1. Customer eats, taps **View bill** → sees the total of all their unpaid orders
2. Customer pays staff physically (cash/UPI/card at the counter)
3. Chef opens the **Payments** tab → sees the table's combined bill → taps **Mark as Paid** → confirms
4. `PATCH /api/orders/checkout/:tableId` marks **all** unpaid orders `paid`, frees the table, and emits `payment_updated`
5. Customer's phone updates live to a "Thank you" screen

The relevant code:
- `backend/src/controllers/orderController.js` → `checkoutTable()` ← **this is the correct reference implementation**
- `Frontend/src/pages/chef/Payments.jsx`

## 2. What's unfinished

Online (Razorpay) payment. Roughly half-built:

| Piece | State |
|---|---|
| `Payment` model | ✅ Exists (`backend/src/models/Payment.js`) |
| `POST /api/payments/initiate` | ⚠️ Creates a Razorpay order — but **for one order, not the tab** (see §3) |
| `POST /api/payments/verify` | ⚠️ Verifies signature — but **only marks one order paid, doesn't free the table** |
| Razorpay checkout modal (frontend) | ❌ Does not exist |
| Webhook handling | ❌ Does not exist |
| Testing | ❌ Never run against real Razorpay credentials |

Without `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` set, `initiatePayment` returns a clean `503` and the UI falls back to "pay at the counter." That fallback is intentional — **keep it working** for when the gateway is down.

---

## 3. ⚠️ THE TRAP — read this twice

**A bill is not an order.**

This app supports *running tabs*. A customer orders pizza, gets served, then orders pasta later. That's **two `Order` documents on one `Table`**, and the bill is the **sum of all unpaid orders for that table**.

But the payment code is built **per-order**:

```js
// backend/src/models/Payment.js
order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true }
//     ^^^^^ ONE order. Not the tab.
```

```js
// Frontend/src/pages/customer/Bill.jsx  → handlePay()
await paymentService.initiatePayment(orders[0]._id, 'card');
//                                   ^^^^^^^^^^^^^ only the FIRST order!
```

**If you wire the Razorpay modal to this as-is:**
- Customer sees a bill of ₹550 (pizza ₹350 + pasta ₹200)
- Razorpay charges them only ₹350 (the first order)
- Only that order gets marked `paid`
- The pasta stays unpaid, the table never frees, and the chef's Payments tab still shows an open bill

**That's a money bug.** Fix the model before wiring the UI.

### The fix

Make payment tab-scoped, not order-scoped. Two options:

**Option A — payment references the table + a list of orders (recommended)**

```js
// backend/src/models/Payment.js
const paymentSchema = new mongoose.Schema({
  table:  { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],  // every order in the tab
  amount: { type: Number, required: true, min: 0 },                  // sum of those orders
  method: { type: String, enum: ['upi', 'card', 'netbanking', 'wallet'] },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  gatewayOrderId:   { type: String },  // razorpay_order_id — set at initiate
  gatewayPaymentId: { type: String },  // razorpay_payment_id — set at verify
  createdAt: { type: Date, default: Date.now },
});
```

Note the current model reuses one `gatewayTransactionId` field for both the Razorpay *order* id and later the *payment* id — it gets overwritten on verify, destroying the audit trail. Split them.

**Option B** — keep per-order Payments but create one per order in the tab, grouped by a shared `gatewayOrderId`. More rows, more edge cases. Only do this if you need per-item refunds.

---

## 4. Step-by-step

### Step 1 — Get Razorpay test keys
Sign up → Dashboard → Settings → API Keys → **Generate Test Keys**. Set in `backend/.env`:
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx
```
Never commit these. Never expose `RAZORPAY_KEY_SECRET` to the frontend — the `key_id` is public, the secret is not.

### Step 2 — Rework `Payment` model
Per §3. Amount must be the **tab total**, computed server-side.

### Step 3 — Rework `initiatePayment`
File: `backend/src/controllers/paymentController.js`

Change the input from `{ orderId }` to `{ tableId }`, then:

1. Find the table by its public `tableId` (uuid)
2. Load all unpaid orders — reuse the same status list as checkout:
   ```js
   const UNPAID_STATUSES = ['placed', 'preparing', 'ready', 'served'];
   ```
   (Currently defined in `orderController.js` — **export it and share it**, don't copy-paste. If these two lists ever drift, payments and checkout will disagree about what's owed.)
3. **Compute the amount server-side** by summing those orders' `totalAmount`.
   > 🔒 **Never accept the amount from the client.** A customer could edit the request and pay ₹1 for a ₹5000 bill.
4. Create the Razorpay order for `Math.round(total * 100)` (paise)
5. Save a `pending` Payment
6. Return `{ razorpayOrder, keyId: process.env.RAZORPAY_KEY_ID }`

Keep the existing missing-keys guard:
```js
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  return res.status(503).json({ success: false, message: 'Online payment is not configured yet. Please pay at the counter.' });
}
```

### Step 4 — Rework `verifyPayment`
Currently it marks a single order paid and doesn't free the table. It must do **exactly what `checkoutTable()` does**:

```js
// After signature verification succeeds:
await Order.updateMany({ _id: { $in: payment.orders } }, { status: 'paid' });
table.status = 'available';
await table.save();

const io = getIO();
io.to('kitchen').emit(PAYMENT_UPDATED, { table, totalAmount, orderIds });
io.to(`table:${table.tableId}`).emit(PAYMENT_UPDATED, { table, totalAmount, orderIds });
```

**Emitting `payment_updated` is not optional** — it's what resets the customer's screen and refreshes the chef's Payments tab. Skip it and the UI silently goes stale.

Best move: extract the shared "settle this table" logic into one function used by *both* `checkoutTable` and `verifyPayment`. Two code paths that must stay identical will eventually drift.

The signature check itself is already correct — don't weaken it:
```js
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest('hex');
```

### Step 5 — Frontend checkout modal
File: `Frontend/src/pages/customer/Bill.jsx` → `handlePay()`

1. Load the Razorpay script (`https://checkout.razorpay.com/v1/checkout.js`) — inject it dynamically on mount, don't hardcode it in `index.html`
2. Call `initiatePayment(tableId)` → get `{ razorpayOrder, keyId }`
3. Open `new window.Razorpay({ key: keyId, order_id: razorpayOrder.id, amount, handler })`
4. In `handler`, POST the returned `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` to `/api/payments/verify`
5. On success, let the existing `payment_updated` socket listener reset the UI — **that's already wired**, don't duplicate it

Also handle: modal dismissed (`ondismiss`), network failure mid-payment, and double-taps on Pay.

### Step 6 — Add a webhook (important for production)
The `handler` callback only fires if the customer's browser stays open. If they close it after paying, **the money leaves their account but the order is never marked paid.**

Add `POST /api/payments/webhook`, register the URL in the Razorpay dashboard, verify using the **webhook secret** (a different secret from the API key), and settle the tab there too. Make it **idempotent** — webhooks retry, and you must not double-settle.

---

## 5. Testing

Razorpay test cards: https://razorpay.com/docs/payments/payments/test-card-details/
(`4111 1111 1111 1111`, any future expiry, any CVV.)

Test these, not just the happy path:

- [ ] **Multi-round tab** — order, get served, order again, pay once. **Both** orders → `paid`, table freed. *(This is the §3 trap.)*
- [ ] Table's Payments card disappears from the chef's tab
- [ ] Customer's phone auto-shows "Thank you" via socket
- [ ] Payment fails / card declined → orders stay unpaid, table stays occupied
- [ ] Customer closes the modal mid-payment → nothing marked paid
- [ ] Customer closes the **browser** after paying → webhook still settles it
- [ ] Tampered amount in the request → server ignores it, charges the real total
- [ ] Razorpay keys removed → falls back to 503 + "pay at counter"
- [ ] Cash flow via **Mark as Paid** still works

---

## 6. Files you'll touch

| File | What |
|---|---|
| `backend/src/models/Payment.js` | Rework to tab-scoped (§3) |
| `backend/src/controllers/paymentController.js` | `initiatePayment`, `verifyPayment`, new `webhook` |
| `backend/src/routes/paymentRoutes.js` | Add webhook route |
| `backend/src/controllers/orderController.js` | Export `UNPAID_STATUSES` + shared settle logic |
| `Frontend/src/pages/customer/Bill.jsx` | `handlePay()` → Razorpay modal |
| `Frontend/src/services/paymentService.js` | `initiatePayment(tableId)`, add `verifyPayment()` |

**Read first, don't modify:**
- `backend/src/controllers/orderController.js` → `checkoutTable()` — the correct settle behaviour
- `backend/src/sockets/orderEvents.js` — event name constants

---

## 7. Rules

1. **Never trust a client-sent amount.** Always recompute server-side.
2. **Never expose `RAZORPAY_KEY_SECRET`** to the frontend. `key_id` only.
3. **Never mark an order paid without a verified signature.**
4. **Always settle the whole tab**, never a single order.
5. **Always emit `payment_updated`**, or the UI goes stale.
6. **Keep the cash fallback working.** Gateways go down; restaurants don't stop serving.
7. **Make the webhook idempotent.** It will fire more than once.
