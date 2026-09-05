import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://afyezcfkoxumtqfdujfm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmeWV6Y2Zrb3h1bXRxZmR1amZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MzM1MzksImV4cCI6MjEwNDAwOTUzOX0.uur1MwJ8Zoso5YYPsWqcVr75jgsds-O7gAd_o2mkrEM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
