import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Checkout = ({ onNavigate }) => {
  const { user } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();

  const [customerName, setCustomerName] = useState(user ? user.name : '');
  const [customerEmail, setCustomerEmail] = useState(user ? user.email : '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If user is not logged in, they must login first to perform checkout
  useEffect(() => {
    if (!user) {
      onNavigate('login');
    }
  }, [user, onNavigate]);

  if (!user) return null;

  // Format currency (e.g. $35.000,00)
  const formatPrice = (val) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (cart.length === 0) {
      setError('Tu carrito está vacío. Agrega algunos productos antes de comprar.');
      return;
    }

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress) {
      setError('Por favor, completa todos los campos requeridos.');
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

      await api.post('/orders', orderData);
      
      // Success! Clear cart and go to Orders list
      clearCart();
      alert('¡Pedido realizado con éxito! Tu orden ha sido registrada.');
      onNavigate('orders');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.status === 422) {
        setError('Error de validación o stock insuficiente para alguno de los artículos seleccionados.');
      } else {
        setError('Ocurrió un error inesperado al procesar tu pedido. Por favor, intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      {/* Back to Catalog */}
      <button 
        onClick={() => onNavigate('catalog')}
        className="btn btn-secondary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          padding: '8px 14px',
          minHeight: 'auto',
          borderRadius: '10px'
        }}
      >
        <ArrowLeft size={16} /> Volver al catálogo
      </button>

      <h2 style={{
        fontSize: '24px',
        fontWeight: 800,
        fontFamily: 'var(--font-title)',
        marginBottom: '20px',
        textAlign: 'left'
      }}>
        Completar Compra
      </h2>

      {error && (
        <div style={{
          background: 'var(--color-cancelled-bg)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '12px 16px',
          color: '#fca5a5',
          fontSize: '13px',
          marginBottom: '20px',
          textAlign: 'left'
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '20px'
      }}>
        {/* Cart Summary Card */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 700,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '12px'
          }}>
            <ShoppingBag size={18} className="text-secondary" /> Resumen del Pedido
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {cart.map((item) => (
              <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)', textAlign: 'left' }}>
                  {item.product.name} <strong style={{ color: 'var(--text-primary)' }}>x{item.quantity}</strong>
                </span>
                <span style={{ fontWeight: 600 }}>
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>Total a pagar</span>
            <span style={{
              fontSize: '20px',
              fontWeight: 800,
              color: 'var(--primary)',
              fontFamily: 'var(--font-title)'
            }}>
              {formatPrice(cartTotal)}
            </span>
          </div>
        </div>

        {/* Shipping Form Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 700,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '12px'
          }}>
            <CreditCard size={18} className="text-secondary" /> Datos de Envío y Facturación
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
                placeholder="ejemplo@correo.com"
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
                placeholder="Ej: +54 9 381 4001234"
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
              <label htmlFor="checkout-notes">Notas / Instrucciones adicionales</label>
              <textarea
                id="checkout-notes"
                className="form-input"
                placeholder="Ej. Entregar después de las 18:00 hs, timbre roto..."
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
              {loading ? 'Confirmando pedido...' : 'Realizar Pedido'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
