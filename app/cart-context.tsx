"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  variantId: number;
  productId: number;
  name: string;
  variantLabel: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  maxStock: number;
};

type CartContextValue = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (variantId: number) => void;
  setQuantity: (variantId: number, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
};

const STORAGE_KEY = "rns_ecommerce_cart";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  const addToCart = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      const qty = item.quantity ?? 1;
      setCart((current) => {
        const existing = current.find((c) => c.variantId === item.variantId);
        if (existing) {
          const nextQty = Math.min(existing.quantity + qty, item.maxStock);
          return current.map((c) =>
            c.variantId === item.variantId ? { ...c, quantity: nextQty } : c
          );
        }
        return [
          ...current,
          {
            ...item,
            quantity: Math.min(qty, item.maxStock),
          },
        ];
      });
    },
    []
  );

  const removeFromCart = useCallback((variantId: number) => {
    setCart((current) => current.filter((c) => c.variantId !== variantId));
  }, []);

  const setQuantity = useCallback((variantId: number, quantity: number) => {
    setCart((current) =>
      current
        .map((c) => {
          if (c.variantId !== variantId) return c;
          const q = Math.max(1, Math.min(quantity, c.maxStock));
          return { ...c, quantity: q };
        })
        .filter((c) => c.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      setQuantity,
      clearCart,
      subtotal,
    }),
    [cart, addToCart, removeFromCart, setQuantity, clearCart, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
