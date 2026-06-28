import { XCircle } from 'lucide-react';

const PaymentFailure = ({ onRetry, onGoHome }) => {
  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ maxWidth: '400px', margin: '32px auto', padding: '0 20px' }}>
        <div style={{
          background: 'var(--color-cancelled-bg, #fff5f5)',
          border: '1px solid var(--color-cancelled)',
          borderRadius: '12px',
          padding: '32px 24px',
          textAlign: 'center'
        }}>
          <XCircle size={56} color="var(--color-cancelled)" style={{ marginBottom: '16px' }} />

          <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-cancelled)' }}>
            Pago rechazado
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
            Tu pago no pudo procesarse.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
            Podés intentar nuevamente con otro medio de pago.
          </p>

          <button
            onClick={onRetry}
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
              marginBottom: '10px'
            }}
          >
            Intentar de nuevo
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

export default PaymentFailure;
