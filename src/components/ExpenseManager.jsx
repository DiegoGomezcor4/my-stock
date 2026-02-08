import { useState } from 'react';

export function ExpenseManager({ expenses, suppliers, onAdd, onDelete }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        category: 'General',
        supplier_id: ''
    });

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            description: '',
            amount: '',
            category: 'General',
            supplier_id: ''
        });
        setIsModalOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            ...formData,
            amount: parseFloat(formData.amount),
            supplier_id: formData.supplier_id || null // Ensure null if empty string
        });
        resetForm();
    };

    return (
        <div className="product-list-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Gastos</h2>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    + Registrar Gasto
                </button>
            </div>

            <div className="table-responsive">
                <table className="product-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Descripción</th>
                            <th>Categoría</th>
                            <th>Proveedor</th>
                            <th>Monto</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map((expense) => (
                            <tr key={expense.id}>
                                <td>{new Date(expense.date).toLocaleDateString()}</td>
                                <td>{expense.description}</td>
                                <td>{expense.category}</td>
                                <td>{expense.suppliers?.name || '-'}</td>
                                <td>${parseFloat(expense.amount).toFixed(2)}</td>
                                <td>
                                    <button className="btn-danger" onClick={() => {
                                        if (window.confirm('¿Seguro que deseas eliminar este gasto?')) {
                                            onDelete(expense.id);
                                        }
                                    }}>
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {expenses.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                    No hay gastos registrados
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Registrar Nuevo Gasto</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Fecha</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Monto</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Categoría</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="General">General</option>
                                    <option value="Servicios">Servicios</option>
                                    <option value="Alquiler">Alquiler</option>
                                    <option value="Mantenimiento">Mantenimiento</option>
                                    <option value="Salarios">Salarios</option>
                                    <option value="Impuestos">Impuestos</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Transporte">Transporte</option>
                                    <option value="Otros">Otros</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Proveedor (Opcional)</label>
                                <select
                                    value={formData.supplier_id}
                                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
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
