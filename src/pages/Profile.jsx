import React, { useState, useEffect, useCallback } from 'react';
import { User, LogOut, ShieldAlert, Award, FileSpreadsheet, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = ({ onNavigate }) => {
  const { user, logout, refreshUser } = useAuth();
  
  // Tab states for administrative views
  const [adminTab, setAdminTab] = useState('profile'); // 'profile', 'products', 'sellers'
  
  // Product CRUD states
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null); // null = new, else editing
  
  // Product form states
  const [pName, setPName] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pStock, setPStock] = useState('');
  const [pBrand, setPBrand] = useState('');
  const [pImage, setPImage] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Seller list state (for admins)
  const [sellers, setSellers] = useState([]);
  const [sellersLoading, setSellersLoading] = useState(false);

  const isSeller = user && user.role === 'vendedor';
  const isAdmin = user && user.role === 'admin';
  const isApproved = user && user.status === 'approved';

  const fetchSellersProducts = useCallback(async () => {
    if (!user || (!isApproved && !isAdmin)) return;
    setProductsLoading(true);
    try {
      const response = await api.get('/products');
      if (response.data && response.data.data) {
        setProducts(response.data.data);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  }, [user, isApproved, isAdmin]);

  const fetchSellers = useCallback(async () => {
    if (!isAdmin) return;
    setSellersLoading(true);
    try {
      const response = await api.get('/admin/users', { params: { status: 'pending' } });
      setSellers(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSellersLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (adminTab === 'products') {
      fetchSellersProducts();
    } else if (adminTab === 'sellers') {
      fetchSellers();
    }
  }, [adminTab, fetchSellersProducts, fetchSellers]);

  useEffect(() => {
    if (user) {
      refreshUser();
    }
  }, []);

  const handleOpenProductModal = (product = null) => {
    setFormError('');
    if (product) {
      setCurrentProduct(product);
      setPName(product.name || '');
      setPDescription(product.description || '');
      setPPrice(product.price || '');
      setPStock(product.stock || '');
      setPBrand(product.brand || '');
      setPImage(product.image_url || '');
    } else {
      setCurrentProduct(null);
      setPName('');
      setPDescription('');
      setPPrice('');
      setPStock('');
      setPBrand('');
      setPImage('');
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!pName || !pPrice || !pStock || !pBrand) {
      setFormError('Por favor, completa los campos obligatorios.');
      return;
    }

    const payload = {
      name: pName,
      description: pDescription,
      price: parseFloat(pPrice),
      stock: parseInt(pStock, 10),
      brand: pBrand,
      image_url: pImage
    };

    setFormLoading(true);
    try {
      if (currentProduct) {
        await api.put(`/products/${currentProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowProductModal(false);
      fetchSellersProducts();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Error al procesar el guardado. Verifica los datos.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('¿Deseas eliminar este producto?')) return;
    try {
      await api.delete(`/products/${productId}`);
      fetchSellersProducts();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el producto.');
    }
  };

  const handleApproveSeller = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/approve`);
      setSellers(prev => prev.filter(seller => seller.id !== userId));
      alert('Vendedor aprobado.');
    } catch (err) {
      console.error(err);
      alert('Error al intentar aprobar al vendedor.');
    }
  };

  const handleRejectSeller = async (userId) => {
    if (!window.confirm('¿Rechazar solicitud?')) return;
    try {
      await api.patch(`/admin/users/${userId}/reject`);
      setSellers(prev => prev.filter(seller => seller.id !== userId));
    } catch (err) {
      console.error(err);
      alert('Error al intentar rechazar al vendedor.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Eliminar usuario permanentemente?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setSellers(prev => prev.filter(seller => seller.id !== userId));
    } catch (err) {
      console.error(err);
      alert('Error al eliminar.');
    }
  };

  if (!user) {
    return (
      <div className="glass-card" style={{ padding: '40px 24px', textAlign: 'center', marginTop: '40px' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Inicia sesión para configurar tu perfil.
        </p>
        <button onClick={() => onNavigate('login')} className="btn btn-primary">
          Ir a Login
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ paddingBottom: '32px' }}>
      
      {/* Dynamic Tab Navigation headers */}
      {(isAdmin || (isSeller && isApproved)) && (
        <div style={{
          display: 'flex',
          background: 'var(--surface-container-low)',
          padding: '4px',
          marginBottom: '20px',
          borderRadius: '10px',
          border: '1px solid var(--outline-variant)'
        }}>
          <button
            onClick={() => setAdminTab('profile')}
            className="label-caps"
            style={{
              flex: 1,
              background: adminTab === 'profile' ? 'var(--primary)' : 'none',
              border: 'none',
              color: adminTab === 'profile' ? '#fff' : 'var(--text-secondary)',
              padding: '8px 10px',
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Perfil
          </button>
          
          <button
            onClick={() => setAdminTab('products')}
            className="label-caps"
            style={{
              flex: 1,
              background: adminTab === 'products' ? 'var(--primary)' : 'none',
              border: 'none',
              color: adminTab === 'products' ? '#fff' : 'var(--text-secondary)',
              padding: '8px 10px',
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Catálogo
          </button>

          {isAdmin && (
            <button
              onClick={() => setAdminTab('sellers')}
              className="label-caps"
              style={{
                flex: 1,
                background: adminTab === 'sellers' ? 'var(--primary)' : 'none',
                border: 'none',
                color: adminTab === 'sellers' ? '#fff' : 'var(--text-secondary)',
                padding: '8px 10px',
                borderRadius: '8px',
                fontSize: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Aprobaciones
            </button>
          )}
        </div>
      )}

      {/* VIEW A: PROFILE */}
      {adminTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center', background: '#ffffff' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--surface-container-low)',
              border: '1px solid var(--outline-variant)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: 'var(--primary)'
            }}>
              <User size={32} style={{ strokeWidth: 1.5 }} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }}>
              {user.name}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {user.email}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
              {isAdmin ? (
                <span className="badge badge-delivered" style={{ display: 'inline-flex', gap: '4px' }}>
                  <Award size={10} /> Admin
                </span>
              ) : isSeller ? (
                <>
                  <span className="badge badge-processing" style={{ display: 'inline-flex', gap: '4px' }}>
                    <FileSpreadsheet size={10} /> Vendedor
                  </span>
                  {isApproved ? (
                    <span className="badge badge-delivered">Aprobado</span>
                  ) : (
                    <span className="badge badge-pending">Pendiente</span>
                  )}
                </>
              ) : (
                <span className="badge badge-shipped">Cliente</span>
              )}
            </div>

            <button 
              onClick={logout} 
              className="btn btn-danger"
              style={{ width: '100%', maxWidth: '200px', fontSize: '10px' }}
            >
              <LogOut size={14} /> Cerrar Sesión
            </button>
          </div>

          {/* Pending notification */}
          {isSeller && !isApproved && (
            <div className="glass-card" style={{
              padding: '20px',
              border: '1px solid var(--outline-variant)',
              background: 'var(--surface-container-low)',
              textAlign: 'left'
            }}>
              <h4 className="label-caps" style={{
                color: 'var(--color-pending)',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <ShieldAlert size={16} /> Cuenta en proceso de revisión
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Tu solicitud de vendedor aún no ha sido aprobada por la administración. Podrás acceder a la gestión del catálogo de relojes una vez aprobada.
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW B: PRODUCTS CRUD */}
      {adminTab === 'products' && (
        <div className="fade-in">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Gestión de Relojes</h3>
            <button 
              onClick={() => handleOpenProductModal()}
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '10px', minHeight: 'auto', borderRadius: '8px' }}
            >
              <Plus size={12} /> Agregar
            </button>
          </div>

          {productsLoading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '13px' }}>No hay relojes publicados.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="glass-card"
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid var(--outline-variant)',
                    fontSize: '13px',
                    background: '#ffffff'
                  }}
                >
                  <div style={{ textAlign: 'left', minWidth: 0, flex: 1, paddingRight: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span className="label-caps" style={{ fontSize: '8px', color: 'var(--text-secondary)' }}>{product.brand}</span>
                      <strong style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block'
                      }}>{product.name}</strong>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Precio: {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(product.price)} | Stock: {product.stock}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button 
                      onClick={() => handleOpenProductModal(product)}
                      className="btn btn-secondary"
                      style={{ padding: 0, width: '28px', height: '28px', minWidth: 'auto', minHeight: 'auto', borderRadius: '6px' }}
                      title="Editar"
                    >
                      <Edit size={12} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="btn btn-danger"
                      style={{ padding: 0, width: '28px', height: '28px', minWidth: 'auto', minHeight: 'auto', borderRadius: '6px' }}
                      title="Eliminar"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW C: SELLER APPROVALS (ADMIN) */}
      {adminTab === 'sellers' && (
        <div className="fade-in">
          <h3 className="label-caps" style={{ fontSize: '10px', marginBottom: '16px', textAlign: 'left' }}>
            Solicitudes pendientes
          </h3>

          {sellersLoading ? (
            <LoadingSpinner />
          ) : sellers.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '13px' }}>No hay solicitudes de aprobación.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sellers.map((seller) => (
                <div 
                  key={seller.id}
                  className="glass-card"
                  style={{
                    padding: '16px',
                    border: '1px solid var(--outline-variant)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    textAlign: 'left',
                    background: '#ffffff'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700 }}>{seller.name}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{seller.email}</p>
                    <span className="badge badge-pending" style={{ marginTop: '6px', fontSize: '8px' }}>
                      Pendiente
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    borderTop: '1px solid var(--surface-container-highest)',
                    paddingTop: '10px'
                  }}>
                    <button
                      onClick={() => handleApproveSeller(seller.id)}
                      className="btn btn-success"
                      style={{ flex: 1, fontSize: '10px', padding: '6px', minHeight: 'auto', borderRadius: '6px' }}
                    >
                      <Check size={12} /> Aprobar
                    </button>
                    <button
                      onClick={() => handleRejectSeller(seller.id)}
                      className="btn btn-danger"
                      style={{ flex: 1, fontSize: '10px', padding: '6px', minHeight: 'auto', borderRadius: '6px' }}
                    >
                      <X size={12} /> Rechazar
                    </button>
                    <button
                      onClick={() => handleDeleteUser(seller.id)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 8px', minHeight: 'auto', borderRadius: '6px' }}
                      title="Eliminar"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product Modal Overlay */}
      {showProductModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div 
            onClick={() => !formLoading && setShowProductModal(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(4px)',
            }}
          />

          <div 
            className="glass-card"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '440px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              background: '#ffffff',
              border: '1px solid var(--outline-variant)',
              zIndex: 1001
            }}
          >
            <h3 style={{
              fontSize: '16px',
              fontWeight: 700,
              marginBottom: '16px',
              textAlign: 'left'
            }}>
              {currentProduct ? 'Editar Reloj' : 'Agregar Reloj'}
            </h3>

            {formError && (
              <div style={{
                background: 'var(--color-cancelled-bg)',
                color: 'var(--color-cancelled)',
                fontSize: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '12px',
                textAlign: 'left'
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label>Marca *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Casio, Rolex"
                  value={pBrand}
                  onChange={(e) => setPBrand(e.target.value)}
                  disabled={formLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nombre del Reloj *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Patrimony Manual"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  disabled={formLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label>Precio (ARS) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="Monto"
                  value={pPrice}
                  onChange={(e) => setPPrice(e.target.value)}
                  disabled={formLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label>Stock Disponible *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Unidades"
                  value={pStock}
                  onChange={(e) => setPStock(e.target.value)}
                  disabled={formLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label>Imagen URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://ejemplo.com/reloj.jpg"
                  value={pImage}
                  onChange={(e) => setPImage(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  className="form-input"
                  placeholder="Detalles técnicos, tipo de correa, cristal..."
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  disabled={formLoading}
                  style={{ minHeight: '60px', resize: 'vertical' }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '20px'
              }}>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '11px' }}
                  disabled={formLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, fontSize: '11px' }}
                  disabled={formLoading}
                >
                  {formLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
