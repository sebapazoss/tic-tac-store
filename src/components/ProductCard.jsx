import React from 'react';
import { ShoppingBag, Edit } from 'lucide-react';
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
      minimumFractionDigits: 0 // Clean integer price display
    }).format(val);
  };

  const isOutOfStock = stock <= 0;
  const isSellerOrAdmin = user && (user.role === 'vendedor' || user.role === 'admin');

  return (
    <div 
      className="flex flex-col group cursor-pointer" 
      onClick={() => onSelect(product)}
      style={{ textAlign: 'left' }}
    >
      {/* Product Image Container */}
      <div 
        className="relative aspect-[4/5] bg-surface-container-low rounded-xl mb-3 overflow-hidden product-card-shadow"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface-container-low)',
          position: 'relative'
        }}
      >
        {image_url && image_url.startsWith('http') ? (
          <img 
            src={image_url} 
            alt={name} 
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
          <div style={{
            fontFamily: 'var(--font-family)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: 'var(--text-secondary)'
          }}>
            HOROLOGY
          </div>
        )}

        {/* Dynamic stock label overlay (Minimalist text, no emojis) */}
        {isOutOfStock && (
          <span style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'var(--color-cancelled-bg)',
            color: 'var(--color-cancelled)',
            fontSize: '9px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Agotado
          </span>
        )}

        {/* Quick Action Button overlay */}
        {isSellerOrAdmin ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
            title="Editar producto"
          >
            <Edit size={14} style={{ color: 'var(--primary)' }} />
          </button>
        ) : (
          !isOutOfStock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, 1);
              }}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
              title="Añadir al carrito"
            >
              <ShoppingBag size={14} style={{ color: 'var(--primary)' }} />
            </button>
          )
        )}
      </div>

      {/* Product metadata */}
      <div style={{ padding: '0 4px' }}>
        <p className="label-caps" style={{ marginBottom: '2px', fontSize: '10px' }}>
          {brand || 'HOROLOGY'}
        </p>
        <h3 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--primary)',
          marginBottom: '2px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {name}
        </h3>
        <p style={{
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text-secondary)'
        }}>
          {formatPrice(price)}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
