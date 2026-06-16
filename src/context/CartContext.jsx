import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [cart, setCart] = useState([]);

  // Fetch cart items from backend
  const fetchBackendCart = async () => {
    try {
      const response = await api.get('/cart');
      const items = response.data?.data || response.data || [];
      const formattedItems = items.map(item => ({
        product: item.product,
        quantity: item.quantity
      }));
      setCart(formattedItems);
    } catch (err) {
      console.error("Error al obtener el carrito del servidor:", err);
    }
  };

  // Sync token status & guest cart merging
  useEffect(() => {
    const handleAuthChange = async () => {
      if (token) {
        // Logged in: try to merge local guest cart into server cart
        const localCartStr = localStorage.getItem('cart');
        if (localCartStr) {
          try {
            const localCart = JSON.parse(localCartStr);
            if (Array.isArray(localCart) && localCart.length > 0) {
              for (const item of localCart) {
                await api.post('/cart', {
                  product_id: item.product.id,
                  quantity: item.quantity
                });
              }
              localStorage.removeItem('cart');
            }
          } catch (err) {
            console.error("Error al sincronizar el carrito local con el servidor:", err);
          }
        }
        // Load server cart
        fetchBackendCart();
      } else {
        // Logged out: Load guest cart from local storage
        const localCartStr = localStorage.getItem('cart');
        setCart(localCartStr ? JSON.parse(localCartStr) : []);
      }
    };

    handleAuthChange();
  }, [token]);

  // Persist guest cart to local storage when not authenticated
  useEffect(() => {
    if (!token) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, token]);

  const addToCart = async (product, quantity = 1) => {
    if (token) {
      try {
        await api.post('/cart', {
          product_id: product.id,
          quantity: quantity
        });
        await fetchBackendCart();
      } catch (err) {
        console.error("Error al agregar al carrito en el servidor:", err);
        alert(err.response?.data?.message || 'Error al agregar el artículo al carrito.');
      }
    } else {
      setCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex(item => item.product.id === product.id);
        const currentQty = existingItemIndex > -1 ? prevCart[existingItemIndex].quantity : 0;
        const newQty = currentQty + quantity;

        if (newQty > product.stock) {
          alert(`Lo sentimos, no puedes agregar más de ${product.stock} unidades de este producto.`);
          return prevCart;
        }

        if (existingItemIndex > -1) {
          const newCart = [...prevCart];
          newCart[existingItemIndex].quantity = newQty;
          return newCart;
        } else {
          return [...prevCart, { product, quantity }];
        }
      });
    }
  };

  const removeFromCart = async (productId) => {
    if (token) {
      try {
        await api.delete(`/cart/${productId}`);
        await fetchBackendCart();
      } catch (err) {
        console.error("Error al eliminar del carrito en el servidor:", err);
        alert(err.response?.data?.message || 'Error al remover el artículo del carrito.');
      }
    } else {
      setCart((prevCart) => prevCart.filter(item => item.product.id !== productId));
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (token) {
      try {
        await api.put(`/cart/${productId}`, {
          quantity: quantity
        });
        await fetchBackendCart();
      } catch (err) {
        console.error("Error al actualizar la cantidad en el servidor:", err);
        alert(err.response?.data?.message || 'Error al actualizar la cantidad.');
      }
    } else {
      setCart((prevCart) => {
        return prevCart.map(item => {
          if (item.product.id === productId) {
            if (quantity > item.product.stock) {
              alert(`Límite de stock alcanzado (${item.product.stock} unidades disponibles).`);
              return item;
            }
            return { ...item, quantity };
          }
          return item;
        });
      });
    }
  };

  const clearCart = () => {
    setCart([]);
    if (!token) {
      localStorage.removeItem('cart');
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
