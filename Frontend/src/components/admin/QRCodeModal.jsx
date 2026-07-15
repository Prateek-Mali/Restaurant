export function QRCodeModal({ table, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(43,36,32,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#FFFFFF', borderRadius: 16, padding: 28, width: 320, textAlign: 'center' }}
      >
        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 17, color: '#2B2420', marginBottom: 16 }}>
          Table {table.tableNumber} QR code
        </div>
        <img src={table.qrCodeUrl} alt={`QR code for table ${table.tableNumber}`} style={{ width: 220, height: 220, marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <a
            href={table.qrCodeUrl}
            download={`table-${table.tableNumber}-qr.png`}
            style={{ flex: 1, textAlign: 'center', padding: 12, borderRadius: 10, background: '#DE5B33', color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', textDecoration: 'none' }}
          >
            Download
          </a>
          <div
            onClick={onClose}
            style={{ flex: 1, textAlign: 'center', padding: 12, borderRadius: 10, border: '1px solid #E7DCCC', fontWeight: 700, fontSize: 13.5, color: '#2B2420', cursor: 'pointer' }}
          >
            Close
          </div>
        </div>
      </div>
    </div>
  );
}
