import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'marketlink_cart_v1';

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

/**
 * Shopping cart kept in the browser (localStorage). Each line:
 * { productId, slug, name, price, unit, image, categoryColor, maxQty, quantity, farmer: { _id, stallName, slug, logo } }
 * Items are grouped by farmer at checkout because every farmer has its own pickup slot.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage may be unavailable (private mode) - the cart still works for this visit */
    }
  }, [items]);

  const add = useCallback((product, quantity = 1) => {
    setItems((list) => {
      const id = String(product._id);
      const maxQty = product.quantityAvailable ?? 999;
      const existing = list.find((i) => i.productId === id);
      if (existing) {
        return list.map((i) => (i.productId === id ? { ...i, maxQty, quantity: Math.min(maxQty, i.quantity + quantity) } : i));
      }
      const farmer = product.farmer || {};
      return [
        ...list,
        {
          productId: id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          unit: product.unit,
          image: product.image,
          categoryColor: product.category?.color,
          maxQty,
          quantity: Math.min(maxQty, quantity),
          farmer: { _id: String(farmer._id || farmer), stallName: farmer.stallName, slug: farmer.slug, logo: farmer.logo },
        },
      ];
    });
  }, []);

  const update = useCallback((productId, quantity) => {
    setItems((list) =>
      list.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(i.maxQty || 999, quantity)) } : i))
    );
  }, []);

  const remove = useCallback((productId) => setItems((list) => list.filter((i) => i.productId !== productId)), []);
  const removeFarmer = useCallback((farmerId) => setItems((list) => list.filter((i) => i.farmer._id !== farmerId)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const groups = [];
    for (const item of items) {
      let group = groups.find((g) => g.farmer._id === item.farmer._id);
      if (!group) {
        group = { farmer: item.farmer, items: [], subtotal: 0 };
        groups.push(group);
      }
      group.items.push(item);
      group.subtotal += item.price * item.quantity;
    }
    return {
      items,
      groups,
      count: items.reduce((s, i) => s + i.quantity, 0),
      total: items.reduce((s, i) => s + i.price * i.quantity, 0),
      add,
      update,
      remove,
      removeFarmer,
      clear,
      has: (productId) => items.some((i) => i.productId === String(productId)),
    };
  }, [items, add, update, remove, removeFarmer, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
