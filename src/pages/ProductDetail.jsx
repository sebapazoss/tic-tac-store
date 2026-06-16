import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, Plus, Minus, Check, Edit } from 'lucide-react';
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
      minimumFractionDigits: 0
    }).format(val);
  };

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 3;
  const isSellerOrAdmin = user && (user.role === 'vendedor' || user.role === 'admin');

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

      {/* Detail Card */}
      <div className="glass-card" style={{
        overflow: 'hidden',
        border: '1px solid var(--outline-variant)',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff'
      }}>
        {/* Visual Container */}
        <div style={{
          width: '100%',
          height: '280px',
          position: 'relative',
          background: 'var(--surface-container-low)',
          borderBottom: '1px solid var(--outline-variant)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {brand && (
            <span className="label-caps" style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: '#ffffff',
              border: '1px solid var(--outline-variant)',
              fontSize: '10px',
              padding: '4px 10px',
              borderRadius: '6px'
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
            <span className="label-caps" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              HOROLOGY COLLECTION
            </span>
          )}
        </div>

        {/* Content Box */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              marginBottom: '8px',
              lineHeight: 1.3,
              textAlign: 'left'
            }}>
              {name}
            </h1>

            {/* Price tag */}
            <span style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--primary)',
              display: 'block',
              textAlign: 'left',
              margin: '8px 0'
            }}>
              {formatPrice(price)}
            </span>

            {/* Stock status indicator */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
              {isOutOfStock ? (
                <span className="badge badge-cancelled">Sin Stock</span>
              ) : isLowStock ? (
                <span className="badge badge-pending">Últimas {stock} unidades</span>
              ) : (
                <span className="badge badge-delivered">Disponible ({stock})</span>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '16px' }}>
            <h3 className="label-caps" style={{ fontSize: '10px', marginBottom: '8px', textAlign: 'left' }}>
              Especificaciones y Detalles
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              textAlign: 'left',
              whiteSpace: 'pre-wrap'
            }}>
              {description || 'Este reloj de lujo no posee una descripción cargada actualmente.'}
            </p>
          </div>

          {/* Action Row */}
          <div style={{
            borderTop: '1px solid var(--outline-variant)',
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
                Editar Reloj
              </button>
            ) : (
              <>
                {!isOutOfStock && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--surface-container-low)',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--outline-variant)'
                  }}>
                    <span className="label-caps" style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Cantidad</span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#ffffff',
                      borderRadius: '6px',
                      padding: '2px',
                      border: '1px solid var(--outline-variant)'
                    }}>
                      <button 
                        onClick={() => handleQtyChange(qty - 1)}
                        disabled={qty <= 1}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-primary)',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          opacity: qty <= 1 ? 0.3 : 1
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        width: '32px',
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
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          opacity: qty >= stock ? 0.3 : 1
                        }}
                      >
                        <Plus size={12} />
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
                    fontSize: '11px',
                  }}
                >
                  {added ? (
                    <>
                      <Check size={16} /> Agregado
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} /> {isOutOfStock ? 'Agotado' : 'Añadir al Carrito'}
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
