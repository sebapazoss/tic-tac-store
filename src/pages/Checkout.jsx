import { useState, useEffect } from 'react';
import { ShoppingBag, CreditCard, Copy, CheckCircle, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ordersAPI, productsAPI } from '../services/api';

const Checkout = ({ onOrderCreated, onBack }) => {
  const { cart, cartTotal, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [stockCheck, setStockCheck] = useState({ status: 'pending' });

  useEffect(() => {
    if (cart.length === 0) {
      setStockCheck({ status: 'ok' });
      return;
    }
    Promise.all(cart.map(item => productsAPI.getById(item.product.id)))
      .then(responses => {
        const issues = [];
        responses.forEach((res, i) => {
          const freshStock = res.data.stock;
          const requested = cart[i].quantity;
          if (freshStock < requested) {
            issues.push({
              name: cart[i].product.name,
              requested,
              available: freshStock,
            });
          }
        });
        setStockCheck(issues.length > 0
          ? { status: 'error', issues }
          : { status: 'ok' }
        );
      })
      .catch(() => setStockCheck({ status: 'ok' }));
  }, []);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (cart.length === 0) {
      setError('Tu carrito está vacío. Agrega relojes antes de proceder.');
      return;
    }

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress) {
      setError('Por favor, completa los campos obligatorios (*).');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        notes: notes,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        }))
      };
      
      const response = await ordersAPI.create(orderData);

      if (response.data.init_point) {
        clearCart();
        window.location.href = response.data.init_point;
      } else {
        // Fallback: la orden se creó pero MP no pudo generar la preferencia
        setOrderCreated({
          id: response.data.id,
          token: response.data.access_token,
          email: response.data.customer_email,
          total: response.data.total,
        });
        clearCart();
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 422) {
        setError('Error: Stock insuficiente para alguno de los artículos.');
      } else {
        setError('Error inesperado al intentar registrar tu pedido.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}?token=${orderCreated.token}&email=${orderCreated.email}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Si la orden fue creada exitosamente
  if (orderCreated) {
    return (
      <div style={{ paddingBottom: '40px' }}>
        <div style={{ maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '20px', paddingRight: '20px', paddingTop: '32px' }}>
          <div style={{
            background: 'var(--surface-container-low)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <CheckCircle size={48} color="var(--success, #4caf50)" />
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
              ¡Pedido creado exitosamente!
            </h1>
            
            <div style={{
              background: 'var(--bg-primary)',
              borderRadius: '12px',
              padding: '16px',
              marginTop: '16px',
              marginBottom: '16px',
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Número de pedido
                </p>
                <p style={{ fontSize: '18px', fontWeight: 700 }}>
                  #{orderCreated.id}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Token de acceso
                </p>
                <code style={{
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  background: 'var(--surface-container-low)',
                  display: 'block',
                  padding: '8px',
                  borderRadius: '8px',
                  wordBreak: 'break-all',
                  marginTop: '4px'
                }}>
                  {orderCreated.token}
                </code>
              </div>
            </div>

            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              📧 Se envió un email de confirmación a <strong>{orderCreated.email}</strong>
            </p>

            <button
              onClick={handleCopyLink}
              style={{
                width: '100%',
                background: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              <Copy size={16} />
              {copiedLink ? '¡Enlace copiado!' : 'Copiar enlace'}
            </button>

            <button
              onClick={() => onOrderCreated(orderCreated)}
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
              Ver estado del pedido
            </button>

            <p style={{
              fontSize: '11px',
              color: 'var(--text-secondary)',
              marginTop: '16px'
            }}>
              Guarda el token para poder consultar tu pedido en el futuro
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Verificando disponibilidad de stock
  if (stockCheck.status === 'pending') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '16px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid var(--outline-variant)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Verificando disponibilidad...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Stock insuficiente detectado antes de mostrar el formulario
  if (stockCheck.status === 'error') {
    return (
      <div style={{ paddingBottom: '40px' }}>
        <div style={{ maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '20px', paddingRight: '20px', paddingTop: '32px' }}>
          <div style={{ background: 'var(--surface-container-low)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <AlertTriangle size={40} color="#f97316" />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Stock insuficiente
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
              Algunos productos ya no tienen el stock necesario para tu pedido:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {stockCheck.issues.map((issue, i) => (
                <div key={i} style={{
                  background: 'var(--color-cancelled-bg)',
                  border: '1px solid var(--color-cancelled)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  textAlign: 'left'
                }}>
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>{issue.name}</span>
                  <br />
                  <span style={{ fontSize: '12px', color: 'var(--color-cancelled)' }}>
                    {issue.available === 0
                      ? 'Sin stock disponible'
                      : `Pediste ${issue.requested}, solo quedan ${issue.available}`}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={onBack}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Volver al catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de checkout
  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 700,
        marginBottom: '20px',
        textAlign: 'left',
        letterSpacing: '-0.01em',
        paddingLeft: '20px'
      }}>
        Finalizar Compra
      </h2>

      <div style={{ maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '20px', paddingRight: '20px' }}>
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

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '20px'
        }}>
          {/* Cart Summary */}
          <div className="glass-card" style={{ padding: '20px', background: '#ffffff' }}>
            <h3 className="label-caps" style={{
              fontSize: '11px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid var(--outline-variant)',
              paddingBottom: '10px'
            }}>
              <ShoppingBag size={14} /> Resumen de Artículos
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {cart.map((item) => (
                <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)', textAlign: 'left' }}>
                    {item.product.name} <strong style={{ color: 'var(--primary)' }}>x{item.quantity}</strong>
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              borderTop: '1px solid var(--outline-variant)',
              paddingTop: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span className="label-caps" style={{ fontSize: '10px' }}>Total Final</span>
              <span style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--primary)',
              }}>
                {formatPrice(cartTotal)}
              </span>
            </div>
          </div>

          {/* Shipping Form */}
          <div className="glass-card" style={{ padding: '24px', background: '#ffffff' }}>
            <h3 className="label-caps" style={{
              fontSize: '11px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid var(--outline-variant)',
              paddingBottom: '10px'
            }}>
              <CreditCard size={14} /> Información de Envío
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="checkout-name">Nombre Completo *</label>
                <input
                  id="checkout-name"
                  type="text"
                  className="form-input"
                  placeholder="Nombre de quien recibe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="checkout-email">Correo Electrónico *</label>
                <input
                  id="checkout-email"
                  type="email"
                  className="form-input"
                  placeholder="correo@ejemplo.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="checkout-phone">Teléfono de Contacto *</label>
                <input
                  id="checkout-phone"
                  type="tel"
                  className="form-input"
                  placeholder="Ej. +54 9 381 4001234"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="checkout-address">Dirección de Entrega *</label>
                <input
                  id="checkout-address"
                  type="text"
                  className="form-input"
                  placeholder="Av. Siempreviva 742, Tucumán"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label htmlFor="checkout-notes">Indicaciones Especiales</label>
                <textarea
                  id="checkout-notes"
                  className="form-input"
                  placeholder="Ej. Dejar en recepción, timbre descompuesto..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={loading}
                  style={{
                    minHeight: '80px',
                    resize: 'vertical',
                    padding: '12px'
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading || cart.length === 0}
              >
                {loading ? 'Redirigiendo a Mercado Pago...' : 'Pagar con Mercado Pago'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
