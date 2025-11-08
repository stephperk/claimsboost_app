import { error } from '@sveltejs/kit';
import { urlToStateName, getStateAbbreviation } from '$lib/utils/stateMapping.js';

/**
 * Server-side load function for individual law firm pages.
 * Provides better SEO and initial page load performance.
 */
export async function load({ params, fetch }) {
	const { state: urlState, slug } = params;

	// Convert URL state (e.g., "texas" or "north-carolina") to proper format
	const stateName = urlToStateName(urlState);
	const stateAbbr = getStateAbbreviation(stateName);

	if (!stateAbbr) {
		throw error(404, 'Invalid state');
	}

	try {
		// Fetch firm data from our API using state abbreviation
		const response = await fetch(`/api/law-firms/by-slug?state=${encodeURIComponent(stateAbbr)}&slug=${encodeURIComponent(slug)}`);

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

		// Transform the database firm data to UI format
		const firm = transformFirmData(data.firm);

		// Add the full state name for display
		firm.stateName = stateName;

		return {
			firm
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
