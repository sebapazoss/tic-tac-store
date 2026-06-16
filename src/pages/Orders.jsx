import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, MapPin, Phone, User, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const isSellerOrAdmin = user && (user.role === 'vendedor' || user.role === 'admin');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = isSellerOrAdmin ? '/admin/orders' : '/orders';
      const response = await api.get(endpoint);
      setOrders(response.data || []);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los pedidos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [isSellerOrAdmin]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  const handleToggleExpand = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}`, { status: newStatus });
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error(err);
      alert('Error al intentar cambiar el estado del pedido.');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="glass-card" style={{ padding: '40px 24px', textAlign: 'center', marginTop: '40px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Por favor, inicia sesión para consultar tus pedidos.</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ paddingBottom: '32px' }}>
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: 700, 
        marginBottom: '20px',
        textAlign: 'left',
        letterSpacing: '-0.01em'
      }}>
        {isSellerOrAdmin ? 'Pedidos de la Tienda' : 'Mis Pedidos'}
      </h2>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="glass-card" style={{
          padding: '24px',
          textAlign: 'center',
          border: '1px solid var(--color-cancelled)',
          color: 'var(--text-secondary)'
        }}>
          <p style={{ fontSize: '13px' }}>{error}</p>
          <button onClick={fetchOrders} className="btn btn-secondary" style={{ marginTop: '12px', padding: '8px 16px', minHeight: 'auto', fontSize: '11px' }}>
            Reintentar
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card" style={{
          padding: '40px 24px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          background: '#ffffff'
        }}>
          <p style={{ fontWeight: 600, fontSize: '14px' }}>
            {isSellerOrAdmin ? 'No existen pedidos registrados en el sistema.' : 'Aún no posees ningún pedido realizado.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const items = order.items || [];
            const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            return (
              <div 
                key={order.id} 
                className="glass-card" 
                style={{
                  border: '1px solid var(--outline-variant)',
                  overflow: 'hidden',
                  padding: '16px',
                  background: '#ffffff'
                }}
              >
                {/* Header */}
                <div 
                  onClick={() => handleToggleExpand(order.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>
                      Orden #{order.id}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {formatDate(order.created_at)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700 }}>
                        {formatPrice(orderTotal)}
                      </span>
                      <span className={`badge badge-${order.status || 'pending'}`}>
                        {order.status === 'pending' && 'Pendiente'}
                        {order.status === 'processing' && 'Proceso'}
                        {order.status === 'shipped' && 'Enviado'}
                        {order.status === 'delivered' && 'Entregado'}
                        {order.status === 'cancelled' && 'Cancelado'}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--surface-container-highest)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    animation: 'slideDown 0.2s ease-out'
                  }}>
                    {/* Customer Info */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      background: 'var(--surface-container-low)',
                      border: '1px solid var(--outline-variant)',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      textAlign: 'left'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <User size={13} /> <strong>Destinatario:</strong> {order.customer_name} ({order.customer_email})
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <Phone size={13} /> <strong>Teléfono:</strong> {order.customer_phone}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <MapPin size={13} /> <strong>Dirección:</strong> {order.shipping_address}
                      </div>
                      {order.notes && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)' }}>
                          <Clock size={13} style={{ marginTop: '2px' }} /> 
                          <div>
                            <strong>Notas:</strong> <span style={{ fontStyle: 'italic' }}>{order.notes}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order items details */}
                    <div>
                      <h4 className="label-caps" style={{ fontSize: '9px', marginBottom: '8px', textAlign: 'left' }}>
                        Relojes Adquiridos
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {items.map((item, idx) => (
                          <div 
                            key={item.id || idx} 
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              fontSize: '13px',
                              padding: '4px 0',
                              borderBottom: '1px dashed var(--surface-container-highest)'
                            }}
                          >
                            <span style={{ color: 'var(--text-secondary)', textAlign: 'left' }}>
                              {item.product ? item.product.name : `Reloj ID #${item.product_id}`} 
                              <strong style={{ color: 'var(--primary)' }}> x{item.quantity}</strong>
                            </span>
                            <span style={{ fontWeight: 600 }}>
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status modifications */}
                    {isSellerOrAdmin && (
                      <div style={{
                        borderTop: '1px solid var(--surface-container-highest)',
                        paddingTop: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        alignItems: 'flex-start'
                      }}>
                        <span className="label-caps" style={{ fontSize: '9px' }}>
                          Actualizar estado de orden
                        </span>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', width: '100%' }}>
                          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((statusOption) => {
                            const isCurrent = order.status === statusOption;
                            return (
                              <button
                                key={statusOption}
                                onClick={() => handleUpdateStatus(order.id, statusOption)}
                                disabled={updatingId === order.id || isCurrent}
                                className="btn"
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '10px',
                                  minWidth: 'auto',
                                  minHeight: 'auto',
                                  borderRadius: '6px',
                                  background: isCurrent ? 'var(--primary)' : 'var(--surface-container-high)',
                                  border: `1px solid ${isCurrent ? 'var(--primary)' : 'var(--outline-variant)'}`,
                                  color: isCurrent ? '#fff' : 'var(--text-secondary)',
                                  opacity: updatingId === order.id ? 0.5 : 1
                                }}
                              >
                                {statusOption === 'pending' && 'Pendiente'}
                                {statusOption === 'processing' && 'Proceso'}
                                {statusOption === 'shipped' && 'Enviado'}
                                {statusOption === 'delivered' && 'Entregado'}
                                {statusOption === 'cancelled' && 'Anular'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Orders;
