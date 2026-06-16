import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const Catalog = ({ onSelectProduct, onEditProduct, onCreateProduct }) => {
  const { user } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStock, setInStock] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Category Chips state
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const isSellerOrAdmin = user && (user.role === 'vendedor' || user.role === 'admin');
  const isApproved = user && user.status === 'approved';

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      // Calculate search query merging search input and selected category chip
      let searchQuery = search;
      if (activeCategory !== 'ALL') {
        searchQuery = searchQuery ? `${searchQuery} ${activeCategory}` : activeCategory;
      }

      const params = {
        page,
        ...(searchQuery && { search: searchQuery }),
        ...(brand && { brand }),
        ...(maxPrice && { max_price: maxPrice }),
        ...(inStock && { in_stock: 'true' })
      };
      
      const response = await api.get('/products', { params });
      
      if (response.data && response.data.data) {
        setProducts(response.data.data);
        setCurrentPage(response.data.current_page || 1);
        setLastPage(response.data.last_page || 1);
        setTotalItems(response.data.total || 0);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
        setCurrentPage(1);
        setLastPage(1);
        setTotalItems(response.data.length);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los productos. Por favor, asegúrate de que el servidor esté encendido.');
    } finally {
      setLoading(false);
    }
  }, [search, brand, maxPrice, inStock, activeCategory]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(1);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, brand, maxPrice, inStock, activeCategory, fetchProducts]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= lastPage) {
      fetchProducts(page);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setBrand('');
    setMaxPrice('');
    setInStock(false);
    setActiveCategory('ALL');
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '32px' }}>
      {/* Header and New Product Action */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Timepieces
        </h2>

        {isSellerOrAdmin && (
          <button
            onClick={onCreateProduct}
            className="btn btn-primary"
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              borderRadius: '8px',
              minHeight: 'auto'
            }}
            disabled={user.role === 'vendedor' && !isApproved}
            title={user.role === 'vendedor' && !isApproved ? 'Cuenta pendiente de aprobación' : 'Agregar nuevo reloj'}
          >
            <Plus size={14} /> Nuevo
          </button>
        )}
      </div>

      {/* Seller pending notification */}
      {user && user.role === 'vendedor' && !isApproved && (
        <div style={{
          background: 'var(--color-pending-bg)',
          border: '1px solid var(--color-pending)',
          borderRadius: '10px',
          padding: '12px 16px',
          color: 'var(--color-pending)',
          fontSize: '12px',
          marginBottom: '20px',
          textAlign: 'left',
          lineHeight: 1.4,
          fontWeight: 500
        }}>
          Aviso: Tu cuenta de vendedor está en espera de aprobación por un administrador. No podrás crear ni modificar productos hasta entonces.
        </div>
      )}

      {/* Search Bar & Filter Button */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <div style={{
          flex: 1,
          position: 'relative'
        }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)'
          }} />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar colecciones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              paddingLeft: '38px',
              background: 'var(--surface-container-low)',
              borderRadius: '10px',
              border: 'none',
              fontSize: '13px'
            }}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn-secondary"
          style={{
            height: '48px',
            padding: '0 16px',
            minWidth: 'auto',
            borderRadius: '10px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: showFilters ? 'var(--surface-container-high)' : 'var(--bg-primary)',
            borderColor: 'var(--outline-variant)'
          }}
          title="Filtros"
        >
          <SlidersHorizontal size={14} />
          <span className="label-caps" style={{ fontSize: '9px', color: 'var(--primary)' }}>FILTROS</span>
        </button>
      </div>

      {/* Category Chips Scrollbar (matching estilos.html) */}
      <div className="hide-scrollbar" style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '16px',
        marginBottom: '16px',
        WebkitOverflowScrolling: 'touch'
      }}>
        {[
          { id: 'ALL', label: 'Todos los Relojes' },
          { id: 'AUTOMATIC', label: 'Automatic' },
          { id: 'CHRONOGRAPH', label: 'Chronograph' },
          { id: 'VINTAGE', label: 'Vintage' },
          { id: 'DIVE', label: 'Dive' }
        ].map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="label-caps"
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                border: `1px solid ${isActive ? 'var(--primary)' : 'var(--outline-variant)'}`,
                background: isActive ? 'var(--primary)' : 'var(--surface-container-high)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '9px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Filters Form Drawer */}
      {showFilters && (
        <div 
          className="glass-card" 
          style={{
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid var(--outline-variant)',
            background: '#ffffff',
            borderRadius: '10px',
            animation: 'slideDown 0.2s ease-out'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span className="label-caps" style={{ fontSize: '10px', color: 'var(--primary)' }}>Filtros avanzados</span>
            <button 
              onClick={handleClearFilters}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--secondary)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Limpiar
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px'
          }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="filter-brand">Marca</label>
              <input
                id="filter-brand"
                type="text"
                className="form-input"
                placeholder="Ej. Casio"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                style={{ height: '36px', minHeight: 'auto', borderRadius: '8px', fontSize: '12px' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="filter-price">Precio Máximo</label>
              <input
                id="filter-price"
                type="number"
                className="form-input"
                placeholder="Monto"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{ height: '36px', minHeight: 'auto', borderRadius: '8px', fontSize: '12px' }}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              paddingTop: '20px'
            }}>
              <input
                id="filter-stock"
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                  accentColor: 'var(--primary)'
                }}
              />
              <label htmlFor="filter-stock" style={{
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                En Stock
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Catalog items representation */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="glass-card" style={{
          padding: '24px',
          textAlign: 'center',
          border: '1px solid var(--color-cancelled)',
          color: 'var(--text-secondary)',
          borderRadius: '10px'
        }}>
          <p style={{ fontSize: '13px' }}>{error}</p>
          <button 
            onClick={() => fetchProducts(currentPage)} 
            className="btn btn-secondary" 
            style={{ marginTop: '12px', padding: '8px 16px', minHeight: 'auto', fontSize: '11px' }}
          >
            Reintentar
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card" style={{
          padding: '40px 24px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          borderRadius: '10px'
        }}>
          <p style={{ fontWeight: 600, fontSize: '14px' }}>No se encontraron relojes.</p>
          <p style={{ fontSize: '12px', marginTop: '4px' }}>Prueba ajustando los filtros de búsqueda.</p>
        </div>
      ) : (
        <>
          {/* Catalog Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', // Exact grid-cols-2 from estilos.html
            gap: '16px',
            rowGap: '28px',
            marginBottom: '24px'
          }}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onEdit={onEditProduct}
              />
            ))}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '12px'
            }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-secondary"
                style={{
                  width: '32px',
                  height: '32px',
                  padding: 0,
                  minWidth: 'auto',
                  minHeight: 'auto',
                  borderRadius: '8px'
                }}
              >
                <ChevronLeft size={16} />
              </button>
              
              <span className="label-caps" style={{ fontSize: '10px' }}>
                {currentPage} / {lastPage}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === lastPage}
                className="btn btn-secondary"
                style={{
                  width: '32px',
                  height: '32px',
                  padding: 0,
                  minWidth: 'auto',
                  minHeight: 'auto',
                  borderRadius: '8px'
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
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

export default Catalog;
