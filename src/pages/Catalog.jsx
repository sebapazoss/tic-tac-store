import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Catalog = ({ onSelectProduct }) => {
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

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
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
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
        setCurrentPage(1);
        setLastPage(1);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los productos. Por favor, intenta de nuevo.');
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Colecciones
        </h2>
      </div>

      {/* Search Bar & Filter Toggle */}
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
            placeholder="Buscar relojes..."
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
        >
          <SlidersHorizontal size={14} />
          <span className="label-caps" style={{ fontSize: '9px', color: 'var(--primary)' }}>FILTROS</span>
        </button>
      </div>

      {/* Categories chips */}
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

      {/* Advanced Filters Block */}
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

      {/* Grid List */}
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '16px',
            rowGap: '28px',
            marginBottom: '24px'
          }}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
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
                &lt;
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
                &gt;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Catalog;
