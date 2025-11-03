import { json } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabaseServer';

/**
 * GET /api/law-firms/search
 *
 * Comprehensive search endpoint for the law firm search page.
 * Supports filtering by practice areas, rating, and sorting.
 *
 * Query Parameters:
 * - lat (required): User's latitude
 * - lng (required): User's longitude
 * - radius (optional): Search radius in miles (default: 50)
 * - practice_areas (optional): Comma-separated list of practice areas (passed to DB function)
 * - min_rating (optional): Minimum rating filter (applied client-side)
 * - sort_by (optional): 'relevance' | 'rating' | 'distance' (default: 'relevance')
 * - limit (optional): Maximum results to return (default: 50)
 *
 * Response:
 * - firms: Array of law firm objects
 * - total_count: Total number of matching firms
 * - radius_used: The radius that was used
 * - location: The search coordinates
 * - filters_applied: Summary of applied filters
 *
 * Note: Uses search_law_firms_nearby_fast(user_lat, user_lng, radius_miles, practice_area_filter, limit_results)
 */
export async function GET({ url }) {
	const lat = parseFloat(url.searchParams.get('lat'));
	const lng = parseFloat(url.searchParams.get('lng'));
	const radius = parseInt(url.searchParams.get('radius') || '50');
	const sortBy = url.searchParams.get('sort_by') || 'relevance';
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const minRating = parseFloat(url.searchParams.get('min_rating') || '0');
	const practiceAreasParam = url.searchParams.get('practice_areas');
	const practiceAreas = practiceAreasParam ? practiceAreasParam.split(',').map(s => s.trim()) : [];

	// Validate required coordinates
	if (isNaN(lat) || isNaN(lng)) {
		return json({ error: 'Invalid coordinates' }, { status: 400 });
	}

	try {
		// Call Supabase search function (fast version with all needed fields)
		// Function signature: search_law_firms_nearby_fast(user_lat, user_lng, radius_miles, practice_area_filter, limit_results)
		const practiceAreaFilter = practiceAreas.length > 0 ? practiceAreas.join(',') : null;

		const { data, error } = await supabaseServer.rpc('search_law_firms_nearby_fast', {
			user_lat: lat,
			user_lng: lng,
			radius_miles: radius,
			practice_area_filter: practiceAreaFilter,
			limit_results: 200 // Get extra results for filtering
		});

		if (error) {
			console.error('Supabase RPC error:', error);
			throw error;
		}

		let results = data || [];

		// Apply rating filter (client-side)
		if (minRating > 0) {
			results = results.filter(firm => (firm.rating || 0) >= minRating);
		}

		// Apply sorting
		switch (sortBy) {
			case 'rating':
				results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
				break;
			case 'distance':
				results.sort((a, b) => a.distance_miles - b.distance_miles);
				break;
			case 'relevance':
			default:
				// Sort by quality score (if available), then distance
				results.sort((a, b) => {
					const qualityA = a.quality_score || 0;
					const qualityB = b.quality_score || 0;
					if (qualityB !== qualityA) {
						return qualityB - qualityA;
					}
					return a.distance_miles - b.distance_miles;
				});
				break;
		}

		// Apply limit
		const totalCount = results.length;
		const limitedResults = results.slice(0, limit);

		return json({
			firms: limitedResults,
			total_count: totalCount,
			radius_used: radius,
			location: { lat, lng },
			filters_applied: {
				practice_areas: practiceAreas,
				min_rating: minRating,
				sort_by: sortBy
			}
		});
	} catch (error) {
		console.error('Search error:', error);
		return json(
			{ error: error.message || 'Failed to search law firms' },
			{ status: 500 }
		);
	}
}
