import React from 'react';
import { ShoppingCart, Edit, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, onSelect, onEdit }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const { name, description, price, stock, brand, image_url } = product;

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

  // Contextual actions based on role
  const isSellerOrAdmin = user && (user.role === 'vendedor' || user.role === 'admin');

  // Generate fallback visual styling using dynamic CSS gradients based on product ID/name
  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };
  const getGradient = (id, label) => {
    const seed = hashString(label + id);
    const h1 = Math.abs(seed % 360);
    const h2 = (h1 + 60) % 360;
    return `linear-gradient(135deg, hsl(${h1}, 70%, 45%), hsl(${h2}, 80%, 25%))`;
  };

  return (
    <div 
      className="glass-card" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        cursor: 'pointer'
      }}
      onClick={() => onSelect(product)}
    >
      {/* Brand Badge */}
      {brand && (
        <span style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(9, 13, 22, 0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          fontSize: '10px',
          fontWeight: 700,
          padding: '4px 8px',
          borderRadius: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          zIndex: 2
        }}>
          {brand}
        </span>
      )}

      {/* Image / Fallback Gradient */}
      <div style={{
        width: '100%',
        height: '160px',
        position: 'relative',
        background: getGradient(product.id || 0, name),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {image_url && image_url.startsWith('http') ? (
          <img 
            src={image_url} 
            alt={name} 
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onError={(e) => {
              // If image fails to load, remove image element and show gradient background
              e.currentTarget.style.display = 'none';
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
        ) : (
          <div style={{
            fontSize: '44px',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
          }}>
            ⌚
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        gap: '8px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          lineHeight: 1.3,
          color: 'var(--text-primary)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minHeight: '42px',
          textAlign: 'left'
        }}>
          {name}
        </h3>

        <p style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minHeight: '36px',
          textAlign: 'left'
        }}>
          {description || 'Sin descripción disponible.'}
        </p>

        {/* Stock Status */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0', textAlign: 'left' }}>
          {isOutOfStock ? (
            <span className="badge badge-cancelled">Agotado</span>
          ) : isLowStock ? (
            <span className="badge badge-pending">Últimas {stock} un.</span>
          ) : (
            <span className="badge badge-delivered" style={{ fontSize: '10px' }}>En Stock ({stock})</span>
          )}
        </div>

        {/* Price & Action Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <span style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-title)'
          }}>
            {formatPrice(price)}
          </span>

          {/* Contextual Action Button */}
          {isSellerOrAdmin ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="btn btn-secondary"
              style={{
                width: '36px',
                height: '36px',
                padding: 0,
                minHeight: 'auto',
                minWidth: 'auto',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Editar producto"
            >
              <Edit size={16} />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isOutOfStock) {
                  addToCart(product, 1);
                }
              }}
              disabled={isOutOfStock}
              className="btn btn-primary"
              style={{
                width: '36px',
                height: '36px',
                padding: 0,
                minHeight: 'auto',
                minWidth: 'auto',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isOutOfStock ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, var(--primary), var(--accent))'
              }}
              title="Añadir al carrito"
            >
              <ShoppingCart size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
