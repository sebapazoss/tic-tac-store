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
  const [sortBy, setSortBy] = useState(''); // Nueva línea para ordenamiento
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        ...(search && { search }),
        ...(brand && { brand }),
        ...(maxPrice && { max_price: maxPrice }),
        ...(inStock && { in_stock: 'true' }),
        ...(sortBy && { sort: sortBy })
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
  }, [search, brand, maxPrice, inStock, sortBy]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(1);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, brand, maxPrice, inStock, sortBy, fetchProducts]);

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
    setSortBy('');
  };

  // Función para ordenar productos localmente
  const getSortedProducts = () => {
    const sorted = [...products];
    if (sortBy === 'price_asc') {
      return sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      return sorted.sort((a, b) => b.price - a.price);
    }
    return sorted;
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
          <span className="label-caps" style={{ fontSize: '10px', color: 'var(--primary)', display: 'block', marginBottom: '12px' }}>Filtros avanzados</span>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            marginBottom: '16px'
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

            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="filter-sort">Ordenar por</label>
              <select
                id="filter-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ 
                  height: '36px', 
                  minHeight: 'auto', 
                  borderRadius: '8px', 
                  fontSize: '12px',
                  border: '1px solid var(--outline-variant)',
                  background: 'var(--surface-container-low)',
                  color: 'var(--text-primary)',
                  padding: '0 8px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-family)'
                }}
              >
                <option value="">Relevancia</option>
                <option value="price_asc">Precio menor a mayor</option>
                <option value="price_desc">Precio mayor a menor</option>
              </select>
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

          {/* Clear Filters Button */}
          <button 
            onClick={handleClearFilters}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-family)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
          >
            Limpiar Filtros
          </button>
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
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            alignItems: 'flex-start' /* Importante para que las tarjetas mantengan su altura original */
          }}>
            {/* Columna Izquierda: Toma el 1ero, 3ero, 5to, etc. (índices pares: 0, 2, 4) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {getSortedProducts()
                .filter((_, index) => index % 2 === 0)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                  />
              ))}
            </div>

            {/* Columna Derecha: Toma el 2do, 4to, 6to, etc. (índices impares: 1, 3, 5) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {getSortedProducts()
                .filter((_, index) => index % 2 !== 0)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                  />
              ))}
            </div>
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
