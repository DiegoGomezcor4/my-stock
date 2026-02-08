import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function useExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpenses();
    }, []);

    async function fetchExpenses() {
        try {
            const { data, error } = await supabase
                .from('expenses')
                .select(`
          *,
          suppliers (
            name
          )
        `)
                .order('date', { ascending: false });

            if (error) throw error;
            setExpenses(data || []);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            toast.error('Error al cargar gastos');
        } finally {
            setLoading(false);
        }
    }

    async function addExpense(expense) {
        try {
            const { data, error } = await supabase
                .from('expenses')
                .insert([expense])
                .select(`
          *,
          suppliers (
            name
          )
        `)
                .single();

            if (error) throw error;
            setExpenses([data, ...expenses]);
            toast.success('Gasto registrado exitosamente');
            return data;
        } catch (error) {
            console.error('Error adding expense:', error);
            toast.error('Error al registrar gasto');
            return null;
        }
    }

    async function deleteExpense(id) {
        try {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setExpenses(expenses.filter(e => e.id !== id));
            toast.success('Gasto eliminado');
        } catch (error) {
            console.error('Error deleting expense:', error);
            toast.error('Error al eliminar gasto');
        }
    }

    return {
        expenses,
        loading,
        addExpense,
        deleteExpense
    };
}
