import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import menuService from '../../services/menuService';
import tableService from '../../services/tableService';
import { useCart } from '../../hooks/useCart';
import { useActiveOrder } from '../../hooks/useActiveOrder';
import { CustomerHeader } from '../../components/layout/CustomerHeader';
import { CategoryTabs } from '../../components/customer/CategoryTabs';
import { MenuItemCard } from '../../components/customer/MenuItemCard';
import { CartSummaryBar } from '../../components/customer/CartSummaryBar';
import { ActiveOrderBanner } from '../../components/customer/ActiveOrderBanner';

export function Menu() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { lines, totalQuantity, subtotal, addItem, incItem, decItem } = useCart();
  const { hasActiveOrder, latestStatus, total } = useActiveOrder(tableId);

  const [table, setTable] = useState(null);
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('starters');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([tableService.resolveTable(tableId), menuService.getMenu()])
      .then(([tableData, menuItems]) => {
        setTable(tableData);
        setItems(menuItems);
      })
      .catch(() => setError('This table QR code is not valid. Please ask staff for help.'))
      .finally(() => setLoading(false));
  }, [tableId]);

  if (loading) {
    return <div style={{ minHeight: '100vh', background: '#FAF6F0', padding: 24, fontFamily: "'Public Sans', system-ui, sans-serif", color: '#8C8073' }}>Loading menu…</div>;
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF6F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Public Sans', system-ui, sans-serif" }}>
        <div style={{ textAlign: 'center', color: '#2B2420', fontSize: 14 }}>{error}</div>
      </div>
    );
  }

  const filteredItems = items.filter((i) => i.category === category);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF6F0', fontFamily: "'Public Sans', system-ui, sans-serif" }}>
      <CustomerHeader tableNumber={table.tableNumber} />
      {hasActiveOrder && <ActiveOrderBanner tableId={tableId} status={latestStatus} total={total} />}
      <CategoryTabs active={category} onChange={setCategory} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 24px', boxSizing: 'border-box' }}>
        {filteredItems.length === 0 ? (
          <div style={{ color: '#8C8073', fontSize: 13, padding: '24px 0' }}>No items in this category yet.</div>
        ) : (
          filteredItems.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              quantity={lines[item._id]?.quantity || 0}
              onAdd={addItem}
              onInc={incItem}
              onDec={decItem}
            />
          ))
        )}
      </div>

      {totalQuantity > 0 && (
        <CartSummaryBar totalQuantity={totalQuantity} subtotal={subtotal} onClick={() => navigate(`/menu/${tableId}/cart`)} />
      )}
    </div>
  );
}
