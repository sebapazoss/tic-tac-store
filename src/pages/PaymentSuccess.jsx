import { useState } from 'react';
import { CheckCircle, Package, Copy } from 'lucide-react';

const PaymentSuccess = ({ orderToken, onViewOrder, onGoHome }) => {
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
          background: 'var(--surface-container-low)',
          borderRadius: '12px',
          padding: '32px 24px',
          textAlign: 'center'
        }}>
          <CheckCircle size={56} color="var(--color-delivered)" style={{ marginBottom: '16px' }} />

          <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
            ¡Pago exitoso!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            Tu pedido fue confirmado y está siendo procesado.
          </p>

          {orderToken && (
            <div style={{
              background: 'var(--bg-primary)',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                Token de seguimiento
              </p>
              <code style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                background: 'var(--surface-container-low)',
                display: 'block',
                padding: '8px',
                borderRadius: '8px',
                wordBreak: 'break-all'
              }}>
                {orderToken}
              </code>
              <button
                onClick={handleCopy}
                style={{
                  marginTop: '10px',
                  background: 'none',
                  border: '1px solid var(--outline-variant)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--text-secondary)'
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

export default PaymentSuccess;
