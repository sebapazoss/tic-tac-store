import React, { useState, useEffect } from 'react';
import './App.css';
import { CartProvider } from './context/CartContext';
import { ordersAPI } from './services/api';

// Components
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import CartDrawer from './components/CartDrawer';

// Pages
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderAccess from './pages/OrderAccess';
import OrderDetail from './pages/OrderDetail';

function AppContent() {
  const [currentView, setCurrentView] = useState('catalog');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  // Verificar parámetros de URL al cargar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');

    if (token && email) {
      // Cargar el pedido automáticamente
      ordersAPI.getGuest(token, email)
        .then((response) => {
          setCurrentOrder(response.data);
          setCurrentView('order-detail');
          // Limpiar los parámetros de la URL
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((err) => {
          console.error('Error cargando pedido desde URL:', err);
          // Navegar a order-access para que el usuario ingrese los datos manualmente
          setCurrentView('order-access');
        });
    }
  }, []);

  const handleNavigate = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    handleNavigate('product-detail');
  };

  const handleOrderCreated = (orderData) => {
    setCurrentOrder(orderData);
    setCurrentView('order-detail');
  };

  const handleOrderFound = (orderData) => {
    setCurrentOrder(orderData);
    setCurrentView('order-detail');
  };

  return (
    <div className="app-container">
      <Navbar 
        onCartToggle={() => setCartOpen(!cartOpen)}
        onLogoClick={() => handleNavigate('catalog')}
      />

      <main className="main-content">
        {currentView === 'catalog' && (
          <Catalog 
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetail 
            product={selectedProduct}
            onBack={() => handleNavigate('catalog')}
          />
        )}

        {currentView === 'checkout' && (
          <Checkout onOrderCreated={handleOrderCreated} />
        )}

        {currentView === 'order-access' && (
          <OrderAccess onOrderFound={handleOrderFound} />
        )}

        {currentView === 'order-detail' && currentOrder && (
          <OrderDetail 
            order={currentOrder}
            onBack={() => handleNavigate('order-access')}
          />
        )}
      </main>

      <CartDrawer 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)} 
        onCheckout={() => handleNavigate('checkout')}
      />

      <BottomNav 
        activeTab={
          currentView === 'product-detail' || currentView === 'checkout'
            ? 'catalog' 
            : currentView
        } 
        onNavigate={handleNavigate} 
      />
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

export default App;
