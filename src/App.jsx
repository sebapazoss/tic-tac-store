import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import CartDrawer from './components/CartDrawer';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState('catalog'); // catalog, product-detail, login, register, checkout, orders, profile
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  if (authLoading) {
    return <LoadingSpinner fullPage />;
  }

  const handleNavigate = (view) => {
    setCurrentView(view);
    // Smooth scroll to top for mobile layout transitions
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    handleNavigate('product-detail');
  };

  return (
    <div className="app-container">
      {/* Header Sticky Navigation */}
      <Navbar 
        onCartToggle={() => setCartOpen(!cartOpen)} 
        onNavigate={handleNavigate} 
      />

      {/* Main View Area */}
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

        {currentView === 'login' && (
          <Login onNavigate={handleNavigate} />
        )}

        {currentView === 'register' && (
          <Register onNavigate={handleNavigate} />
        )}

        {currentView === 'checkout' && (
          <Checkout key={user?.id || 'guest'} onNavigate={handleNavigate} />
        )}

        {currentView === 'orders' && (
          <Orders />
        )}

        {currentView === 'profile' && (
          <Profile onNavigate={handleNavigate} />
        )}
      </main>

      {/* Slide-out Shopping Cart Drawer */}
      <CartDrawer 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)} 
        onCheckout={() => handleNavigate('checkout')}
      />

      {/* Floating Bottom Nav for Mobile-First layout */}
      <BottomNav 
        activeTab={
          currentView === 'product-detail' || currentView === 'checkout'
            ? 'catalog' 
            : (currentView === 'login' || currentView === 'register')
              ? 'profile'
              : currentView
        } 
        onNavigate={handleNavigate} 
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
