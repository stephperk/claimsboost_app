import { json } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabaseServer';

/**
 * GET /api/law-firms/by-slug
 *
 * Fetch a single law firm by its slug and state.
 *
 * Query Parameters:
 * - state (required): Two-letter state code (e.g., 'NC')
 * - slug (required): URL-safe slug for the firm
 *
 * Response:
 * - firm: Complete law firm object
 * - error: Error message if firm not found
 */
export async function GET({ url }) {
	const state = url.searchParams.get('state');
	const slug = url.searchParams.get('slug');

	// Validate required parameters
	if (!state || !slug) {
		return json({ error: 'State and slug are required' }, { status: 400 });
	}

	try {
		// Query the verified_law_firms table directly
		const { data, error } = await supabaseServer
			.from('verified_law_firms')
			.select('*')
			.eq('state', state)
			.eq('slug', slug)
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				// No rows returned
				return json({ error: 'Law firm not found' }, { status: 404 });
			}
			console.error('Supabase query error:', error);
			throw error;
		}

		if (!data) {
			return json({ error: 'Law firm not found' }, { status: 404 });
		}

		return json({ firm: data });
	} catch (error) {
		console.error('Error fetching law firm:', error);
		return json(
			{ error: error.message || 'Failed to fetch law firm' },
			{ status: 500 }
		);
	}
}
