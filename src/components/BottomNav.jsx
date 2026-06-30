import React from 'react';
import { Store, ClipboardList } from 'lucide-react';

const BottomNav = ({ activeTab, onNavigate }) => {
  const tabs = [
    {
      id: 'catalog',
      label: 'Catálogo',
      icon: Store,
    },
    {
      id: 'order-access',
      label: 'Pedidos',
      icon: ClipboardList,
    }
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      height: 'var(--bottom-nav-height)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 16px',
      zIndex: 99,
      borderTop: '1px solid var(--outline-variant)',
      background: 'var(--bg-primary)',
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.02)'
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
              transition: 'all 0.15s ease',
              opacity: isActive ? 1 : 0.65
            }}
          >
            <Icon 
              size={18} 
              style={{
                strokeWidth: isActive ? 2.5 : 2
              }} 
            />

            <span className="label-caps" style={{
              fontSize: '10px',
              fontWeight: isActive ? '700' : '500',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              marginTop: '2px'
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
