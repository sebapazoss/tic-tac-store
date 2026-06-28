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
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import PaymentPending from './pages/PaymentPending';

function AppContent() {
  const [currentView, setCurrentView] = useState('catalog');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [mpOrderToken, setMpOrderToken] = useState(null);

  // Verificar parámetros de URL al cargar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Retorno desde Mercado Pago
    const paymentStatus = params.get('payment_status');
    const orderToken    = params.get('order_token');

    if (paymentStatus && orderToken) {
      window.history.replaceState({}, document.title, window.location.pathname);
      setMpOrderToken(orderToken);

      if (paymentStatus === 'approved')     setCurrentView('payment-success');
      else if (paymentStatus === 'failure') setCurrentView('payment-failure');
      else if (paymentStatus === 'pending') setCurrentView('payment-pending');
      else setCurrentView('catalog');
      return;
    }

    // Acceso directo a pedido por token + email en URL
    const token = params.get('token');
    const email = params.get('email');

    if (token && email) {
      ordersAPI.getGuest(token, email)
        .then((response) => {
          setCurrentOrder(response.data);
          setCurrentView('order-detail');
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((err) => {
          console.error('Error cargando pedido desde URL:', err);
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
          <Checkout onOrderCreated={handleOrderCreated} onBack={() => handleNavigate('catalog')} />
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

        {currentView === 'payment-success' && (
          <PaymentSuccess
            orderToken={mpOrderToken}
            onViewOrder={() => handleNavigate('order-access')}
            onGoHome={() => handleNavigate('catalog')}
          />
        )}

        {currentView === 'payment-failure' && (
          <PaymentFailure
            onRetry={() => handleNavigate('checkout')}
            onGoHome={() => handleNavigate('catalog')}
          />
        )}

        {currentView === 'payment-pending' && (
          <PaymentPending
            orderToken={mpOrderToken}
            onViewOrder={() => handleNavigate('order-access')}
            onGoHome={() => handleNavigate('catalog')}
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
          ['product-detail', 'checkout', 'payment-success', 'payment-failure', 'payment-pending'].includes(currentView)
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
