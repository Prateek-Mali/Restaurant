import { useEffect, useState } from 'react';
import paymentService from '../../services/paymentService';
import orderService from '../../services/orderService';
import { StatCard } from '../../components/admin/StatCard';
import { formatCurrency } from '../../utils/formatCurrency';
import { getElapsedMinutes } from '../../utils/formatElapsedTime';

const STATUS_META = {
  placed: ['#FDF0DC', '#B8862C'],
  preparing: ['#FDF0DC', '#B8862C'],
  ready: ['#DFF3E7', '#3F8F5F'],
  served: ['#F2EAE0', '#8C8073'],
  paid: ['#F2EAE0', '#8C8073'],
  cancelled: ['#F2EAE0', '#8C8073'],
};

function dateKey(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

function sumRange(revenueByDate, startOffset, endOffset) {
  const keys = new Set();
  for (let i = startOffset; i <= endOffset; i++) keys.add(dateKey(i));
  return revenueByDate.filter((d) => keys.has(d._id)).reduce((sum, d) => sum + d.revenue, 0);
}

function formatDelta(current, previous) {
  if (previous === 0) return current > 0 ? 'vs ₹0 previous period' : null;
  const pct = Math.round(((current - previous) / previous) * 100);
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct}% vs previous period`;
}

export function Dashboard() {
  const [revenue, setRevenue] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([paymentService.getRevenueSummary(), orderService.getAllOrders()])
      .then(([revenueData, allOrders]) => {
        setRevenue(revenueData);
        setOrders(allOrders.slice(0, 6));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ color: '#8C8073', fontSize: 14 }}>Loading dashboard…</div>;
  }

  const revenueByDate = revenue.revenueByDate;
  const todayRevenue = sumRange(revenueByDate, 0, 0);
  const yesterdayRevenue = sumRange(revenueByDate, 1, 1);
  const weekRevenue = sumRange(revenueByDate, 0, 6);
  const prevWeekRevenue = sumRange(revenueByDate, 7, 13);
  const monthRevenue = sumRange(revenueByDate, 0, 29);
  const prevMonthRevenue = sumRange(revenueByDate, 30, 59);

  const statCards = [
    { label: 'Revenue today', value: formatCurrency(todayRevenue), delta: formatDelta(todayRevenue, yesterdayRevenue) },
    { label: 'Revenue this week', value: formatCurrency(weekRevenue), delta: formatDelta(weekRevenue, prevWeekRevenue) },
    { label: 'Revenue this month', value: formatCurrency(monthRevenue), delta: formatDelta(monthRevenue, prevMonthRevenue) },
  ];

  const bestSellersRaw = revenue.topSellingItems.slice(0, 5);
  const maxCount = Math.max(1, ...bestSellersRaw.map((b) => b.quantitySold));
  const bestSellers = bestSellersRaw.map((b) => ({
    name: b.name,
    countLabel: `${b.quantitySold} sold`,
    barPct: `${Math.round((b.quantitySold / maxCount) * 100)}%`,
  }));

  const recentOrders = orders.map((o) => {
    const [bg, color] = STATUS_META[o.status] || STATUS_META.placed;
    const elapsedMin = getElapsedMinutes(o.createdAt);
    return {
      id: o._id,
      tableLabel: `Table ${o.table?.tableNumber ?? '—'}`,
      summary: `${o.items.length} item${o.items.length === 1 ? '' : 's'}`,
      total: formatCurrency(o.totalAmount),
      statusLabel: o.status[0].toUpperCase() + o.status.slice(1),
      statusBg: bg,
      statusColor: color,
      timeLabel: elapsedMin < 1 ? 'Just now' : `${elapsedMin} min ago`,
    };
  });

  return (
    <div>
      <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 24, color: '#2B2420', marginBottom: 4 }}>
        Dashboard
      </div>
      <div style={{ fontSize: 13, color: '#8C8073', marginBottom: 22 }}>
        Overview for {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E7DCCC', borderRadius: 16, padding: 20 }}>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 15, color: '#2B2420', marginBottom: 14 }}>
            Best-selling items
          </div>
          {bestSellers.length === 0 ? (
            <div style={{ fontSize: 13, color: '#8C8073' }}>No paid orders yet</div>
          ) : (
            bestSellers.map((b) => (
              <div key={b.name} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: '#2B2420', marginBottom: 5 }}>
                  <span>{b.name}</span>
                  <span style={{ color: '#8C8073' }}>{b.countLabel}</span>
                </div>
                <div style={{ height: 8, background: '#F2EAE0', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: b.barPct, background: '#DE5B33', borderRadius: 999 }} />
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E7DCCC', borderRadius: 16, padding: 20 }}>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 15, color: '#2B2420', marginBottom: 14 }}>
            Recent orders
          </div>
          {recentOrders.length === 0 ? (
            <div style={{ fontSize: 13, color: '#8C8073' }}>No orders yet</div>
          ) : (
            recentOrders.map((ro) => (
              <div
                key={ro.id}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #E7DCCC' }}
              >
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#2B2420' }}>{ro.tableLabel}</div>
                  <div style={{ fontSize: 12, color: '#8C8073' }}>
                    {ro.summary} · {ro.timeLabel}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2420' }}>{ro.total}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: ro.statusBg, color: ro.statusColor }}>
                    {ro.statusLabel}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
