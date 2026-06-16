import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, Plus, Minus, Check, Edit } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetail = ({ product, onBack, onEdit }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const { id, name, description, price, stock, brand, image_url } = product;

  // Format currency (e.g. $35.000,00)
  const formatPrice = (val) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(val);
  };

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 3;
  const isSellerOrAdmin = user && (user.role === 'vendedor' || user.role === 'admin');

  // Dynamic aesthetic background gradient fallback
  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };
  const getGradient = (productId, label) => {
    const seed = hashString(label + productId);
    const h1 = Math.abs(seed % 360);
    const h2 = (h1 + 60) % 360;
    return `linear-gradient(135deg, hsl(${h1}, 70%, 40%), hsl(${h2}, 80%, 20%))`;
  };

  const handleQtyChange = (val) => {
    if (val >= 1 && val <= stock) {
      setQty(val);
    }
  };

  const handleAddToCart = () => {
    if (qty > 0 && qty <= stock) {
      addToCart(product, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      {/* Back button */}
      <button 
        onClick={onBack}
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

      {/* Detail Card */}
      <div className="glass-card" style={{
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Visual Container */}
        <div style={{
          width: '100%',
          height: '240px',
          position: 'relative',
          background: getGradient(id || 0, name),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {brand && (
            <span style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: 'rgba(9, 13, 22, 0.8)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {brand}
            </span>
          )}

          {image_url && image_url.startsWith('http') ? (
            <img 
              src={image_url} 
              alt={name} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <span style={{ fontSize: '72px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>⌚</span>
          )}
        </div>

        {/* Content Box */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h1 style={{
              fontSize: '22px',
              fontWeight: 800,
              fontFamily: 'var(--font-title)',
              marginBottom: '8px',
              lineHeight: 1.3,
              textAlign: 'left'
            }}>
              {name}
            </h1>

            {/* Price tag */}
            <span style={{
              fontSize: '26px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-title)',
              display: 'block',
              textAlign: 'left',
              margin: '8px 0'
            }}>
              {formatPrice(price)}
            </span>

            {/* Stock status indicator */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
              {isOutOfStock ? (
                <span className="badge badge-cancelled">Sin Stock Disponible</span>
              ) : isLowStock ? (
                <span className="badge badge-pending">¡Últimas unidades! Solo quedan {stock}</span>
              ) : (
                <span className="badge badge-delivered">Unidades Disponibles ({stock})</span>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textAlign: 'left' }}>
              Descripción del Producto
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              textAlign: 'left',
              whiteSpace: 'pre-wrap'
            }}>
              {description || 'Este producto no cuenta con una descripción detallada en este momento.'}
            </p>
          </div>

          {/* Action Row */}
          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '20px',
            marginTop: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {isSellerOrAdmin ? (
              <button
                onClick={() => onEdit(product)}
                disabled={user.role === 'vendedor' && user.status !== 'approved'}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <Edit size={16} /> Editar Producto
              </button>
            ) : (
              <>
                {!isOutOfStock && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Cantidad</span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      padding: '2px'
                    }}>
                      <button 
                        onClick={() => handleQtyChange(qty - 1)}
                        disabled={qty <= 1}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-primary)',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          opacity: qty <= 1 ? 0.3 : 1
                        }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        width: '36px',
                        textAlign: 'center'
                      }}>
                        {qty}
                      </span>
                      <button 
                        onClick={() => handleQtyChange(qty + 1)}
                        disabled={qty >= stock}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-primary)',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          opacity: qty >= stock ? 0.3 : 1
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`btn ${added ? 'btn-success' : 'btn-primary'}`}
                  style={{
                    width: '100%',
                    fontSize: '15px',
                  }}
                >
                  {added ? (
                    <>
                      <Check size={18} /> ¡Agregado al carrito!
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} /> {isOutOfStock ? 'Agotado' : 'Añadir al Carrito'}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
