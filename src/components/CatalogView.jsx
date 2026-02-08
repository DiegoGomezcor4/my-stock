import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { WhatsAppButton } from './WhatsAppButton';

export function CatalogView() {
    const { userId } = useParams();
    const [products, setProducts] = useState([]);
    const [organization, setOrganization] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchCatalogData();
        }
    }, [userId]);

    async function fetchCatalogData() {
        try {
            setLoading(true);
            // 1. Fetch Organization Details
            const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .select('name, logo_url')
                .eq('user_id', userId)
                .single();

            if (orgError) {
                console.error('Error fetching organization:', orgError);
                window._debugOrgError = orgError;
            } else {
                setOrganization(orgData);
            }

            // 2. Fetch Products
            const { data: prodData, error: prodError } = await supabase
                .from('products')
                .select('id, name, price, description, image, quantity')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (prodError) {
                console.error('Error fetching catalog:', prodError);
            } else {
                setProducts(prodData || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...product, qty: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, qty: Math.max(1, item.qty + delta) };
            }
            return item;
        }));
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    const handleWhatsAppOrder = () => {
        if (cart.length === 0) return;

        let message = `Hola! Me interesa hacer el siguiente pedido a *${organization?.name || 'su tienda'}*:\n\n`;
        cart.forEach(item => {
            message += `• ${item.qty}x ${item.name} ($${item.price})\n`;
        });
        message += `\n*Total Estimado: $${total.toFixed(2)}*`;

        // Note: In a real app, you might want to fetch the phone number from the organization settings
        const url = `https://wa.me/5493794145743?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '3rem' }}>Cargando catálogo...</div>;

    if (!organization && !loading) {
        return (
            <div style={{ color: 'white', textAlign: 'center', marginTop: '3rem' }}>
                <h2>Tienda no encontrada</h2>
                <p>No pudimos encontrar la tienda que buscas.</p>
                <div style={{ background: '#333', padding: '1rem', margin: '1rem auto', maxWidth: '500px', borderRadius: '4px', textAlign: 'left' }}>
                    <p><strong>Debug Info:</strong></p>
                    <p>User ID: {userId}</p>
                    {/* exposing the error to the user for debugging */}
                    <p>Error: {JSON.stringify(window._debugOrgError)}</p>
                </div>
                <Link to="/login" style={{ color: 'var(--color-primary)' }}>Ir al Login</Link>
            </div>
        );
    }

    return (
        <div className="catalog-view">
            <header className="app-header" style={{ marginBottom: '1rem', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {organization?.logo_url && (
                            <img src={organization.logo_url} alt="Logo" style={{ height: '50px', objectFit: 'contain' }} />
                        )}
                        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>{organization?.name || 'Catálogo'}</h1>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button
                            className="btn-primary"
                            onClick={() => setIsCartOpen(!isCartOpen)}
                            style={{ position: 'relative' }}
                        >
                            🛒 Carrito ({cart.reduce((a, c) => a + c.qty, 0)})
                        </button>
                        <Link
                            to="/login"
                            style={{ textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem' }}
                        >
                            Soy Vendedor
                        </Link>
                    </div>
                </div>
            </header>

            <div className="main-layout" style={{ gridTemplateColumns: isCartOpen ? '1fr 350px' : '1fr' }}>
                {/* Product Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Buscar en el catálogo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1.1rem',
                                borderRadius: '8px',
                                border: '1px solid var(--color-border)',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                color: 'white'
                            }}
                        />
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.6)' }}>
                            <p style={{ fontSize: '1.2rem' }}>No encontramos lo que buscas.</p>
                            <small>Prueba con otro término de búsqueda.</small>
                        </div>
                    ) : (
                        <div className="product-grid">
                            {filteredProducts.map(product => {
                                const isAvailable = product.quantity > 0;
                                return (
                                    <div key={product.id} className="product-card card">
                                        {product.image && (
                                            <div className="product-image-container">
                                                <img src={product.image} alt={product.name} className="product-image" onError={(e) => e.target.style.display = 'none'} />
                                            </div>
                                        )}
                                        <div className="product-header">
                                            <h3>{product.name}</h3>
                                            {isAvailable ? (
                                                <span className="stock-badge in-stock">Disponible</span>
                                            ) : (
                                                <span className="stock-badge low-stock">Agotado</span>
                                            )}
                                        </div>
                                        <p className="product-price">${Number(product.price).toFixed(2)}</p>
                                        {product.description && <p className="product-desc">{product.description}</p>}

                                        {isAvailable && (
                                            <div className="product-actions" style={{ justifyContent: 'center' }}>
                                                <button className="btn btn-primary" onClick={() => addToCart(product)}>
                                                    Agregar al Carrito
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Floating/Fixed Cart */}
                {isCartOpen && (
                    <aside className="card" style={{ height: 'fit-content', position: 'sticky', top: '1rem' }}>
                        <h2>Tu Pedido</h2>
                        {cart.length === 0 ? (
                            <p style={{ color: 'var(--color-text-secondary)' }}>El carrito está vacío.</p>
                        ) : (
                            <>
                                <ul style={{ listStyle: 'none', marginBottom: '1.5rem' }}>
                                    {cart.map(item => (
                                        <li key={item.id} style={{ padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: '500' }}>{item.name}</span>
                                                <span>${(item.price * item.qty).toFixed(2)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <button className="btn-icon" style={{ width: '24px', height: '24px', fontSize: '1rem' }} onClick={() => updateQty(item.id, -1)}>-</button>
                                                    <span>{item.qty}</span>
                                                    <button className="btn-icon" style={{ width: '24px', height: '24px', fontSize: '1rem' }} onClick={() => updateQty(item.id, 1)}>+</button>
                                                </div>
                                                <button className="btn-danger-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => removeFromCart(item.id)}>x</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <div style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'right' }}>
                                    Total: ${total.toFixed(2)}
                                </div>
                                <button
                                    className="btn"
                                    style={{ backgroundColor: '#25D366', color: 'white', width: '100%' }}
                                    onClick={handleWhatsAppOrder}
                                >
                                    📱 Pedir por WhatsApp
                                </button>
                            </>
                        )}
                    </aside>
                )}
            </div>
            <WhatsAppButton />
        </div>
    );
}
