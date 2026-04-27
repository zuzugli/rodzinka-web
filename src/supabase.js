import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nxlslznjdidrkfnjvrmu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bHNsem5qZGlkcmtmbmp2cm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMjQ2MjgsImV4cCI6MjA5MjcwMDYyOH0.gcsH2MHt5es7OAs8qKfNjUOBhFkE13QHl2-KUT4GDOQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);