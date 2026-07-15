const QRCode = require('qrcode');

// Builds the customer-facing menu URL for a table and returns a base64 PNG data URL.
async function generateTableQR(tableId) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const menuUrl = `${frontendUrl}/menu/${tableId}`;

  const qrCodeUrl = await QRCode.toDataURL(menuUrl);
  return qrCodeUrl;
}

module.exports = { generateTableQR };
