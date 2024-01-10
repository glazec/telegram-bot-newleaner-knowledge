import { createClient } from '@supabase/supabase-js';

export const SENTRY_DSN = process.env.SENTRY_TOKEN || '';
export const SUPABASE_URL = process.env.SUPABASE_URL || '';
export const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
export const AMPLITUDE_KEY = process.env.AMPLITUDE_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
