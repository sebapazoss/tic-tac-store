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

  useEffect(() => {
    if (!user) {
      onNavigate('login');
    }
  }, [user, onNavigate]);

  if (!user) return null;

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

      await api.post('/orders', orderData);
      
      clearCart();
      alert('Pedido realizado con éxito.');
      onNavigate('orders');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.status === 422) {
        setError('Error: Stock insuficiente para alguno de los artículos.');
      } else {
        setError('Error inesperado al intentar registrar tu pedido.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      {/* Back button */}
      <button 
        onClick={() => onNavigate('catalog')}
        className="btn btn-secondary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '20px',
          padding: '6px 12px',
          minHeight: 'auto',
          borderRadius: '8px',
          fontSize: '11px'
        }}
      >
        <ArrowLeft size={14} /> Volver al catálogo
      </button>

      <h2 style={{
        fontSize: '20px',
        fontWeight: 700,
        marginBottom: '20px',
        textAlign: 'left',
        letterSpacing: '-0.01em'
      }}>
        Completar Compra
      </h2>

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
              <div key={item.product.id} style={{ display: 'flex', justifyContext: 'space-between', justifyContent: 'space-between', fontSize: '13px' }}>
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
              {loading ? 'Confirmando...' : 'Completar Compra'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
