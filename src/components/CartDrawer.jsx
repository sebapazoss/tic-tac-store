import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartDrawer = ({ isOpen, onClose, onCheckout }) => {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  if (!isOpen) return null;

  const hasOutOfStock = cart.some(item => item.product.stock === 0);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
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
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.3)',
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
          border: 'none',
          borderLeft: '1px solid var(--outline-variant)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.05)',
          background: 'var(--bg-primary)',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 1001,
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--outline-variant)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={18} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em' }}>Mi Carrito</h2>
            <span style={{
              background: 'var(--surface-container-high)',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-secondary)'
            }}>
              {cartCount}
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
            <X size={18} />
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
              <ShoppingBag size={32} style={{ strokeWidth: 1.5, color: 'var(--text-muted)' }} />
              <p style={{ fontWeight: 600, fontSize: '14px' }}>El carrito está vacío</p>
              <button 
                onClick={onClose}
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '10px 16px', minHeight: 'auto' }}
              >
                Volver al catálogo
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
                  borderBottom: '1px solid var(--surface-container-high)',
                  alignItems: 'center'
                }}
              >
                {/* Visual fallback container */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '8px',
                  background: 'var(--surface-container-low)',
                  border: '1px solid var(--outline-variant)',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  color: 'var(--text-muted)'
                }}>
                  RELOJ
                </div>

                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <h4 style={{
                    fontSize: '13px',
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

                  {item.product.stock === 0 && (
                    <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700, textAlign: 'left' }}>
                      Sin stock
                    </span>
                  )}
                  {item.product.stock > 0 && item.product.stock <= 3 && (
                    <span style={{ fontSize: '10px', color: '#f97316', fontWeight: 700, textAlign: 'left' }}>
                      ¡Solo quedan {item.product.stock}!
                    </span>
                  )}

                  {/* Quantity Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--surface-container-low)',
                      borderRadius: '6px',
                      border: '1px solid var(--outline-variant)',
                      padding: '2px'
                    }}>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-primary)',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Minus size={10} />
                      </button>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        width: '24px',
                        textAlign: 'center'
                      }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-primary)',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: item.quantity >= item.product.stock ? 'not-allowed' : 'pointer',
                          opacity: item.quantity >= item.product.stock ? 0.3 : 1,
                        }}
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--text-primary)'
                  }}>
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-cancelled)',
                      cursor: 'pointer',
                      opacity: 0.8,
                      padding: '2px'
                    }}
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with total */}
        {cart.length > 0 && (
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--outline-variant)',
            background: 'var(--surface-container-low)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span className="label-caps" style={{ fontSize: '10px' }}>Total Estimado</span>
              <span style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--primary)',
              }}>
                {formatPrice(cartTotal)}
              </span>
            </div>

            {hasOutOfStock && (
              <div style={{
                background: 'var(--color-cancelled-bg)',
                border: '1px solid var(--color-cancelled)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '12px',
                color: 'var(--color-cancelled)',
                textAlign: 'left',
                lineHeight: '1.5'
              }}>
                {cart.filter(item => item.product.stock === 0).map(item => (
                  <div key={item.product.id}>
                    <strong>{item.product.name}</strong> está agotado.
                  </div>
                ))}
                <div style={{ marginTop: '4px' }}>
                  Retirá los artículos agotados para continuar.
                </div>
              </div>
            )}

            <button
              onClick={() => {
                onCheckout();
                onClose();
              }}
              className="btn btn-primary"
              disabled={hasOutOfStock}
              style={{
                width: '100%',
                fontSize: '12px',
                opacity: hasOutOfStock ? 0.5 : 1,
                cursor: hasOutOfStock ? 'not-allowed' : 'pointer',
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
