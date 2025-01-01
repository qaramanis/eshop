import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();
const CART_STORAGE_KEY = 'eshop-cart';
const initialCartState = {
  items: [], // [{id, type, name, price, quantity, selectedColor(for smartphones)}]
  total: 0
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, selectedColor = null) => {
    setCartItems(prevItems => [...prevItems, { ...product, selectedColor }]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);