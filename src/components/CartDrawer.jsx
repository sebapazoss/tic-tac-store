import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartDrawer = ({ isOpen, onClose, onCheckout }) => {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  if (!isOpen) return null;

  // Format currency (e.g. $35.000,00)
  const formatPrice = (val) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(val);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(9, 13, 22, 0.7)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeInOverlay 0.2s ease-out'
        }}
      />

      {/* Drawer Panel */}
      <div 
        className="glass-card"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          borderRadius: 0,
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
          background: 'var(--bg-secondary)',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 1001,
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} className="text-secondary" />
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Mi Carrito</h2>
            <span style={{
              background: 'rgba(255,255,255,0.06)',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}>
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart items list */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {cart.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '12px',
              color: 'var(--text-secondary)'
            }}>
              <span style={{ fontSize: '48px' }}>🛒</span>
              <p style={{ fontWeight: 500 }}>Tu carrito está vacío</p>
              <button 
                onClick={onClose}
                className="btn btn-secondary"
                style={{ fontSize: '13px', padding: '10px 16px', minHeight: 'auto' }}
              >
                Volver a la tienda
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div 
                key={item.product.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  alignItems: 'center'
                }}
              >
                {/* Visual ID representation fallback gradient */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  ⌚
                </div>

                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: 'var(--text-primary)',
                    textAlign: 'left'
                  }}>
                    {item.product.name}
                  </h4>
                  <span style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    textAlign: 'left'
                  }}>
                    {formatPrice(item.product.price)} c/u
                  </span>

                  {/* Quantity Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      padding: '2px'
                    }}>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-primary)',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        width: '28px',
                        textAlign: 'center'
                      }}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-primary)',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-title)'
                  }}>
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-cancelled)',
                      cursor: 'pointer',
                      opacity: 0.7,
                      padding: '4px'
                    }}
                    title="Eliminar ítem"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with totals */}
        {cart.length > 0 && (
          <div style={{
            padding: '24px',
            borderTop: '1px solid var(--border-color)',
            background: 'rgba(9, 13, 22, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>Total Compra</span>
              <span style={{
                fontSize: '22px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-title)'
              }}>
                {formatPrice(cartTotal)}
              </span>
            </div>

            <button 
              onClick={() => {
                onCheckout();
                onClose();
              }}
              className="btn btn-primary"
              style={{
                width: '100%',
                fontSize: '15px'
              }}
            >
              Continuar Compra
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default CartDrawer;
