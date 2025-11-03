import { json } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabaseServer';

/**
 * GET /api/law-firms/nearby
 *
 * Fetches nearby law firms based on user's geolocation using the ultra-fast search function.
 * Implements automatic radius expansion and quality filtering.
 *
 * Query Parameters:
 * - lat (required): User's latitude
 * - lng (required): User's longitude
 * - radius (optional): Initial search radius in miles (default: 50)
 *
 * Response:
 * - firms: Array of law firm objects (up to 4)
 * - radius_used: The radius that was used to find firms (may be expanded)
 * - location: The search coordinates
 */
export async function GET({ url }) {
	const lat = parseFloat(url.searchParams.get('lat'));
	const lng = parseFloat(url.searchParams.get('lng'));
	const initialRadius = parseInt(url.searchParams.get('radius') || '50');

	// Validate required params
	if (isNaN(lat) || isNaN(lng)) {
		return json({ error: 'Invalid coordinates' }, { status: 400 });
	}

	// Radius expansion strategy: 50 → 100 → 150 → 200 miles
	const radiusSteps = [initialRadius, 100, 150, 200];
	const targetFirmCount = 4;

	try {
		let allFirms = [];
		let radiusUsed = initialRadius;

		// Try each radius until we find enough firms
		for (const radius of radiusSteps) {
			radiusUsed = radius;

			const { data, error } = await supabaseServer.rpc('search_law_firms_nearby_ultra_fast', {
				user_lat: lat,
				user_lng: lng,
				radius_miles: radius,
				min_rating: null,
				min_reviews: null,
				limit_results: 50 // Get more results to have options for quality filtering
			});

			if (error) {
				console.error('Supabase RPC error:', error);
				throw error;
			}

			if (data && data.length > 0) {
				allFirms = data;

				// Apply quality filtering: prioritize quality_score 2-3, include 1 if needed
				const premiumFirms = allFirms.filter((f) => f.quality_score >= 2);
				const standardFirms = allFirms.filter((f) => f.quality_score === 1);
				const basicFirms = allFirms.filter((f) => f.quality_score === 0);

				// Build result set with quality priority
				let selectedFirms = [...premiumFirms];

				// If we need more, add standard quality firms
				if (selectedFirms.length < targetFirmCount) {
					selectedFirms = [...selectedFirms, ...standardFirms];
				}

				// If still need more, add basic quality firms
				if (selectedFirms.length < targetFirmCount) {
					selectedFirms = [...selectedFirms, ...basicFirms];
				}

				// If we have enough firms, break out of radius expansion loop
				if (selectedFirms.length >= targetFirmCount) {
					allFirms = selectedFirms;
					break;
				}
			}
		}

		// Sort by quality_score DESC, then distance ASC
		allFirms.sort((a, b) => {
			if (b.quality_score !== a.quality_score) {
				return b.quality_score - a.quality_score;
			}
			return a.distance_miles - b.distance_miles;
		});

		// Return top 4 firms
		const topFirms = allFirms.slice(0, targetFirmCount);

		return json({
			firms: topFirms,
			radius_used: radiusUsed,
			location: { lat, lng },
			count: topFirms.length
		});
	} catch (error) {
		console.error('Search error:', error);
		return json({ error: error.message || 'Failed to fetch law firms' }, { status: 500 });
	}
}
