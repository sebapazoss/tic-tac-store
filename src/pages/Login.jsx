import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor, ingresa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      onNavigate('catalog');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.status === 401) {
        setError('Credenciales inválidas. Por favor, intenta de nuevo.');
      } else {
        setError('Error al intentar iniciar sesión. Verifica tu conexión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ padding: '20px 0' }}>
      <div className="glass-card" style={{
        padding: '32px 24px',
        maxWidth: '400px',
        margin: '40px auto 0 auto',
        textAlign: 'center',
        background: '#ffffff',
        border: '1px solid var(--outline-variant)'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 700,
          marginBottom: '8px',
          letterSpacing: '-0.01em'
        }}>
          Iniciar Sesión
        </h2>
        <p style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          marginBottom: '24px'
        }}>
          Ingresa a tu cuenta de Horology
        </p>

        {error && (
          <div style={{
            background: 'var(--color-cancelled-bg)',
            border: '1px solid var(--color-cancelled)',
            borderRadius: '10px',
            padding: '12px 16px',
            color: 'var(--color-cancelled)',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '20px', fontSize: '11px' }}
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p style={{
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}>
          ¿No tienes una cuenta?{' '}
          <span
            onClick={() => onNavigate('register')}
            style={{
              color: 'var(--secondary)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Regístrate aquí
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
