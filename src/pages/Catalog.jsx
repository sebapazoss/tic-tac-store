import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
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
      const params = {
        page,
        ...(search && { search }),
        ...(brand && { brand }),
        ...(maxPrice && { max_price: maxPrice }),
        ...(inStock && { in_stock: 'true' })
      };
      
      const response = await api.get('/products', { params });
      
      // Standard Laravel pagination response: response.data = { data: [...], current_page: 1, last_page: 5, total: 20 }
      // In some projects, it might return direct array if there's no pagination, so let's support both
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
      setError('No se pudieron cargar los productos. Asegúrate de que el servidor esté activo.');
    } finally {
      setLoading(false);
    }
  }, [search, brand, maxPrice, inStock]);

  // Debounced/Triggered search & filter application
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(1);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, brand, maxPrice, inStock, fetchProducts]);

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
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '32px' }}>
      {/* Header and Floating CRUD action */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-title)' }}>
          Catálogo
        </h2>

        {isSellerOrAdmin && (
          <button
            onClick={onCreateProduct}
            className="btn btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              borderRadius: '12px',
              minHeight: 'auto'
            }}
            disabled={user.role === 'vendedor' && !isApproved}
            title={user.role === 'vendedor' && !isApproved ? 'Tu cuenta de vendedor requiere aprobación' : 'Agregar nuevo producto'}
          >
            <Plus size={16} /> Nuevo Producto
          </button>
        )}
      </div>

      {/* Seller pending banner */}
      {user && user.role === 'vendedor' && !isApproved && (
        <div style={{
          background: 'var(--color-pending-bg)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '12px',
          padding: '12px 16px',
          color: '#fcd34d',
          fontSize: '13px',
          marginBottom: '20px',
          textAlign: 'left',
          lineHeight: 1.4
        }}>
          ⚠️ <strong>Cuenta Pendiente:</strong> Tu cuenta de vendedor está en espera de aprobación por un Administrador. No podrás crear ni modificar productos hasta ser aprobado.
        </div>
      )}

      {/* Search Bar & Filter Toggle */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '16px'
      }}>
        <div style={{
          flex: 1,
          position: 'relative'
        }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)'
          }} />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por marca, nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
          style={{
            width: '48px',
            height: '48px',
            padding: 0,
            minWidth: 'auto',
            borderRadius: '12px',
            backgroundColor: showFilters ? 'var(--primary)' : 'rgba(255,255,255,0.04)'
          }}
          title="Filtros avanzados"
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Sliding/Accordion Filters Block */}
      {showFilters && (
        <div 
          className="glass-card" 
          style={{
            padding: '18px',
            marginBottom: '20px',
            border: '1px solid var(--border-color)',
            animation: 'slideDown 0.2s ease-out'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Filtros Avanzados</h3>
            <button 
              onClick={handleClearFilters}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Limpiar filtros
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
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
                style={{ height: '40px', minHeight: 'auto' }}
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
                style={{ height: '40px', minHeight: 'auto' }}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              paddingTop: '26px'
            }}>
              <input
                id="filter-stock"
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: 'var(--primary)'
                }}
              />
              <label htmlFor="filter-stock" style={{
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}>
                Solo en stock
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Main Catalog View area */}
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
          <button 
            onClick={() => fetchProducts(currentPage)} 
            className="btn btn-secondary" 
            style={{ marginTop: '12px', padding: '8px 16px', minHeight: 'auto' }}
          >
            Reintentar
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card" style={{
          padding: '40px 24px',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>🔍</span>
          <p style={{ fontWeight: 500 }}>No se encontraron productos coincidentes.</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Prueba ajustando los filtros de búsqueda.</p>
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '16px',
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

          {/* Premium Pagination controls */}
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
                  width: '36px',
                  height: '36px',
                  padding: 0,
                  minWidth: 'auto',
                  minHeight: 'auto',
                  borderRadius: '10px'
                }}
              >
                <ChevronLeft size={18} />
              </button>
              
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-secondary)'
              }}>
                Pág. {currentPage} de {lastPage}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === lastPage}
                className="btn btn-secondary"
                style={{
                  width: '36px',
                  height: '36px',
                  padding: 0,
                  minWidth: 'auto',
                  minHeight: 'auto',
                  borderRadius: '10px'
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Catalog;
