import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Register = ({ onNavigate }) => {
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !passwordConfirmation) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      // Hardcode role to 'cliente' as frontend is client-only
      await register(name, email, password, passwordConfirmation, 'cliente');
      onNavigate('catalog');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat().join(' ');
        setError(validationErrors);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al procesar el registro. Intenta con otro correo electrónico.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ padding: '20px 0' }}>
      <div className="glass-card" style={{
        padding: '32px 24px',
        maxWidth: '440px',
        margin: '20px auto 0 auto',
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
          Crear Cuenta
        </h2>
        <p style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          marginBottom: '24px'
        }}>
          Únete a Tic-Tac Store y empieza a comprar
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
            <label htmlFor="name">Nombre completo</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="juan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="passwordConfirmation">Confirmar contraseña</label>
            <input
              id="passwordConfirmation"
              type="password"
              className="form-input"
              placeholder="Repite la contraseña"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
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
            {loading ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>

        <p style={{
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}>
          ¿Ya tienes cuenta?{' '}
          <span
            onClick={() => onNavigate('login')}
            style={{
              color: 'var(--secondary)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Inicia sesión aquí
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
