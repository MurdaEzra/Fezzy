import { createClient } from '@supabase/supabase-js';

const supabaseUrl =  'https://hiemtbvjjxwvvtupohey.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZW10YnZqanh3dnZ0dXBvaGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NTk4NDksImV4cCI6MjA5MTEzNTg0OX0.xsVvzq882N2K57XXEuTGXA9OYUFarBeeLWOCMRh6rr0';
export const supabase = createClient(supabaseUrl, supabaseKey);
