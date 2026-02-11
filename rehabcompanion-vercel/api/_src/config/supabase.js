import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// CONEXION A SUPBASE VIA APIKEY
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to get PostgreSQL connection string for direct queries if needed
export const getConnectionString = () => {
  return process.env.DATABASE_URL;
};
