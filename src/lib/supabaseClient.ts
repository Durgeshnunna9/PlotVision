import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://styeczxtusehjmappqrd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0eWVjenh0dXNlaGptYXBwcXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTY1MjEsImV4cCI6MjA3MDY3MjUyMX0.UAhm72-aWShjoG5W64zCzXAu3FrQDG6Dl3w07gI94aY";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
