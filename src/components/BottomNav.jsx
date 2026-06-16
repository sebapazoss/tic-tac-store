import React from 'react';
import { Store, ClipboardList, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNav = ({ activeTab, onNavigate }) => {
  const { user } = useAuth();

  const tabs = [
    {
      id: 'catalog',
      label: 'Catálogo',
      icon: Store,
    },
    {
      id: 'orders',
      label: user && (user.role === 'vendedor' || user.role === 'admin') ? 'Pedidos Tienda' : 'Mis Pedidos',
      icon: ClipboardList,
    },
    {
      id: 'profile',
      label: 'Mi Perfil',
      icon: User,
    }
  ];

  return (
    <nav className="glass-card" style={{
      position: 'fixed',
      bottom: '16px',
      left: '16px',
      right: '16px',
      height: 'var(--bottom-nav-height)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 8px',
      zIndex: 99,
      borderRadius: '20px',
      border: '1px solid var(--border-color)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
      background: 'rgba(9, 13, 22, 0.85)',
    }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              flex: 1,
              height: '100%',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative'
            }}
          >
            {/* Active glow background dot */}
            {isActive && (
              <span style={{
                position: 'absolute',
                top: '6px',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                boxShadow: '0 0 10px var(--primary)'
              }} />
            )}

            <Icon 
              size={20} 
              style={{
                transform: isActive ? 'scale(1.15) translateY(-2px)' : 'scale(1)',
                transition: 'transform 0.2s ease',
                strokeWidth: isActive ? 2.5 : 2
              }} 
            />

            <span style={{
              fontSize: '11px',
              fontWeight: isActive ? '600' : '400',
              fontFamily: 'var(--font-title)',
              transition: 'color 0.2s ease'
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
