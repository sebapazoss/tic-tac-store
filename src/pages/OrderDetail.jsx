import { useState } from 'react';
import { Copy, Trash2, ChevronLeft, Package, Clock } from 'lucide-react';
import { ordersAPI } from '../services/api';

export default function OrderDetail({ order, onBack }) {
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [orderStatus, setOrderStatus] = useState(order?.status);
  const [error, setError] = useState('');

  const canCancel = ['pending', 'processing'].includes(orderStatus);

  const handleCopyLink = () => {
    const link = `${window.location.origin}?token=${order.access_token}&email=${order.customer_email}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCancelOrder = async () => {
    setLoading(true);
    setError('');
    try {
      await ordersAPI.cancelGuest(order.access_token, {
        email: order.customer_email,
      });
      setOrderStatus('cancelled');
      setShowCancelModal(false);
    } catch (err) {
      if (err.response?.status === 422) {
        setError('Este pedido no puede ser cancelado en su estado actual');
      } else {
        setError('No se pudo cancelar el pedido.');
      }
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    pending: { label: 'Pendiente', color: '#FFA500', bg: 'var(--color-pending-bg)', text: 'var(--color-pending)' },
    processing: { label: 'En proceso', color: '#2196F3', bg: 'var(--color-processing-bg)', text: 'var(--color-processing)' },
    shipped: { label: 'Enviado', color: '#9C27B0', bg: 'var(--color-shipped-bg)', text: 'var(--color-shipped)' },
    delivered: { label: 'Entregado', color: '#4CAF50', bg: 'var(--color-delivered-bg)', text: 'var(--color-delivered)' },
    cancelled: { label: 'Cancelado', color: '#F44336', bg: 'var(--color-cancelled-bg)', text: 'var(--color-cancelled)' },
  };

  const status = statusConfig[orderStatus] || statusConfig.pending;

  const formatPrice = (val) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '20px',
          marginLeft: '20px',
          padding: '6px 12px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--primary)',
          fontWeight: 600,
          fontSize: '13px'
        }}
      >
        <ChevronLeft size={16} /> Volver
      </button>

      <div style={{ maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '20px', paddingRight: '20px' }}>
        {/* Estado Card */}
        <div style={{
          background: status.bg,
          border: `1px solid ${status.text}`,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <p style={{ fontSize: '11px', color: status.text, textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
            Estado del pedido
          </p>
          <p style={{ fontSize: '20px', fontWeight: 700, color: status.text }}>
            {status.label}
          </p>
        </div>

        {/* Información Principal */}
        <div style={{
          background: 'var(--surface-container-low)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                Número de pedido
              </p>
              <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>
                #{order.id}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                Fecha
              </p>
              <p style={{ fontSize: '13px', fontWeight: 600 }}>
                {formatDate(order.created_at)}
              </p>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'var(--color-cancelled-bg)',
              border: '1px solid var(--color-cancelled)',
              borderRadius: '10px',
              padding: '12px 14px',
              color: 'var(--color-cancelled)',
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Datos de Envío */}
          <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '16px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Información de envío
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Nombre:</span>
                <span style={{ fontWeight: 600 }}>{order.customer_name}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
                <span style={{ fontWeight: 600, wordBreak: 'break-all' }}>{order.customer_email}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Teléfono:</span>
                <span style={{ fontWeight: 600 }}>{order.customer_phone}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Dirección:</span>
                <span style={{ fontWeight: 600 }}>{order.shipping_address}</span>
              </div>
              {order.notes && (
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Notas:</span>
                  <span style={{ fontWeight: 600 }}>{order.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Artículos */}
        <div style={{
          background: 'var(--surface-container-low)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <p style={{ fontSize: '12px', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={14} /> Artículos
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {order.items?.map((item) => (
              <div key={item.id} style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 80px',
                gap: '12px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--outline-variant)',
                alignItems: 'start'
              }}>
                {/* Imagen */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '10px',
                  background: 'var(--bg-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  {item.product?.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <Package size={32} style={{ color: 'var(--text-secondary)' }} />
                  )}
                </div>

                {/* Información */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>
                    {item.product?.name}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Cantidad: <strong>{item.quantity}</strong>
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Precio: {formatPrice(item.unit_price)}
                  </p>
                </div>

                {/* Precio Total */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary)' }}>
                    {formatPrice(item.subtotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--outline-variant)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
              <span>{formatPrice((order.total || 0) - (order.shipping_cost || 0))}</span>
            </div>
            {order.shipping_cost > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Envío:</span>
                <span>{formatPrice(order.shipping_cost)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700 }}>
              <span>Total:</span>
              <span style={{ color: 'var(--primary)' }}>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button
            onClick={handleCopyLink}
            style={{
              flex: 1,
              background: 'var(--surface-container-high)',
              color: 'var(--primary)',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 16px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
          >
            <Copy size={16} />
            {copiedLink ? '¡Copiado!' : 'Copiar enlace'}
          </button>

          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={loading}
              style={{
                flex: 1,
                background: 'var(--color-cancelled)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 16px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              <Trash2 size={16} />
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Modal de cancelación */}
      {showCancelModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            background: 'var(--bg-primary)',
            borderRadius: '16px 16px 0 0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'var(--color-cancelled-bg)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Trash2 size={20} style={{ color: 'var(--color-cancelled)' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700 }}>¿Cancelar pedido?</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Esta acción no se puede deshacer</p>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Una vez cancelado, tu pedido no podrá ser revertido. ¿Estás seguro de continuar?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={loading}
                style={{
                  background: 'var(--surface-container-low)',
                  color: 'var(--text-primary)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: loading ? 0.6 : 1
                }}
              >
                No, volver
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={loading}
                style={{
                  background: 'var(--color-cancelled)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
