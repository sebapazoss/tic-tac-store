import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = ({ onCartToggle }) => {
  const { cartCount } = useCart();

  return (
    <header className="glass-card" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderRadius: 0,
      border: 'none',
      borderBottom: '1px solid var(--surface-container-highest)',
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--bg-primary)'
    }}>
      {/* Brand Logo */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}
      >
        <span style={{
          fontSize: '18px',
          fontWeight: 800,
          letterSpacing: '0.05em',
          color: 'var(--primary)',
        }}>
          TIC-TAC STORE
        </span>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Shopping Cart */}
        <button 
          onClick={onCartToggle}
          className="btn btn-secondary"
          style={{
            position: 'relative',
            width: '40px',
            height: '40px',
            padding: 0,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 'auto',
            minHeight: 'auto',
            background: 'var(--surface-container-low)'
          }}
          aria-label="Ver carrito"
        >
          <ShoppingBag size={18} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 'bold',
              minWidth: '18px',
              height: '18px',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
