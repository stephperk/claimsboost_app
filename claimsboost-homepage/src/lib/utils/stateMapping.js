/**
 * Mapping of state abbreviations to full state names
 */
export const STATE_NAMES = {
	'AL': 'Alabama',
	'AK': 'Alaska',
	'AZ': 'Arizona',
	'AR': 'Arkansas',
	'CA': 'California',
	'CO': 'Colorado',
	'CT': 'Connecticut',
	'DE': 'Delaware',
	'FL': 'Florida',
	'GA': 'Georgia',
	'HI': 'Hawaii',
	'ID': 'Idaho',
	'IL': 'Illinois',
	'IN': 'Indiana',
	'IA': 'Iowa',
	'KS': 'Kansas',
	'KY': 'Kentucky',
	'LA': 'Louisiana',
	'ME': 'Maine',
	'MD': 'Maryland',
	'MA': 'Massachusetts',
	'MI': 'Michigan',
	'MN': 'Minnesota',
	'MS': 'Mississippi',
	'MO': 'Missouri',
	'MT': 'Montana',
	'NE': 'Nebraska',
	'NV': 'Nevada',
	'NH': 'New Hampshire',
	'NJ': 'New Jersey',
	'NM': 'New Mexico',
	'NY': 'New York',
	'NC': 'North Carolina',
	'ND': 'North Dakota',
	'OH': 'Ohio',
	'OK': 'Oklahoma',
	'OR': 'Oregon',
	'PA': 'Pennsylvania',
	'RI': 'Rhode Island',
	'SC': 'South Carolina',
	'SD': 'South Dakota',
	'TN': 'Tennessee',
	'TX': 'Texas',
	'UT': 'Utah',
	'VT': 'Vermont',
	'VA': 'Virginia',
	'WA': 'Washington',
	'WV': 'West Virginia',
	'WI': 'Wisconsin',
	'WY': 'Wyoming',
	'DC': 'District of Columbia'
};

/**
 * Reverse mapping: full state names to abbreviations
 */
export const STATE_ABBREVIATIONS = Object.entries(STATE_NAMES).reduce((acc, [abbr, name]) => {
	acc[name] = abbr;
	acc[name.toLowerCase()] = abbr;
	return acc;
}, {});

/**
 * Get state abbreviation from full name
 * @param {string} stateName - Full state name (e.g., 'Texas' or 'texas')
 * @returns {string|null} - State abbreviation (e.g., 'TX') or null if not found
 */
export function getStateAbbreviation(stateName) {
	if (!stateName) return null;

	// Check if it's already an abbreviation
	if (STATE_NAMES[stateName.toUpperCase()]) {
		return stateName.toUpperCase();
	}

	// Lookup by lowercase (STATE_ABBREVIATIONS has lowercase keys)
	return STATE_ABBREVIATIONS[stateName.toLowerCase()] || null;
}

/**
 * Get full state name from abbreviation
 * @param {string} stateAbbr - State abbreviation (e.g., 'TX')
 * @returns {string|null} - Full state name (e.g., 'Texas') or null if not found
 */
export function getStateName(stateAbbr) {
	if (!stateAbbr) return null;
	return STATE_NAMES[stateAbbr.toUpperCase()] || null;
}

/**
 * Convert state name to URL-friendly format (lowercase, hyphens)
 * @param {string} stateName - Full state name (e.g., 'North Carolina')
 * @returns {string} - URL-friendly name (e.g., 'north-carolina')
 */
export function stateNameToUrl(stateName) {
	return stateName.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Convert URL-friendly state name to proper format
 * @param {string} urlState - URL state name (e.g., 'north-carolina')
 * @returns {string} - Proper state name (e.g., 'North Carolina')
 */
export function urlToStateName(urlState) {
	return urlState
		.split('-')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Convert city name to URL-friendly format (lowercase, hyphens)
 * @param {string} cityName - City name (e.g., 'New York' or 'Lake Worth Corridor')
 * @returns {string} - URL-friendly name (e.g., 'new-york' or 'lake-worth-corridor')
 */
export function cityNameToUrl(cityName) {
	if (!cityName) return '';
	return cityName.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Convert URL-friendly city name to proper format
 * @param {string} urlCity - URL city name (e.g., 'new-york')
 * @returns {string} - Proper city name (e.g., 'New York')
 */
export function urlToCityName(urlCity) {
	return urlCity
		.split('-')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}
