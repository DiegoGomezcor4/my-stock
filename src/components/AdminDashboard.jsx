import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Profiles
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (profilesError) throw profilesError;
            setUsers(profilesData || []);

            // Fetch Organizations
            const { data: orgsData, error: orgsError } = await supabase
                .from('organizations')
                .select('*')
                .order('created_at', { ascending: false });

            if (orgsError) throw orgsError;
            setOrganizations(orgsData || []);

        } catch (error) {
            toast.error('Error cargando datos de admin: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleAdminRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!confirm(`¿Estás seguro de cambiar el rol a ${newRole}?`)) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;
            toast.success(`Rol actualizado a ${newRole}`);
            fetchData(); // Refresh list
        } catch (error) {
            toast.error('Error actualizando rol: ' + error.message);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando panel de administración...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ marginBottom: '2rem', color: 'var(--color-primary)' }}>Panel de Administración</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="card">
                    <h3>Usuarios Totales</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{users.length}</p>
                </div>
                <div className="card">
                    <h3>Organizaciones</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{organizations.length}</p>
                </div>
            </div>

            <div style={{ marginBottom: '3rem' }}>
                <h2>Usuarios Registrados</h2>
                <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <th style={{ textAlign: 'left', padding: '1rem' }}>Email</th>
                                <th style={{ textAlign: 'left', padding: '1rem' }}>Rol</th>
                                <th style={{ textAlign: 'left', padding: '1rem' }}>Fecha Registro</th>
                                <th style={{ textAlign: 'left', padding: '1rem' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '1rem' }}>{user.email}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            backgroundColor: user.role === 'admin' ? 'var(--color-primary)' : '#eee',
                                            color: user.role === 'admin' ? '#fff' : '#333',
                                            fontSize: '0.8rem'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <button
                                            onClick={() => toggleAdminRole(user.id, user.role)}
                                            style={{
                                                padding: '0.25rem 0.5rem',
                                                fontSize: '0.8rem',
                                                border: '1px solid var(--color-border)',
                                                background: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {user.role === 'admin' ? 'Degradar a User' : 'Hacer Admin'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h2>Organizaciones</h2>
                <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <th style={{ textAlign: 'left', padding: '1rem' }}>Nombre</th>
                                <th style={{ textAlign: 'left', padding: '1rem' }}>ID</th>
                                <th style={{ textAlign: 'left', padding: '1rem' }}>Creado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organizations.map(org => (
                                <tr key={org.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '1rem' }}>{org.name}</td>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{org.id}</td>
                                    <td style={{ padding: '1rem' }}>{new Date(org.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
