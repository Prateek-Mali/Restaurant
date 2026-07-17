import { useCallback, useEffect, useState } from 'react';
import orderService from '../services/orderService';
import { useSocket } from './useSocket';

// Anything not yet settled is part of the table's running tab. Kept in sync with
// UNPAID_STATUSES on the backend (orderController.js) — if one changes, change both.
const UNPAID_STATUSES = new Set(['placed', 'preparing', 'ready', 'served']);

// Tells a customer screen whether this table has an open order, and keeps it live.
// Used to decide whether to surface "Order status" / "Bill" navigation — on a fresh
// scan with no orders yet, there's nothing to link to, so it stays hidden.
export function useActiveOrder(tableId) {
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!tableId) return Promise.resolve();
    return orderService
      .getOrdersByTable(tableId)
      .then((all) => setOrders(all.filter((o) => UNPAID_STATUSES.has(o.status))))
      .catch(() => setOrders([]));
  }, [tableId]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    if (!socket || !tableId) return;

    function joinTable() {
      socket.emit('join_table', tableId);
      load(); // resync after a reconnect, in case events were missed
    }

    joinTable();
    socket.on('connect', joinTable);
    socket.on('new_order', load);
    socket.on('order_status_updated', load);
    socket.on('payment_updated', load);

    return () => {
      socket.off('connect', joinTable);
      socket.off('new_order', load);
      socket.off('order_status_updated', load);
      socket.off('payment_updated', load);
    };
  }, [socket, tableId, load]);

  // The newest order is the one worth reporting — it's what the kitchen is working on.
  const latest = orders.length > 0 ? orders[0] : null;

  return {
    loading,
    orders,
    hasActiveOrder: orders.length > 0,
    latestStatus: latest?.status ?? null,
    total: orders.reduce((sum, o) => sum + o.totalAmount, 0),
  };
}
