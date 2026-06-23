import { useState } from 'react';
import { Clock, Copy, Package } from 'lucide-react';

const PaymentPending = ({ orderToken, onViewOrder, onGoHome }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ maxWidth: '400px', margin: '32px auto', padding: '0 20px' }}>
        <div style={{
          background: 'var(--color-pending-bg, #fffbeb)',
          border: '1px solid var(--color-pending)',
          borderRadius: '12px',
          padding: '32px 24px',
          textAlign: 'center'
        }}>
          <Clock size={56} color="var(--color-pending)" style={{ marginBottom: '16px' }} />

          <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-pending)' }}>
            Pago pendiente
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
            Tu pago está siendo procesado.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
            Si pagaste en efectivo (Rapipago, Pago Fácil) o por transferencia, puede demorar unas horas en confirmarse.
          </p>

          {orderToken && (
            <div style={{
              background: 'rgba(255,255,255,0.7)',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <p style={{ fontSize: '11px', color: 'var(--color-pending)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                Token para seguimiento
              </p>
              <code style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                display: 'block',
                padding: '8px',
                borderRadius: '8px',
                wordBreak: 'break-all',
                background: 'rgba(255,255,255,0.9)'
              }}>
                {orderToken}
              </code>
              <button
                onClick={handleCopy}
                style={{
                  marginTop: '10px',
                  background: 'none',
                  border: '1px solid var(--color-pending)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--color-pending)'
                }}
              >
                <Copy size={12} />
                {copied ? '¡Copiado!' : 'Copiar token'}
              </button>
            </div>
          )}

          <button
            onClick={onViewOrder}
            style={{
              width: '100%',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Package size={16} />
            Ver estado del pedido
          </button>

          <button
            onClick={onGoHome}
            style={{
              width: '100%',
              background: 'var(--surface-container-high)',
              color: 'var(--primary)',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;
