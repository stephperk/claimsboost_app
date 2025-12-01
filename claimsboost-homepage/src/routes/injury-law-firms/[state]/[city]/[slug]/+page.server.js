import { error } from '@sveltejs/kit';
import { urlToCityName, cityNameToUrl, getStateName } from '$lib/utils/stateMapping.js';

/**
 * Server-side load function for individual law firm pages.
 * Provides better SEO and initial page load performance.
 */
export async function load({ params, fetch }) {
	const { city: urlCity, slug } = params;

	try {
		// Fetch firm data from our API using slug (slugs are unique across all firms)
		const response = await fetch(`/api/law-firms/by-slug?slug=${encodeURIComponent(slug)}`);

		if (!response.ok) {
			if (response.status === 404) {
				throw error(404, 'Law firm not found');
			}
			throw error(response.status, 'Failed to load law firm');
		}

		const data = await response.json();

		if (!data.firm) {
			throw error(404, 'Law firm not found');
		}

		// Validate that the city in the URL matches the firm's actual city
		const expectedCityUrl = cityNameToUrl(data.firm.city);
		if (urlCity !== expectedCityUrl) {
			throw error(404, 'Invalid city in URL');
		}

		// Transform the database firm data to UI format
		const firm = transformFirmData(data.firm);

		// Add the full state name for display
		firm.stateName = getStateName(data.firm.state);

		// Fetch settlements for this firm
		let settlements = [];
		try {
			const settlementsResponse = await fetch(`/api/settlements/by-firm?firm_slug=${encodeURIComponent(slug)}`);
			if (settlementsResponse.ok) {
				const settlementsData = await settlementsResponse.json();
				// Transform settlements data to match component format
				settlements = settlementsData.settlements.map(s => {
					// Convert state to lowercase and city to URL-friendly format
					const stateUrl = s.firm_state?.toLowerCase() || '';
					const cityUrl = s.firm_city?.toLowerCase().replace(/\s+/g, '-') || '';

					return {
						type: s.display_title || s.injury_cause || 'Personal Injury',
						amount: s.amount,
						location: s.firm_city && s.firm_state ? `${s.firm_city}, ${s.firm_state}` : 'Location not specified',
						year: new Date().getFullYear(), // Default to current year
						description: s.display_summary || 'Settlement details available.',
						similarCases: 'Similar cases in your area: 23', // Placeholder for now
						practiceArea: s.primary_practice_area || 'Personal Injury',
						lawFirm: s.firm_display_name || s.firm_name || 'Law Firm',
						firmUrl: s.firm_slug && stateUrl && cityUrl
							? `/injury-law-firms/${stateUrl}/${cityUrl}/${s.firm_slug}`
							: '#',
						websiteUrl: s.firm_website || firm.website
					};
				});
			}
		} catch (err) {
			console.error('Failed to fetch settlements for firm:', err);
			// Continue with empty settlements array
		}

		return {
			firm,
			settlements
		};
	} catch (err) {
		if (err.status) {
			// Already an error object
			throw err;
		}
		console.error('Error loading law firm page:', err);
		throw error(500, 'Failed to load law firm');
	}
}

/**
 * Transform database firm data to UI format
 */
function transformFirmData(dbFirm) {
	// Calculate years of experience from year_founded
	const currentYear = new Date().getFullYear();
	const yearsExperience = dbFirm.year_founded
		? currentYear - dbFirm.year_founded
		: null;

	// Format total_recovered as currency (millions or billions)
	let amountCollected = null;
	if (dbFirm.total_recovered) {
		if (dbFirm.total_recovered >= 1_000_000_000) {
			// Billions
			const billions = Math.floor(dbFirm.total_recovered / 1_000_000_000);
			amountCollected = `$${billions}B+`;
		} else if (dbFirm.total_recovered >= 1_000_000) {
			// Millions
			const millions = Math.floor(dbFirm.total_recovered / 1_000_000);
			amountCollected = `$${millions}M+`;
		}
	}

	return {
		id: dbFirm.google_place_id || dbFirm.place_id,
		name: dbFirm.name || dbFirm.firm_name,
		displayName: dbFirm.display_name,
		fullName: dbFirm.full_name,
		slug: dbFirm.slug,
		address: dbFirm.formatted_address || dbFirm.street_address,
		city: dbFirm.city,
		state: dbFirm.state,
		phone: dbFirm.phone_number || dbFirm.phone,
		website: dbFirm.website_url || dbFirm.website || dbFirm.domain,
		description: dbFirm.short_description || dbFirm.company_description || '',
		longDescription: dbFirm.long_description || dbFirm.company_description || '',
		practiceAreas: (dbFirm.practice_areas && dbFirm.practice_areas.length > 0) ? dbFirm.practice_areas : ['Personal Injury'],
		rating: dbFirm.rating || 0,
		reviews: dbFirm.user_rating_count || dbFirm.review_count || 0,
		isVerified: dbFirm.is_personal_injury_firm || false,
		yearsExperience,
		yearFounded: dbFirm.year_founded,
		casesWon: dbFirm.cases_won,
		amountCollected,
		clientsServed: dbFirm.clients_served,
		shortFacts: dbFirm.short_facts || [],
		longFacts: dbFirm.long_facts || []
	};
}
