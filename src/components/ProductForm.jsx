import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function ProductForm({ onAdd, onUpdate, editingProduct, onCancelEdit }) {
    const defaultState = {
        name: '',
        quantity: '',
        price: '',
        cost: '',
        minStock: '5',
        image: '',
        description: '',
        margin: '' // New explicit state for margin
    };

    const [formData, setFormData] = useState(defaultState);

    useEffect(() => {
        if (editingProduct) {
            const cost = editingProduct.cost || 0;
            const price = editingProduct.price || 0;
            // Calculate initial margin
            let initialMargin = '';
            if (cost > 0 && price > 0) {
                initialMargin = (((price - cost) / cost) * 100).toFixed(1);
            }

            setFormData({
                name: editingProduct.name,
                quantity: editingProduct.quantity,
                price: editingProduct.price,
                cost: editingProduct.cost || '',
                minStock: editingProduct.min_stock || editingProduct.minStock || 5,
                image: editingProduct.image || '',
                description: editingProduct.description || '',
                margin: initialMargin
            });
        } else {
            setFormData(defaultState);
        }
    }, [editingProduct]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.quantity) return;

        const productData = {
            ...formData,
            quantity: Number(formData.quantity),
            price: Number(formData.price) || 0,
            cost: Number(formData.cost) || 0,
            minStock: Number(formData.minStock) || 0
        };
        // Remove margin from productData before sending to DB as it is not a DB column usually, 
        // or keep it if you want, but likely ignored.
        delete productData.margin;

        if (editingProduct) {
            onUpdate(editingProduct.id, productData);
            toast.success('Producto actualizado');
        } else {
            onAdd(productData);
            toast.success('Producto agregado');
        }

        setFormData(defaultState);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const updated = { ...prev, [name]: value };

            // Logic to keep Margin & Price in sync when Cost or Price changes
            if (name === 'price' || name === 'cost') {
                const p = Number(name === 'price' ? value : prev.price) || 0;
                const c = Number(name === 'cost' ? value : prev.cost) || 0;

                if (c > 0 && p > 0) {
                    updated.margin = (((p - c) / c) * 100).toFixed(1);
                } else if (c === 0 && p > 0) {
                    updated.margin = '100'; // Fallback for 0 cost
                } else {
                    updated.margin = '';
                }
            }
            return updated;
        });
    };

    const handleMarginChange = (e) => {
        const marginValue = e.target.value;
        const cost = Number(formData.cost) || 0;

        // 1. Update margin display immediately (allows free typing)
        setFormData(prev => {
            const updated = { ...prev, margin: marginValue };

            // 2. Calculate new price based on incomplete margin typing? 
            // We should only calc price if marginValue is a valid number.
            if (marginValue === '' || isNaN(marginValue)) {
                return updated;
            }

            const marginPercent = Number(marginValue);
            const newPrice = cost * (1 + marginPercent / 100);
            updated.price = newPrice.toFixed(2);

            return updated;
        });
    };

    const marginAmount = (Number(formData.price) || 0) - (Number(formData.cost) || 0);

    return (
        <form onSubmit={handleSubmit} className="product-form card" style={editingProduct ? { border: '1px solid var(--color-primary)' } : {}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>{editingProduct ? 'Editar Producto' : 'Agregar Producto'}</h2>
                {editingProduct && (
                    <button type="button" onClick={onCancelEdit} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                        Cancelar
                    </button>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="name">Nombre Concepto</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej: Laptop Gaming"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="image">URL de Imagen (Opcional)</label>
                <input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://ejemplo.com/imagen.jpg"
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="quantity">Cantidad</label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        min="0"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="minStock">Alerta Stock Mín.</label>
                    <input
                        type="number"
                        id="minStock"
                        name="minStock"
                        value={formData.minStock}
                        onChange={handleChange}
                        min="0"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="cost">Costo ($)</label>
                    <input
                        type="number"
                        id="cost"
                        name="cost"
                        value={formData.cost}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="margin">Margen %</label>
                    <input
                        type="number"
                        id="margin"
                        name="margin"
                        value={formData.margin}
                        onChange={handleMarginChange}
                        placeholder="%"
                        min="0"
                        step="0.1"
                        disabled={!formData.cost || Number(formData.cost) === 0}
                        title={(!formData.cost || Number(formData.cost) === 0) ? "Ingrese un costo primero" : ""}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="price">Precio Venta ($)</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                    />
                </div>
            </div>

            {(Number(formData.price) > 0 || Number(formData.cost) > 0) && (
                <div className="margin-info" style={{
                    marginBottom: '1rem',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                }}>
                    <span>Ganancia Neta: <strong>${marginAmount.toFixed(2)}</strong></span>
                </div>
            )}

            <div className="form-group">
                <label htmlFor="description">Descripción (Opcional)</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                />
            </div>

            <button type="submit" className="btn btn-primary">
                {editingProduct ? 'Actualizar Producto' : 'Guardar Producto'}
            </button>
        </form>
    );
}
