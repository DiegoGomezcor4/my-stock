import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './lib/supabase'
import { Auth } from './components/Auth'
import { CatalogView } from './components/CatalogView'
import { ProductForm } from './components/ProductForm'
import { ProductList } from './components/ProductList'
import { CustomerManager } from './components/CustomerManager'
import { SalesRegister } from './components/SalesRegister'
import { SalesReport } from './components/SalesReport'
import { useStockUpdates } from './hooks/useStockUpdates'
import { useCustomers } from './hooks/useCustomers'
import { useSales } from './hooks/useSales'

function App() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setShowLogin(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [currentView, setCurrentView] = useState('inventory'); // inventory, customers, sales, reports
  const [editingProduct, setEditingProduct] = useState(null);

  const { products, addProduct, updateProduct, deleteProduct } = useStockUpdates();
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { sales, addSale, deleteSale } = useSales();

  if (loadingSession) return <div className="app-container" style={{ textAlign: 'center', marginTop: '5rem' }}>Cargando...</div>;

  if (!session) {
    if (showLogin) {
      return (
        <div className="app-container">
          <button
            onClick={() => setShowLogin(false)}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', marginBottom: '1rem' }}
          >
            ← Volver al Catálogo
          </button>
          <Auth />
        </div>
      );
    }
    return (
      <div className="app-container">
        <CatalogView onRequestLogin={() => setShowLogin(true)} />
      </div>
    );
  }

  const handleSale = (saleData) => {
    // 1. Register Sale
    addSale(saleData);
    // 2. Update Stock
    saleData.items.forEach(item => {
      const currentProduct = products.find(p => p.id === item.product.id);
      if (currentProduct) {
        updateProduct(currentProduct.id, { quantity: currentProduct.quantity - item.quantity });
      }
    });
  };

  const handleVoidSale = (sale) => {
    if (!confirm('¿Estás seguro de anular esta venta? El stock será restaurado.')) return;

    // 1. Restore Stock
    if (sale.items && Array.isArray(sale.items)) {
      sale.items.forEach(item => {
        const currentProduct = products.find(p => p.id === item.product.id);
        // If product still exists, restore stock
        if (currentProduct) {
          updateProduct(currentProduct.id, { quantity: currentProduct.quantity + item.quantity });
        }
      });
    }

    // 2. Delete Sale
    deleteSale(sale.id);
  };

  const handleUpdateProduct = (id, data) => {
    updateProduct(id, data);
    setEditingProduct(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderContent = () => {
    switch (currentView) {
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
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {products.length} productos
                </span>
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
        return (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <SalesRegister products={products} customers={customers} onSell={handleSale} />
          </div>
        );
      case 'customers':
        return (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <CustomerManager
              customers={customers}
              onAdd={addCustomer}
              onUpdate={updateCustomer}
              onDelete={deleteCustomer}
            />
          </div>
        );
      case 'reports':
        return (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2>Reporte de Ventas y Ganancias</h2>
            <SalesReport sales={sales} onVoid={handleVoidSale} />
          </div>
        );
      default:
        return <div>Vista no encontrada</div>;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}></div>
          <h1 style={{ flex: 2 }}>Gestión de Stock</h1>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <button onClick={handleLogout} className="btn-danger-outline" style={{ fontSize: '0.8rem' }}>
              Cerrar Sesión
            </button>
          </div>
        </div>

        <nav className="main-nav">
          <button className={`nav-btn ${currentView === 'inventory' ? 'active' : ''}`} onClick={() => setCurrentView('inventory')}>📦 Inventario</button>
          <button className={`nav-btn ${currentView === 'sales' ? 'active' : ''}`} onClick={() => setCurrentView('sales')}>💰 Ventas</button>
          <button className={`nav-btn ${currentView === 'customers' ? 'active' : ''}`} onClick={() => setCurrentView('customers')}>👥 Clientes</button>
          <button className={`nav-btn ${currentView === 'reports' ? 'active' : ''}`} onClick={() => setCurrentView('reports')}>📊 Reportes</button>
        </nav>
      </header>

      <main>
        {renderContent()}
      </main>
    </div>
  )
}

export default App
