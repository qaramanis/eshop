import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();
const getInitialState = () => {
  try {
    const savedCart = localStorage.getItem('eshop-cart');
    const parsedCart = savedCart ? JSON.parse(savedCart) : [];
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

const CART_STORAGE_KEY = 'eshop-cart';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => getInitialState());

  useEffect(() => {
    try {
      if (Array.isArray(cartItems)) {
        localStorage.setItem('eshop-cart', JSON.stringify(cartItems));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [cartItems]);

  const addToCart = (product, selectedColor = null) => {
    if (!product) {
      console.error('Attempted to add null/undefined product to cart');
      return;
    }

    setCartItems(prevItems => {
      const currentItems = Array.isArray(prevItems) ? prevItems : [];
      const newItem = {
        ...product,
        selectedColor,
        cartId: `${product.id}-${Date.now()}`
      };
      return [...currentItems, newItem];
    });
  };

  const removeFromCart = (index) => {
    setCartItems(prevItems => {
      const currentItems = Array.isArray(prevItems) ? prevItems : [];
      if (index < 0 || index >= currentItems.length) {
        console.error('Invalid index for cart removal');
        return currentItems;
      }
      return currentItems.filter((_, i) => i !== index);
    });
  };

  const itemCount = Array.isArray(cartItems) ? cartItems.length : 0;

  const totalPrice = Array.isArray(cartItems) 
    ? cartItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
    : 0;

  return (
    <CartContext.Provider 
      value={{ 
        cartItems: Array.isArray(cartItems) ? cartItems : [], // Ensure we always provide an array
        addToCart, 
        removeFromCart,
        itemCount,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};