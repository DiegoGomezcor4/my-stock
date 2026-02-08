
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load .env manually since we are not in Vite
import fs from 'fs'
const envConfig = dotenv.parse(fs.readFileSync('.env'))

const supabaseUrl = envConfig.VITE_SUPABASE_URL
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

const userId = 'c4471242-076a-4b89-9143-3e8649687528';

async function test() {
    console.log('Testing Public Access for User:', userId);

    // 1. Try to fetch organization
    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (orgError) {
        console.error('Organization Fetch Error:', orgError);
    } else {
        console.log('Organization Found:', org);
    }

    // 2. Try to fetch products
    const { data: products, error: prodError } = await supabase
        .from('products')
        .select('id, name')
        .eq('user_id', userId)
        .limit(3);

    if (prodError) {
        console.error('Products Fetch Error:', prodError);
    } else {
        console.log('Products Found:', products.length);
    }
}

test();
