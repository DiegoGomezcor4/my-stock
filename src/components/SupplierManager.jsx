import { useState } from 'react';

export function SupplierManager({ suppliers, onAdd, onUpdate, onDelete }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [formData, setFormData] = useState({ name: '', contact: '', email: '', address: '' });

    const resetForm = () => {
        setFormData({ name: '', contact: '', email: '', address: '' });
        setEditingSupplier(null);
        setIsModalOpen(false);
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name,
            contact: supplier.contact || '',
            email: supplier.email || '',
            address: supplier.address || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingSupplier) {
            onUpdate(editingSupplier.id, formData);
        } else {
            onAdd(formData);
        }
        resetForm();
    };

    return (
        <div className="product-list-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Proveedores</h2>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    + Nuevo Proveedor
                </button>
            </div>

            <div className="table-responsive">
                <table className="product-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Contacto</th>
                            <th>Email</th>
                            <th>Dirección</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map((supplier) => (
                            <tr key={supplier.id}>
                                <td>{supplier.name}</td>
                                <td>{supplier.contact}</td>
                                <td>{supplier.email}</td>
                                <td>{supplier.address}</td>
                                <td>
                                    <button className="btn-secondary" onClick={() => handleEdit(supplier)} style={{ marginRight: '0.5rem' }}>
                                        Editar
                                    </button>
                                    <button className="btn-danger" onClick={() => {
                                        if (window.confirm('¿Seguro que deseas eliminar este proveedor?')) {
                                            onDelete(supplier.id);
                                        }
                                    }}>
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {suppliers.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                    No hay proveedores registrados
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Contacto (Teléfono/Persona)</label>
                                <input
                                    type="text"
                                    value={formData.contact}
                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Dirección</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={resetForm}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
