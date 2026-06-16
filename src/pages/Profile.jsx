import React, { useState, useEffect, useCallback } from 'react';
import { User, LogOut, ShieldAlert, Award, FileSpreadsheet, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = ({ onNavigate }) => {
  const { user, logout, refreshUser } = useAuth();
  
  // Tab states for administrative roles
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

  // Load seller's own products or general products for CRUD
  const fetchSellersProducts = useCallback(async () => {
    if (!user || (!isApproved && !isAdmin)) return;
    setProductsLoading(true);
    try {
      // Fetch products. Note: standard GET /products handles filtering. 
      // Vendedors and Admins see their items. Since Laravel backend has /products endpoint, we fetch the first page.
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

  // Load pending seller accounts
  const fetchSellers = useCallback(async () => {
    if (!isAdmin) return;
    setSellersLoading(true);
    try {
      // GET /admin/users?status=pending
      const response = await api.get('/admin/users', { params: { status: 'pending' } });
      setSellers(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSellersLoading(false);
    }
  }, [isAdmin]);

  // Initial load
  useEffect(() => {
    if (adminTab === 'products') {
      fetchSellersProducts();
    } else if (adminTab === 'sellers') {
      fetchSellers();
    }
  }, [adminTab, fetchSellersProducts, fetchSellers]);

  // Check profile updates on mount
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
      setFormError('Por favor, completa todos los campos requeridos (*).');
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
        // Edit product (PUT /products/{product})
        await api.put(`/products/${currentProduct.id}`, payload);
      } else {
        // Create product (POST /products)
        await api.post('/products', payload);
      }
      setShowProductModal(false);
      fetchSellersProducts();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Error al guardar el producto. Verifica los datos ingresados.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    try {
      await api.delete(`/products/${productId}`);
      fetchSellersProducts();
    } catch (err) {
      console.error(err);
      alert('Error al intentar eliminar el producto.');
    }
  };

  // Seller approval handlers (Admin only)
  const handleApproveSeller = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/approve`);
      setSellers(prev => prev.filter(seller => seller.id !== userId));
      alert('Vendedor aprobado con éxito.');
    } catch (err) {
      console.error(err);
      alert('Error al intentar aprobar al vendedor.');
    }
  };

  const handleRejectSeller = async (userId) => {
    if (!window.confirm('¿Estás seguro de que deseas rechazar la solicitud de este vendedor?')) return;
    try {
      await api.patch(`/admin/users/${userId}/reject`);
      setSellers(prev => prev.filter(seller => seller.id !== userId));
    } catch (err) {
      console.error(err);
      alert('Error al intentar rechazar al vendedor.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta cuenta permanentemente?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setSellers(prev => prev.filter(seller => seller.id !== userId));
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la cuenta.');
    }
  };

  if (!user) {
    return (
      <div className="glass-card" style={{ padding: '40px 24px', textAlign: 'center', marginTop: '40px' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Inicia sesión para ver tu perfil.
        </p>
        <button onClick={() => onNavigate('login')} className="btn btn-primary">
          Ir a Login
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ paddingBottom: '32px' }}>
      
      {/* Tab Navigation header for admin/seller */}
      {(isAdmin || (isSeller && isApproved)) && (
        <div className="glass-card" style={{
          display: 'flex',
          padding: '6px',
          marginBottom: '20px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <button
            onClick={() => setAdminTab('profile')}
            style={{
              flex: 1,
              background: adminTab === 'profile' ? 'var(--primary)' : 'none',
              border: 'none',
              color: adminTab === 'profile' ? '#fff' : 'var(--text-secondary)',
              padding: '8px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Perfil
          </button>
          
          <button
            onClick={() => setAdminTab('products')}
            style={{
              flex: 1,
              background: adminTab === 'products' ? 'var(--primary)' : 'none',
              border: 'none',
              color: adminTab === 'products' ? '#fff' : 'var(--text-secondary)',
              padding: '8px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Mi Catálogo
          </button>

          {isAdmin && (
            <button
              onClick={() => setAdminTab('sellers')}
              style={{
                flex: 1,
                background: adminTab === 'sellers' ? 'var(--primary)' : 'none',
                border: 'none',
                color: adminTab === 'sellers' ? '#fff' : 'var(--text-secondary)',
                padding: '8px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Aprobaciones
            </button>
          )}
        </div>
      )}

      {/* VIEW A: PROFILE DETAIL */}
      {adminTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '40px',
              background: 'linear-gradient(135deg, var(--accent), var(--primary))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              marginBottom: '16px'
            }}>
              ⌚
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-title)' }}>
              {user.name}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {user.email}
            </p>

            {/* Role indicator badges */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
              {isAdmin ? (
                <span className="badge badge-delivered" style={{ display: 'inline-flex', gap: '4px' }}>
                  <Award size={12} /> Admin
                </span>
              ) : isSeller ? (
                <>
                  <span className="badge badge-processing" style={{ display: 'inline-flex', gap: '4px' }}>
                    <FileSpreadsheet size={12} /> Vendedor
                  </span>
                  {isApproved ? (
                    <span className="badge badge-delivered">Aprobado</span>
                  ) : (
                    <span className="badge badge-pending">Pendiente Aprobación</span>
                  )}
                </>
              ) : (
                <span className="badge badge-shipped">Cliente Comprador</span>
              )}
            </div>

            <button 
              onClick={logout} 
              className="btn btn-danger"
              style={{ width: '100%', maxWidth: '200px' }}
            >
              <LogOut size={16} /> Cerrar Sesión
            </button>
          </div>

          {/* Pending warning banner for unapproved sellers */}
          {isSeller && !isApproved && (
            <div className="glass-card" style={{
              padding: '20px',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              background: 'var(--color-pending-bg)',
              textAlign: 'left'
            }}>
              <h4 style={{
                color: 'var(--color-pending)',
                fontWeight: 700,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <ShieldAlert size={18} /> Cuenta en Revisión
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Tu solicitud de vendedor aún no ha sido aprobada por la administración de Tic-Tac Store. Podrás acceder a la publicación y edición de relojes en cuanto un administrador verifique tu cuenta.
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW B: PRODUCTS CRUD MANAGER */}
      {adminTab === 'products' && (
        <div className="fade-in">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Gestión de Catálogo</h3>
            <button 
              onClick={() => handleOpenProductModal()}
              className="btn btn-primary"
              style={{ padding: '8px 12px', fontSize: '12px', minHeight: 'auto', borderRadius: '8px' }}
            >
              <Plus size={14} /> Agregar Producto
            </button>
          </div>

          {productsLoading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p>No tienes productos publicados todavía.</p>
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
                    border: '1px solid var(--border-color)',
                    fontSize: '14px'
                  }}
                >
                  <div style={{ textAlign: 'left', minWidth: 0, flex: 1, paddingRight: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span className="badge badge-shipped" style={{ fontSize: '8px', padding: '2px 6px' }}>{product.brand}</span>
                      <strong style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block'
                      }}>{product.name}</strong>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Precio: {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.price)} | Stock: {product.stock}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button 
                      onClick={() => handleOpenProductModal(product)}
                      className="btn btn-secondary"
                      style={{ padding: 0, width: '32px', height: '32px', minWidth: 'auto', minHeight: 'auto', borderRadius: '6px' }}
                      title="Editar"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="btn btn-danger"
                      style={{ padding: 0, width: '32px', height: '32px', minWidth: 'auto', minHeight: 'auto', borderRadius: '6px' }}
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW C: SELLER APPROVALS (ADMIN ONLY) */}
      {adminTab === 'sellers' && (
        <div className="fade-in">
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', textAlign: 'left' }}>
            Solicitudes de Vendedor
          </h3>

          {sellersLoading ? (
            <LoadingSpinner />
          ) : sellers.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p>No hay solicitudes pendientes de vendedor en este momento.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sellers.map((seller) => (
                <div 
                  key={seller.id}
                  className="glass-card"
                  style={{
                    padding: '16px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    textAlign: 'left'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700 }}>{seller.name}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{seller.email}</p>
                    <span className="badge badge-pending" style={{ marginTop: '6px', fontSize: '9px' }}>
                      Pendiente aprobación
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    paddingTop: '10px'
                  }}>
                    <button
                      onClick={() => handleApproveSeller(seller.id)}
                      className="btn btn-success"
                      style={{ flex: 1, fontSize: '11px', padding: '6px', minHeight: 'auto', borderRadius: '6px' }}
                    >
                      <Check size={14} /> Aprobar
                    </button>
                    <button
                      onClick={() => handleRejectSeller(seller.id)}
                      className="btn btn-danger"
                      style={{ flex: 1, fontSize: '11px', padding: '6px', minHeight: 'auto', borderRadius: '6px' }}
                    >
                      <X size={14} /> Rechazar
                    </button>
                    <button
                      onClick={() => handleDeleteUser(seller.id)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', minHeight: 'auto', borderRadius: '6px' }}
                      title="Eliminar del sistema"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product ADD/EDIT Modal overlay */}
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
          {/* Backdrop blur */}
          <div 
            onClick={() => !formLoading && setShowProductModal(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(9, 13, 22, 0.7)',
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
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              zIndex: 1001
            }}
          >
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              marginBottom: '16px',
              textAlign: 'left'
            }}>
              {currentProduct ? 'Editar Reloj' : 'Agregar Nuevo Reloj'}
            </h3>

            {formError && (
              <div style={{
                background: 'var(--color-cancelled-bg)',
                color: '#fca5a5',
                fontSize: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '12px',
                textAlign: 'left'
              }}>
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={formSave => {
              // Standard form submission is handled in helper function
              handleSaveProduct(formSave);
            }}>
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
                <label>Nombre del Producto *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Reloj Casio Vintage A158W"
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
                  placeholder="Ej. 35000.00"
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
                  placeholder="Ej. 10"
                  value={pStock}
                  onChange={(e) => setPStock(e.target.value)}
                  disabled={formLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label>Enlace de Imagen URL</label>
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
                  placeholder="Detalles sobre el diseño, materiales, resistencia al agua..."
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
                  style={{ flex: 1 }}
                  disabled={formLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
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
