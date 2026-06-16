import React from 'react';
import { ShoppingBag, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = ({ onCartToggle, onNavigate }) => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  return (
    <header className="glass-card" style={{
      position: 'sticky',
      top: 12,
      zIndex: 100,
      margin: '12px 12px 0 12px',
      borderRadius: '16px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      border: '1px solid var(--border-color)',
    }}>
      {/* Logo */}
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
          fontSize: '22px',
          fontWeight: 800,
          fontFamily: 'var(--font-title)',
          background: 'linear-gradient(135deg, #a855f7, #6366f1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Tic-Tac Store
        </span>
        <span style={{ fontSize: '18px' }}>🕹️</span>
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Carrito */}
        <button 
          onClick={onCartToggle}
          className="btn btn-secondary"
          style={{
            position: 'relative',
            width: '44px',
            height: '44px',
            padding: 0,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 'auto',
            minHeight: 'auto',
          }}
          aria-label="Ver carrito"
        >
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              background: 'linear-gradient(135deg, var(--accent), var(--primary))',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 'bold',
              minWidth: '20px',
              height: '20px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              animation: 'pop 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              {cartCount}
            </span>
          )}
        </button>

        {/* Perfil / Login */}
        {user ? (
          <div 
            onClick={() => onNavigate('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '6px 12px',
              borderRadius: '12px',
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
          >
            <User size={18} className="text-secondary" />
            <span style={{
              fontSize: '13px',
              fontWeight: 500,
              maxWidth: '80px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: 'var(--text-primary)'
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
              fontSize: '13px',
              borderRadius: '12px',
            }}
          >
            Iniciar Sesión
          </button>
        )}
      </div>
      
      <style>{`
        @keyframes pop {
          0% { transform: scale(0.6); }
          100% { transform: scale(1); }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
