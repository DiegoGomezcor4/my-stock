import { useState, useEffect } from 'react';
import { useOrganization } from '../hooks/useOrganization';
import { toast } from 'sonner';

export function Settings() {
    const { organization, loading, updateOrganization } = useOrganization();
    const [formData, setFormData] = useState({ name: '', logo_url: '', color: '#3b82f6' });

    useEffect(() => {
        if (organization) {
            setFormData({
                name: organization.name || '',
                logo_url: organization.logo_url || '',
                color: organization.color || '#3b82f6'
            });
        }
    }, [organization]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateOrganization(formData);
            toast.success('Configuración actualizada correctamente');
        } catch (error) {
            toast.error('Error al actualizar la configuración');
            console.error(error);
        }
    };

    if (loading) return <div>Cargando configuración...</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card">
                <h2>Configuración de la Empresa</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    <div className="form-group">
                        <label htmlFor="companyName">Nombre de la Empresa</label>
                        <input
                            id="companyName"
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: Mi Negocio S.A."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="logoUrl">URL del Logo (Opcional)</label>
                        <input
                            id="logoUrl"
                            type="url"
                            className="form-input"
                            value={formData.logo_url}
                            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                            placeholder="https://ejemplo.com/logo.png"
                        />
                        {formData.logo_url && (
                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Vista previa:</p>
                                <img
                                    src={formData.logo_url}
                                    alt="Logo Preview"
                                    style={{ maxHeight: '80px', objectFit: 'contain' }}
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="themeColor">Color del Tema</label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input
                                id="themeColor"
                                type="color"
                                value={formData.color || '#3b82f6'}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                style={{ width: '50px', height: '50px', padding: '0', border: 'none', cursor: 'pointer', background: 'none' }}
                            />
                            <span style={{ color: 'var(--color-text-secondary)' }}>
                                {formData.color || '#3b82f6'}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                            Elige el color principal para tu marca.
                        </p>
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
