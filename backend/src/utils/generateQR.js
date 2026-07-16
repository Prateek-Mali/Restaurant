const QRCode = require('qrcode');

// Builds the customer-facing menu URL for a table and returns a base64 PNG data URL.
// Called on every read rather than stored, so the QR always points at the current site.
async function generateTableQR(tableId) {
  const frontendUrl = (process.env.FRONTEND_URL || '').replace(/\/+$/, '');

  if (!frontendUrl) {
    // A QR pointing at a guessed URL is worse than no QR — it looks fine and
    // fails silently in a customer's hands. Surface the misconfiguration instead.
    throw new Error('FRONTEND_URL is not set — QR codes would point nowhere. Set it on the host.');
  }

  return QRCode.toDataURL(`${frontendUrl}/menu/${tableId}`);
}

module.exports = { generateTableQR };
