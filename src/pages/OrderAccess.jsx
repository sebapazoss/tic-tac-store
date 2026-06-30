import { useState } from 'react';
import { ClipboardList, Lock, Mail } from 'lucide-react';
import { ordersAPI } from '../services/api';

export default function OrderAccess({ onOrderFound }) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email.trim()) {
        setError('Ingresa tu email');
        setLoading(false);
        return;
      }
      if (!token.trim() || token.length < 20) {
        setError('Token inválido o muy corto');
        setLoading(false);
        return;
      }

      const response = await ordersAPI.getGuest(token, email);
      onOrderFound(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Email o token incorrecto');
      } else if (err.response?.status === 400) {
        setError('Datos inválidos');
      } else {
        setError('Error al consultar tu pedido. Intenta más tarde.');
      }
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 700,
        marginBottom: '16px',
        textAlign: 'left',
        letterSpacing: '-0.01em',
        paddingLeft: '20px'
      }}>
        Mi Pedido
      </h2>

      <div style={{ maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '20px', paddingRight: '20px' }}>
        {/* Card Principal */}
        <div style={{
          background: 'var(--surface-container-low)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <ClipboardList size={24} style={{ color: 'var(--primary)' }} />
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Consultar Orden
              </p>
              <p style={{ fontSize: '14px', fontWeight: 600 }}>
                Accede a tu pedido
              </p>
            </div>
          </div>

          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: '20px',
            lineHeight: '1.5'
          }}>
            Ingresa el email y el token que recibiste en la confirmación de tu compra para ver el estado de tu pedido.
          </p>

          {/* Formulario */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Email Input */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <Mail size={14} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="form-input"
                style={{
                  width: '100%',
                  background: 'var(--bg-primary)',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '13px',
                  padding: '12px 14px'
                }}
                disabled={loading}
              />
            </div>

            {/* Token Input */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <Lock size={14} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} />
                Token de Acceso
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Pega el token de tu email"
                className="form-input"
                style={{
                  width: '100%',
                  background: 'var(--bg-primary)',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '12px',
                  padding: '12px 14px',
                  fontFamily: 'monospace',
                  letterSpacing: '0.5px'
                }}
                disabled={loading}
              />
              <p style={{
                fontSize: '11px',
                color: 'var(--text-secondary)',
                marginTop: '6px'
              }}>
                Lo encontrarás en el email de confirmación de tu pedido
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'var(--color-cancelled-bg)',
                border: '1px solid var(--color-cancelled)',
                borderRadius: '10px',
                padding: '12px 14px',
                color: 'var(--color-cancelled)',
                fontSize: '13px'
              }}>
                {error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'var(--surface-container-high)' : 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 16px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                marginTop: '8px',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Buscando...' : 'Ver mi pedido'}
            </button>
          </form>
        </div>

        {/* Info */}
        <div style={{
          background: 'var(--surface-container-low)',
          borderRadius: '12px',
          padding: '16px',
          marginTop: '20px'
        }}>
          <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
            ¿No recibiste el token?
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Verifica la carpeta de spam en tu correo electrónico. Si aún no lo encuentras, contacta con nuestro equipo de soporte.
          </p>
        </div>
      </div>
    </div>
  );
}
