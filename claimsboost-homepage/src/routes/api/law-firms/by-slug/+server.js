import { json } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabaseServer';

/**
 * GET /api/law-firms/by-slug
 *
 * Fetch a single law firm by its slug.
 *
 * Query Parameters:
 * - slug (required): URL-safe slug for the firm (unique across all firms)
 * - state (optional): Two-letter state code for backward compatibility
 *
 * Response:
 * - firm: Complete law firm object
 * - error: Error message if firm not found
 */
export async function GET({ url }) {
	const slug = url.searchParams.get('slug');
	const state = url.searchParams.get('state');

	// Validate required parameters
	if (!slug) {
		return json({ error: 'Slug is required' }, { status: 400 });
	}

	try {
		// Build query - slug is unique so we can query by slug alone
		let query = supabaseServer
			.from('verified_law_firms')
			.select('*')
			.eq('slug', slug);

		// Add state filter if provided (for backward compatibility)
		if (state) {
			query = query.eq('state', state);
		}

		const { data, error } = await query.single();

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
