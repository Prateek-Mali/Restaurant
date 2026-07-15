import { createContext, useState } from 'react';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [lines, setLines] = useState({});

  function addItem(menuItem) {
    setLines((prev) => {
      const existing = prev[menuItem._id];
      return {
        ...prev,
        [menuItem._id]: { menuItem, quantity: (existing?.quantity || 0) + 1 },
      };
    });
  }

  function incItem(menuItemId) {
    setLines((prev) => ({
      ...prev,
      [menuItemId]: { ...prev[menuItemId], quantity: prev[menuItemId].quantity + 1 },
    }));
  }

  function decItem(menuItemId) {
    setLines((prev) => {
      const next = { ...prev };
      const quantity = (next[menuItemId]?.quantity || 0) - 1;
      if (quantity <= 0) {
        delete next[menuItemId];
      } else {
        next[menuItemId] = { ...next[menuItemId], quantity };
      }
      return next;
    });
  }

  function removeItem(menuItemId) {
    setLines((prev) => {
      const next = { ...prev };
      delete next[menuItemId];
      return next;
    });
  }

  function clearCart() {
    setLines({});
  }

  const lineList = Object.values(lines);
  const totalQuantity = lineList.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = lineList.reduce((sum, l) => sum + l.menuItem.price * l.quantity, 0);

  return (
    <CartContext.Provider
      value={{ lines, lineList, totalQuantity, subtotal, addItem, incItem, decItem, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
