import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = ({ onNavigate }) => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="glass-card" style={{ padding: '40px 24px', textAlign: 'center', marginTop: '40px' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Inicia sesión para configurar tu perfil.
        </p>
        <button onClick={() => onNavigate('login')} className="btn btn-primary">
          Ir a Login
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ paddingBottom: '32px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '32px 24px', textAlign: 'center', background: '#ffffff', border: '1px solid var(--outline-variant)' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'var(--surface-container-low)',
            border: '1px solid var(--outline-variant)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: 'var(--primary)'
          }}>
            <User size={32} style={{ strokeWidth: 1.5 }} />
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '4px' }}>
            {user.name}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {user.email}
          </p>

          <button 
            onClick={logout} 
            className="btn btn-danger"
            style={{ width: '100%', maxWidth: '200px', fontSize: '10px' }}
          >
            <LogOut size={14} /> Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
