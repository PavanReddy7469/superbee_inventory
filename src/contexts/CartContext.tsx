import { createContext, useContext, useState, ReactNode } from 'react';

interface InventoryPart {
  id: string;
  sku: string;
  name: string;
  category_id: string;
  manufacturer: string;
  quantity: number;
  price: number;
  status: string;
}

export interface CartItem {
  part: InventoryPart;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (part: InventoryPart, quantity: number) => void;
  removeItem: (partId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (part: InventoryPart, quantity: number) => {
    setItems((prev) => {
      const found = prev.find((i) => i.part.id === part.id);
      if (found) {
        return prev.map((i) => i.part.id === part.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { part, quantity }];
    });
  };

  const removeItem = (partId: string) => {
    setItems((prev) => prev.filter((i) => i.part.id !== partId));
  };

  const clear = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export default CartProvider;
