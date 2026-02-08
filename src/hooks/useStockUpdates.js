import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useStockUpdates() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        const { data: { user } } = await supabase.auth.getUser();

        let query = supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        // If logged in, filter by own ID to ensure we don't see other public products in the dashboard
        if (user) {
            query = query.eq('user_id', user.id);
        }

        const { data, error } = await query;

        if (error) console.error('Error fetching products:', error);
        else setProducts(data || []);
    }

    const addProduct = async (product) => {
        // Optimistic update
        const tempId = crypto.randomUUID();
        const newProduct = { ...product, id: tempId };
        setProducts(prev => [newProduct, ...prev]);

        // Map frontend camelCase to DB snake_case
        const dbProduct = {
            ...product,
            min_stock: product.minStock,
            // Remove camelCase field if Supabase is strict (it ignores usually but cleaner to remove)
        };
        delete dbProduct.minStock;

        const { data, error } = await supabase
            .from('products')
            .insert([dbProduct])
            .select();

        if (error) {
            console.error('Error adding product:', error);
            // Rollback
            setProducts(prev => prev.filter(p => p.id !== tempId));
        } else {
            // Replace temp with real data
            setProducts(prev => prev.map(p => p.id === tempId ? data[0] : p));
        }
    };

    const updateProduct = async (id, updates) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

        // Prepare updates for DB (snake_case)
        const dbUpdates = { ...updates };
        if (dbUpdates.minStock !== undefined) {
            dbUpdates.min_stock = dbUpdates.minStock;
            delete dbUpdates.minStock;
        }

        const { error } = await supabase
            .from('products')
            .update(dbUpdates)
            .eq('id', id);

        if (error) console.error('Error updating product:', error);
    };

    const deleteProduct = async (id) => {
        setProducts(prev => prev.filter(p => p.id !== id));

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) console.error('Error deleting product:', error);
    };

    return {
        products,
        addProduct,
        updateProduct,
        deleteProduct
    };
}
