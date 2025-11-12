import { supabaseServer } from '$lib/supabaseServer';

/**
 * Server-side load function for injury law firms page.
 * Fetches top cities by state from the cities table.
 */
export async function load() {
	try {
		// Fetch cities with population > 30,000, ordered by population
		const { data, error } = await supabaseServer
			.from('cities')
			.select('state_abbr, state_name, search_city_name, population_2024, latitude, longitude')
			.gt('population_2024', 30000)
			.order('state_abbr')
			.order('population_2024', { ascending: false });

		if (error) {
			console.error('Error fetching cities:', error);
			return {
				citiesByState: []
			};
		}

		// Group cities by state and take top 10 per state
		const citiesByState = {};

		if (data) {
			data.forEach(city => {
				if (!citiesByState[city.state_abbr]) {
					citiesByState[city.state_abbr] = {
						stateAbbr: city.state_abbr,
						stateName: city.state_name,
						cities: []
					};
				}

				// Only add if we haven't reached 10 cities for this state
				if (citiesByState[city.state_abbr].cities.length < 10) {
					citiesByState[city.state_abbr].cities.push({
						name: city.search_city_name,
						population: city.population_2024,
						lat: city.latitude,
						lng: city.longitude
					});
				}
			});
		}

		// Convert to array and sort by state name
		const statesArray = Object.values(citiesByState).sort((a, b) =>
			a.stateName.localeCompare(b.stateName)
		);

		return {
			citiesByState: statesArray
		};
	} catch (err) {
		console.error('Error in load function:', err);
		return {
			citiesByState: []
		};
	}
}
