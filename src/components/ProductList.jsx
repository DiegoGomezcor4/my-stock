import { useState } from 'react';
import { toast } from 'sonner';

export function ProductList({ products, onDelete, onUpdateStock, onEdit }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (products.length === 0) {
        return (
            <div className="empty-state card">
                <p>No hay productos en el inventario.</p>
                <small>Agrega uno nuevo usando el formulario.</small>
            </div>
        );
    }

    return (
        <div className="product-list-container">
            <div className="search-bar" style={{ marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.8rem',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-bg-card)',
                        color: 'var(--color-text)'
                    }}
                />
            </div>

            {filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                    No se encontraron productos que coincidan con "{searchTerm}"
                </div>
            ) : (
                <div className="product-grid">
                    {filteredProducts.map(product => {

                        const minStock = product.minStock || product.min_stock || 5;
                        const isLowStock = product.quantity < minStock;

                        return (
                            <div key={product.id} className="product-card card">
                                {product.image && (
                                    <div className="product-image-container">
                                        <img src={product.image} alt={product.name} className="product-image" onError={(e) => e.target.style.display = 'none'} />
                                    </div>
                                )}

                                <div className="product-header">
                                    <h3>{product.name}</h3>
                                    <span className={`stock-badge ${isLowStock ? 'low-stock' : 'in-stock'}`}>
                                        {product.quantity} unid.
                                    </span>
                                </div>

                                <p className="product-price">${Number(product.price).toFixed(2)}</p>
                                {product.cost > 0 && (
                                    <small className="product-cost">Costo: ${Number(product.cost).toFixed(2)}</small>
                                )}

                                {product.description && <p className="product-desc">{product.description}</p>}

                                <div className="product-actions">
                                    <button
                                        className="btn-icon"
                                        onClick={() => onUpdateStock(product.id, { quantity: product.quantity + 1 })}
                                        title="Aumentar Stock"
                                    >
                                        +
                                    </button>
                                    <button
                                        className="btn-icon"
                                        onClick={() => onUpdateStock(product.id, { quantity: Math.max(0, product.quantity - 1) })}
                                        title="Disminuir Stock"
                                    >
                                        -
                                    </button>
                                    <button
                                        className="btn-icon"
                                        onClick={() => {
                                            onEdit(product);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        title="Editar"
                                        style={{ fontSize: '1rem', width: 'auto', padding: '0 0.5rem' }}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn-danger-outline"
                                        onClick={() => {
                                            if (confirm('¿Estás seguro de eliminar este producto?')) {
                                                onDelete(product.id);
                                                toast.success('Producto eliminado');
                                            }
                                        }}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
