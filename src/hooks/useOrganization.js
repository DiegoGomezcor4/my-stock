import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useOrganization() {
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrganization();
    }, []);

    async function fetchOrganization() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let { data, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code === 'PGRST116') {
                // Organization not found, create default
                const { data: newOrg, error: createError } = await supabase
                    .from('organizations')
                    .insert([{ user_id: user.id, name: 'Mi Empresa' }])
                    .select()
                    .single();

                if (createError) {
                    console.error('Error creating organization:', createError);
                } else {
                    data = newOrg;
                }
            } else if (error) {
                console.error('Error fetching organization:', error);
            }

            setOrganization(data);
        } catch (err) {
            console.error('Unexpected error in useOrganization:', err);
        } finally {
            setLoading(false);
        }
    }

    const updateOrganization = async (updates) => {
        if (!organization) return;

        // Optimistic update
        setOrganization(prev => ({ ...prev, ...updates }));

        const { error } = await supabase
            .from('organizations')
            .update(updates)
            .eq('id', organization.id);

        if (error) {
            console.error('Error updating organization:', error);
            // Revert on error could be implemented here
            fetchOrganization();
        }
    };

    return {
        organization,
        loading,
        updateOrganization
    };
}
