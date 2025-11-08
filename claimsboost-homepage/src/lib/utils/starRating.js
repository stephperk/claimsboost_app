/**
 * Utility functions for star rating calculations
 */

/**
 * Calculate fill percentages for each star based on a decimal rating
 * @param {number} rating - The rating value (e.g., 4.9)
 * @param {number} maxStars - Maximum number of stars (default: 5)
 * @returns {Array<number>} Array of fill percentages for each star (0-100)
 */
export function calculateStarFills(rating, maxStars = 5) {
	// Ensure rating is within bounds
	const boundedRating = Math.max(0, Math.min(rating, maxStars));

	// Calculate fill percentage for each star
	return Array.from({ length: maxStars }, (_, i) => {
		const starNumber = i + 1;
		if (boundedRating >= starNumber) {
			// Full star
			return 100;
		} else if (boundedRating > starNumber - 1) {
			// Partial star - calculate exact percentage
			return (boundedRating - (starNumber - 1)) * 100;
		} else {
			// Empty star
			return 0;
		}
	});
}

/**
 * Get star state information for custom rendering
 * @param {number} rating - The rating value
 * @param {number} maxStars - Maximum number of stars (default: 5)
 * @returns {Object} Object containing star counts and fill percentage
 */
export function getStarInfo(rating, maxStars = 5) {
	const boundedRating = Math.max(0, Math.min(rating, maxStars));
	const fullStars = Math.floor(boundedRating);
	const partialFill = (boundedRating % 1) * 100;
	const hasPartialStar = partialFill > 0;
	const emptyStars = maxStars - fullStars - (hasPartialStar ? 1 : 0);

	return {
		rating: boundedRating,
		fullStars,
		partialFill,
		hasPartialStar,
		emptyStars,
		stars: calculateStarFills(boundedRating, maxStars)
	};
}

/**
 * Format rating for display
 * @param {number} rating - The rating value
 * @param {number} precision - Number of decimal places (default: 1)
 * @returns {string} Formatted rating string
 */
export function formatRating(rating, precision = 1) {
	return rating.toFixed(precision);
}

/**
 * Get accessible text for screen readers
 * @param {number} rating - The rating value
 * @param {number} maxStars - Maximum number of stars
 * @returns {string} Accessible description
 */
export function getAccessibleRatingText(rating, maxStars = 5) {
	const formatted = formatRating(rating);
	return `${formatted} out of ${maxStars} stars`;
}

/**
 * Convert old renderStars format to new star fills
 * This is a migration helper for updating existing code
 * @param {number} rating - The rating value
 * @returns {Array<Object>} Array compatible with old renderStars return format
 */
export function renderStarsLegacy(rating) {
	const info = getStarInfo(rating);
	const stars = [];

	// Add full stars
	for (let i = 0; i < info.fullStars; i++) {
		stars.push({ type: 'full', char: '★', fill: 100 });
	}

	// Add partial star if needed
	if (info.hasPartialStar) {
		stars.push({ type: 'partial', char: '★', fill: info.partialFill });
	}

	// Add empty stars
	for (let i = 0; i < info.emptyStars; i++) {
		stars.push({ type: 'empty', char: '☆', fill: 0 });
	}

	return stars;
}