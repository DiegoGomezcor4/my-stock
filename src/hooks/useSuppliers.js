import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function useSuppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    async function fetchSuppliers() {
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSuppliers(data || []);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            toast.error('Error al cargar proveedores');
        } finally {
            setLoading(false);
        }
    }

    async function addSupplier(supplier) {
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .insert([supplier])
                .select()
                .single();

            if (error) throw error;
            setSuppliers([data, ...suppliers]);
            toast.success('Proveedor agregado exitosamente');
            return data;
        } catch (error) {
            console.error('Error adding supplier:', error);
            toast.error('Error al agregar proveedor');
            return null;
        }
    }

    async function updateSupplier(id, updates) {
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setSuppliers(suppliers.map(s => s.id === id ? data : s));
            toast.success('Proveedor actualizado');
            return data;
        } catch (error) {
            console.error('Error updating supplier:', error);
            toast.error('Error al actualizar proveedor');
            return null;
        }
    }

    async function deleteSupplier(id) {
        try {
            const { error } = await supabase
                .from('suppliers')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setSuppliers(suppliers.filter(s => s.id !== id));
            toast.success('Proveedor eliminado');
        } catch (error) {
            console.error('Error deleting supplier:', error);
            toast.error('Error al eliminar proveedor');
        }
    }

    return {
        suppliers,
        loading,
        addSupplier,
        updateSupplier,
        deleteSupplier
    };
}
