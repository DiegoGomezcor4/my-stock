import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import './App.css'
import { supabase } from './lib/supabase'
import { Auth } from './components/Auth'
import { CatalogView } from './components/CatalogView'
import { ProductForm } from './components/ProductForm'
import { ProductList } from './components/ProductList'
import { CustomerManager } from './components/CustomerManager'
import { SalesRegister } from './components/SalesRegister'
import { SalesReport } from './components/SalesReport'
import { Dashboard } from './components/Dashboard'
import { Settings } from './components/Settings'
import { useStockUpdates } from './hooks/useStockUpdates'
import { useCustomers } from './hooks/useCustomers'
import { useSales } from './hooks/useSales'
import { useOrganization } from './hooks/useOrganization'
import { useAdmin } from './hooks/useAdmin'
import { AdminDashboard } from './components/AdminDashboard'
import { Toaster, toast } from 'sonner'

// 1. Protected Route Wrapper
function ProtectedRoute({ children, session }) {
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// 2. Dashboard Layout (Sidebar + Header + Content)
function DashboardLayout({ session, onLogout }) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [editingProduct, setEditingProduct] = useState(null);

  const { products, addProduct, updateProduct, deleteProduct } = useStockUpdates();
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { sales, addSale, deleteSale } = useSales();
  const { organization } = useOrganization();
  const { isAdmin } = useAdmin();

  const handleSale = (saleData) => {
    addSale(saleData);
    saleData.items.forEach(item => {
      const currentProduct = products.find(p => p.id === item.product.id);
      if (currentProduct) {
        updateProduct(currentProduct.id, { quantity: currentProduct.quantity - item.quantity });
      }
    });
  };

  const handleVoidSale = (sale) => {
    if (!confirm('¿Estás seguro de anular esta venta? El stock será restaurado.')) return;
    if (sale.items && Array.isArray(sale.items)) {
      sale.items.forEach(item => {
        const currentProduct = products.find(p => p.id === item.product.id);
        if (currentProduct) {
          updateProduct(currentProduct.id, { quantity: currentProduct.quantity + item.quantity });
        }
      });
    }
    deleteSale(sale.id);
    toast.success('Venta anulada y stock restaurado');
  };

  const handleUpdateProduct = (id, data) => {
    updateProduct(id, data);
    setEditingProduct(null);
  };

  const copyCatalogLink = () => {
    const url = `${window.location.origin}/catalog/${session.user.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Enlace de tu catálogo copiado al portapapeles');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <div style={{ maxWidth: '1000px', margin: '0 auto' }}><Dashboard products={products} sales={sales} /></div>;
      case 'inventory':
        return (
          <div className="main-layout">
            <aside>
              <ProductForm
                onAdd={addProduct}
                onUpdate={handleUpdateProduct}
                editingProduct={editingProduct}
                onCancelEdit={() => setEditingProduct(null)}
              />
            </aside>
            <section>
              <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Inventario Actual</h2>
                <span style={{ color: 'var(--color-text-secondary)' }}>{products.length} productos</span>
              </div>
              <ProductList
                products={products}
                onDelete={deleteProduct}
                onUpdateStock={updateProduct}
                onEdit={setEditingProduct}
              />
            </section>
          </div>
        );
      case 'sales':
        return <div style={{ maxWidth: '800px', margin: '0 auto' }}><SalesRegister products={products} customers={customers} onSell={handleSale} /></div>;
      case 'customers':
        return <div style={{ maxWidth: '800px', margin: '0 auto' }}><CustomerManager customers={customers} onAdd={addCustomer} onUpdate={updateCustomer} onDelete={deleteCustomer} /></div>;
      case 'reports':
        return <div style={{ maxWidth: '1000px', margin: '0 auto' }}><h2>Reporte de Ventas y Ganancias</h2><SalesReport sales={sales} onVoid={handleVoidSale} /></div>;
      case 'settings':
        return <Settings />;
      case 'admin':
        return isAdmin ? <AdminDashboard /> : <div>Acceso denegado</div>;
      default:
        return <div>Vista no encontrada</div>;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {organization?.logo_url && (
              <img src={organization.logo_url} alt="Logo" style={{ height: '40px', objectFit: 'contain' }} />
            )}
            <button onClick={copyCatalogLink} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>
              🔗 Compartir Catálogo
            </button>
          </div>
          <h1 style={{ flex: 2, textAlign: 'center' }}>{organization?.name || 'Gestión de Stock'}</h1>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <button onClick={onLogout} className="btn-danger-outline" style={{ fontSize: '0.8rem' }}>Cerrar Sesión</button>
          </div>
        </div>

        <nav className="main-nav">
          <button className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>🏠 Inicio</button>
          <button className={`nav-btn ${currentView === 'inventory' ? 'active' : ''}`} onClick={() => setCurrentView('inventory')}>📦 Inventario</button>
          <button className={`nav-btn ${currentView === 'sales' ? 'active' : ''}`} onClick={() => setCurrentView('sales')}>💰 Ventas</button>
          <button className={`nav-btn ${currentView === 'customers' ? 'active' : ''}`} onClick={() => setCurrentView('customers')}>👥 Clientes</button>
          <button className={`nav-btn ${currentView === 'reports' ? 'active' : ''}`} onClick={() => setCurrentView('reports')}>📊 Reportes</button>
          <button className={`nav-btn ${currentView === 'settings' ? 'active' : ''}`} onClick={() => setCurrentView('settings')}>⚙️ Configuración</button>
          {isAdmin && (
            <button className={`nav-btn ${currentView === 'admin' ? 'active' : ''}`} style={{ backgroundColor: '#2c3e50', color: 'white' }} onClick={() => setCurrentView('admin')}>🛡️ Admin</button>
          )}
        </nav>
      </header>

      <main>
        {renderContent()}
      </main>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="app-container" style={{ textAlign: 'center', marginTop: '5rem' }}>Cargando...</div>;

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public Routes */}
        <Route path="/catalog/:userId" element={<CatalogView />} />
        <Route path="/login" element={!session ? <div className="app-container"><Auth /></div> : <Navigate to="/dashboard" replace />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute session={session}>
              <DashboardLayout session={session} onLogout={() => supabase.auth.signOut()} />
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to={session ? "/dashboard" : "/login"} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
