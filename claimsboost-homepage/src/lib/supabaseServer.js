import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// For server-side operations, we use the anon key with RLS policies
// If you need service role access later, add SUPABASE_SERVICE_ROLE_KEY to .env
export const supabaseServer = createClient(
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY,
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	}
);
