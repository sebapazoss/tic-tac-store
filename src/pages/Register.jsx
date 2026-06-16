import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Register = ({ onNavigate }) => {
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState('cliente'); // 'cliente' or 'vendedor'
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
      const response = await register(name, email, password, passwordConfirmation, role);
      
      if (role === 'vendedor') {
        setSuccess('Registro exitoso. Tu cuenta de vendedor ha sido registrada y está pendiente de aprobación por el Administrador antes de que puedas publicar relojes.');
        setName('');
        setEmail('');
        setPassword('');
        setPasswordConfirmation('');
      } else {
        onNavigate('catalog');
      }
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
          Únete a Horology y empieza a operar
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

        {success && (
          <div style={{
            background: 'var(--color-delivered-bg)',
            border: '1px solid var(--color-delivered)',
            borderRadius: '10px',
            padding: '16px',
            color: 'var(--color-delivered)',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'left',
            lineHeight: 1.4,
            fontWeight: 500
          }}>
            {success}
            <button
              onClick={() => onNavigate('login')}
              className="btn btn-success"
              style={{
                width: '100%',
                marginTop: '12px',
                minHeight: 'auto',
                padding: '8px 12px',
                fontSize: '11px'
              }}
            >
              Iniciar Sesión
            </button>
          </div>
        )}

        {!success && (
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
              <label htmlFor="role">Tipo de cuenta</label>
              <select
                id="role"
                className="form-input form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
                required
              >
                <option value="cliente">Comprador (Cliente)</option>
                <option value="vendedor">Vendedor (Socio comercial)</option>
              </select>
              {role === 'vendedor' && (
                <p style={{
                  fontSize: '11px',
                  color: 'var(--color-pending)',
                  marginTop: '6px',
                  textAlign: 'left',
                  lineHeight: 1.3,
                  fontWeight: 500
                }}>
                  Nota: Las cuentas de vendedor requieren la aprobación de un administrador para poder listar relojes en la tienda.
                </p>
              )}
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
        )}

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
