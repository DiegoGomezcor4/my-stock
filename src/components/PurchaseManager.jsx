import { useState } from 'react';
import { toast } from 'sonner';

export function PurchaseManager({ purchases, suppliers, products, onAddPurchase }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [step, setStep] = useState(1); // 1: Select Supplier, 2: Select Products
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [cart, setCart] = useState([]); // [{ product_id, quantity, cost }]

    const resetForm = () => {
        setSelectedSupplierId('');
        setCart([]);
        setStep(1);
        setIsModalOpen(false);
    };

    const handleAddToCart = (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = cart.find(item => item.product_id === productId);
        if (existingItem) return; // Prevent duplicates for now, simplify UI

        setCart([...cart, {
            product_id: productId,
            name: product.name,
            quantity: 1,
            cost: product.cost || 0,
            new_cost: product.cost || 0 // Allow updating cost
        }]);
    };

    const updateCartItem = (productId, field, value) => {
        setCart(cart.map(item =>
            item.product_id === productId ? { ...item, [field]: value } : item
        ));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.product_id !== productId));
    };

    const handleSubmit = () => {
        if (!selectedSupplierId) {
            toast.error('Selecciona un proveedor');
            return;
        }
        if (cart.length === 0) {
            toast.error('Agrega al menos un producto');
            return;
        }

        const total = cart.reduce((acc, item) => acc + (parseFloat(item.new_cost) * parseInt(item.quantity)), 0);

        const purchaseData = {
            date: new Date().toISOString(),
            supplier_id: selectedSupplierId,
            total: total,
            items: cart
        };

        // Calculate updates for products
        const productsUpdates = cart.map(item => {
            const product = products.find(p => p.id === item.product_id);
            return {
                id: item.product_id,
                quantity: parseInt(item.quantity), // Amount to add
                cost: parseFloat(item.new_cost), // New cost price
                newQuantity: (product ? product.quantity : 0) + parseInt(item.quantity),
                newCost: parseFloat(item.new_cost)
            };
        });

        onAddPurchase(purchaseData, productsUpdates);
        resetForm();
    };

    return (
        <div className="product-list-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Compras y Reabastecimiento</h2>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    + Nueva Compra
                </button>
            </div>

            <div className="table-responsive">
                <table className="product-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Proveedor</th>
                            <th>Items</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases.map((purchase) => (
                            <tr key={purchase.id}>
                                <td>{new Date(purchase.date).toLocaleDateString()}</td>
                                <td>{purchase.suppliers?.name || 'Desconocido'}</td>
                                <td>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem' }}>
                                        {purchase.items?.map((item, idx) => (
                                            <li key={idx}>
                                                {item.quantity} x {item.name} (${item.new_cost})
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td>${parseFloat(purchase.total).toFixed(2)}</td>
                            </tr>
                        ))}
                        {purchases.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                                    No hay compras registradas
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
                        <h3>Registrar Compra - Paso {step}/2</h3>

                        {step === 1 && (
                            <div className="step-content">
                                <div className="form-group">
                                    <label>Seleccionar Proveedor</label>
                                    <select
                                        value={selectedSupplierId}
                                        onChange={(e) => setSelectedSupplierId(e.target.value)}
                                        style={{ fontSize: '1.2rem', padding: '0.8rem' }}
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {suppliers.length === 0 && (
                                    <p style={{ color: 'orange' }}>Primero debes registrar proveedores en la pestaña "Proveedores".</p>
                                )}
                                <div className="form-actions">
                                    <button className="btn-secondary" onClick={resetForm}>Cancelar</button>
                                    <button className="btn-primary" disabled={!selectedSupplierId} onClick={() => setStep(2)}>
                                        Siguiente &rarr;
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="step-content">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                                    {/* Product Selector */}
                                    <div>
                                        <h4>Agregar Productos</h4>
                                        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px' }}>
                                            {products.map(p => (
                                                <div key={p.id}
                                                    style={{ padding: '0.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span>{p.name} (Stock: {p.quantity})</span>
                                                    <button className="btn-secondary" style={{ padding: '0.2rem 0.5rem' }} onClick={() => handleAddToCart(p.id)}>
                                                        Agregar
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Cart */}
                                    <div>
                                        <h4>Resumen de Orden</h4>
                                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            {cart.length === 0 ? <p>Carrito vacío</p> : (
                                                cart.map(item => (
                                                    <div key={item.product_id} style={{ background: '#f9f9f9', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '4px' }}>
                                                        <strong>{item.name}</strong>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                            <div>
                                                                <label style={{ fontSize: '0.8rem' }}>Cant.</label>
                                                                <input type="number" min="1" value={item.quantity}
                                                                    onChange={(e) => updateCartItem(item.product_id, 'quantity', e.target.value)}
                                                                    style={{ width: '100%' }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label style={{ fontSize: '0.8rem' }}>Costo Unit.</label>
                                                                <input type="number" min="0" step="0.01" value={item.new_cost}
                                                                    onChange={(e) => updateCartItem(item.product_id, 'new_cost', e.target.value)}
                                                                    style={{ width: '100%' }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <button onClick={() => removeFromCart(item.product_id)}
                                                            style={{ color: 'red', background: 'none', border: 'none', fontSize: '0.8rem', marginTop: '0.5rem', cursor: 'pointer' }}>
                                                            Quitar
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div style={{ marginTop: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                                            Total: ${cart.reduce((acc, item) => acc + (parseFloat(item.new_cost) * parseInt(item.quantity || 0)), 0).toFixed(2)}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-actions" style={{ marginTop: '2rem' }}>
                                    <button className="btn-secondary" onClick={() => setStep(1)}>&larr; Atrás</button>
                                    <button className="btn-primary" onClick={handleSubmit}>Confirmar Compra</button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}
