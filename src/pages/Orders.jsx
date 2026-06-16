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
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error(err);
      alert('Error al intentar actualizar el estado del pedido.');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(val);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="glass-card" style={{ padding: '40px 24px', textAlign: 'center', marginTop: '40px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Por favor, inicia sesión para ver tus pedidos.</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ paddingBottom: '32px' }}>
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: 800, 
        fontFamily: 'var(--font-title)', 
        marginBottom: '20px',
        textAlign: 'left'
      }}>
        {isSellerOrAdmin ? 'Pedidos de la Tienda' : 'Mis Pedidos'}
      </h2>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="glass-card" style={{
          padding: '24px',
          textAlign: 'center',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: 'var(--text-secondary)'
        }}>
          <p>{error}</p>
          <button onClick={fetchOrders} className="btn btn-secondary" style={{ marginTop: '12px', padding: '8px 16px', minHeight: 'auto' }}>
            Reintentar
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card" style={{
          padding: '40px 24px',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>📦</span>
          <p style={{ fontWeight: 500 }}>
            {isSellerOrAdmin ? 'No hay pedidos registrados en la tienda todavía.' : 'Aún no has realizado ningún pedido.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const items = order.items || [];
            
            // Calculate total price based on order items
            const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            return (
              <div 
                key={order.id} 
                className="glass-card" 
                style={{
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  padding: '16px'
                }}
              >
                {/* Order Summary Header */}
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
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Orden #{order.id}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {formatDate(order.created_at)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {formatPrice(orderTotal)}
                      </span>
                      {/* Badge status */}
                      <span className={`badge badge-${order.status || 'pending'}`}>
                        {order.status === 'pending' && 'Pendiente'}
                        {order.status === 'processing' && 'En Proceso'}
                        {order.status === 'shipped' && 'Enviado'}
                        {order.status === 'delivered' && 'Entregado'}
                        {order.status === 'cancelled' && 'Cancelado'}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-secondary" /> : <ChevronDown size={18} className="text-secondary" />}
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    animation: 'slideDown 0.2s ease-out'
                  }}>
                    {/* Customer Info Card Details */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr',
                      gap: '8px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '12px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      textAlign: 'left'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <User size={14} /> <strong>Destinatario:</strong> {order.customer_name} ({order.customer_email})
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <Phone size={14} /> <strong>Teléfono:</strong> {order.customer_phone}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <MapPin size={14} /> <strong>Dirección:</strong> {order.shipping_address}
                      </div>
                      {order.notes && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          <Clock size={14} style={{ marginTop: '2px' }} /> 
                          <div>
                            <strong>Notas:</strong> <span style={{ fontStyle: 'italic' }}>{order.notes}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)', textAlign: 'left' }}>
                        Productos en Pedido
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
                              borderBottom: '1px dashed rgba(255, 255, 255, 0.03)'
                            }}
                          >
                            <span style={{ color: 'var(--text-secondary)', textAlign: 'left' }}>
                              {item.product ? item.product.name : `Producto ID #${item.product_id}`} 
                              <strong style={{ color: 'var(--text-primary)' }}> x{item.quantity}</strong>
                            </span>
                            <span style={{ fontWeight: 600 }}>
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Admin/Seller Actions to Change State */}
                    {isSellerOrAdmin && (
                      <div style={{
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        paddingTop: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        alignItems: 'flex-start'
                      }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          Gestionar Estado de la Orden
                        </span>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%' }}>
                          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((statusOption) => {
                            const isCurrent = order.status === statusOption;
                            return (
                              <button
                                key={statusOption}
                                onClick={() => handleUpdateStatus(order.id, statusOption)}
                                disabled={updatingId === order.id || isCurrent}
                                className="btn"
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '11px',
                                  minWidth: 'auto',
                                  minHeight: 'auto',
                                  borderRadius: '6px',
                                  background: isCurrent ? 'var(--primary)' : 'rgba(255, 255, 255, 0.03)',
                                  border: `1px solid ${isCurrent ? 'var(--primary)' : 'var(--border-color)'}`,
                                  color: isCurrent ? '#fff' : 'var(--text-secondary)',
                                  opacity: updatingId === order.id ? 0.5 : 1
                                }}
                              >
                                {statusOption === 'pending' && 'Pendiente'}
                                {statusOption === 'processing' && 'En Proceso'}
                                {statusOption === 'shipped' && 'Enviado'}
                                {statusOption === 'delivered' && 'Entregado'}
                                {statusOption === 'cancelled' && 'Cancelar'}
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
