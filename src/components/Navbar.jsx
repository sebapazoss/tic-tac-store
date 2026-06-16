import React from 'react';
import { ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = ({ onCartToggle, onNavigate }) => {
  const { user } = useAuth();
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
        onClick={() => onNavigate('catalog')} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}
      >
        <span style={{
          fontSize: '20px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--primary)',
        }}>
          HOROLOGY
        </span>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Shopping Cart Button */}
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

        {/* User Session Profile Link */}
        {user ? (
          <div 
            onClick={() => onNavigate('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--surface-container-low)',
              padding: '8px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              border: '1px solid var(--outline-variant)',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-container-high)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-container-low)'}
          >
            <User size={16} />
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              maxWidth: '80px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {user.name.split(' ')[0]}
            </span>
          </div>
        ) : (
          <button 
            onClick={() => onNavigate('login')}
            className="btn btn-primary"
            style={{
              padding: '8px 16px',
              minHeight: 'auto',
              fontSize: '11px',
              borderRadius: '10px',
            }}
          >
            Ingresar
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
