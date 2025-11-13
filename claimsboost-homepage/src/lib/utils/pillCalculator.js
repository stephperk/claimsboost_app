/**
 * Utility for calculating visible pills in a container
 * This is a framework-agnostic utility that can be tested independently
 */

/**
 * Configuration for pill calculation
 * @typedef {Object} PillCalculatorConfig
 * @property {number} gap - Gap between pills in pixels
 * @property {number} minVisiblePills - Minimum number of pills to show
 * @property {string} pillClassName - CSS class name for pill elements
 * @property {string} moreButtonClassName - CSS class name for "see more" button
 * @property {number} safetyBuffer - Additional safety buffer for edge cases
 */

/**
 * Result of pill calculation
 * @typedef {Object} PillCalculationResult
 * @property {number} visibleCount - Number of pills that should be visible
 * @property {number} hiddenCount - Number of pills that will be hidden
 * @property {boolean} showMoreButton - Whether to show the "see more" button
 * @property {number} totalWidth - Total width used by visible pills and more button
 */

/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
	gap: 8,
	minVisiblePills: 1,
	pillClassName: 'practice-tag',
	moreButtonClassName: 'more-pill',
	safetyBuffer: 4 // Small buffer for subpixel rendering
};

/**
 * Cache for button widths to avoid repeated DOM measurements
 */
const buttonWidthCache = new Map();

/**
 * Measures the actual width of a "see more" button
 * @param {number} hiddenCount - Number of hidden pills
 * @param {HTMLElement} container - Container element for styling context
 * @param {string} className - CSS class name for the button
 * @returns {number} Actual width of the button in pixels
 */
export function measureSeeMoreButton(hiddenCount, container, className = 'practice-tag more-pill') {
	// Clone an existing pill to get all the scoped CSS classes
	const existingPill = container.querySelector('.practice-tag:not(.measuring):not(.more-pill)');
	let tempButton;
	let actualClassName;

	if (existingPill) {
		// Clone the existing pill to preserve all classes (including Svelte scoped classes)
		tempButton = existingPill.cloneNode(false);
		tempButton.className = existingPill.className + ' more-pill';
		actualClassName = tempButton.className;
	} else {
		// Fallback to creating a new button if no pills exist yet
		tempButton = document.createElement('button');
		tempButton.className = className;
		actualClassName = className;
	}

	// Use actual class name in cache key to account for scoped CSS
	const cacheKey = `${actualClassName}_${hiddenCount}`;

	// Check cache first
	if (buttonWidthCache.has(cacheKey)) {
		return buttonWidthCache.get(cacheKey);
	}

	tempButton.textContent = `+${hiddenCount} more`;
	tempButton.style.position = 'absolute';
	tempButton.style.visibility = 'hidden';
	tempButton.style.whiteSpace = 'nowrap';

	container.appendChild(tempButton);
	const buttonWidth = tempButton.getBoundingClientRect().width;
	container.removeChild(tempButton);

	const width = Math.ceil(buttonWidth); // Round up to avoid subpixel issues
	buttonWidthCache.set(cacheKey, width);

	return width;
}

/**
 * Gets all pill elements from a container
 * @param {HTMLElement} container - Container element
 * @param {string} pillClassName - CSS class name for pills
 * @returns {HTMLElement[]} Array of pill elements
 */
export function getPillElements(container, pillClassName = 'practice-tag') {
	return Array.from(container.children).filter(el =>
		el.classList.contains(pillClassName) &&
		!el.classList.contains('more-pill')
		// Include measuring pills - they ARE the pills being measured!
	);
}

/**
 * Calculates how many pills can fit in a container
 * @param {HTMLElement} container - Container element
 * @param {PillCalculatorConfig} config - Configuration options
 * @returns {PillCalculationResult} Calculation result
 */
export function calculateVisiblePills(container, config = {}) {
	const cfg = { ...DEFAULT_CONFIG, ...config };

	// Get container width and subtract padding and safety buffer
	const containerWidth = container.getBoundingClientRect().width;
	const computedStyle = window.getComputedStyle(container);
	const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
	const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
	const availableWidth = containerWidth - paddingLeft - paddingRight - cfg.safetyBuffer;

	// Debug logging
	console.log('Container calc:', {
		containerWidth,
		paddingLeft,
		paddingRight,
		availableWidth
	});

	// Get all pill elements
	const pills = getPillElements(container, cfg.pillClassName);

	// Handle edge cases
	if (!pills.length) {
		return {
			visibleCount: 0,
			hiddenCount: 0,
			showMoreButton: false,
			totalWidth: 0
		};
	}

	if (pills.length === 1) {
		return {
			visibleCount: 1,
			hiddenCount: 0,
			showMoreButton: false,
			totalWidth: pills[0].getBoundingClientRect().width
		};
	}

	// Calculate pill widths
	const pillWidths = pills.map(pill => Math.ceil(pill.getBoundingClientRect().width));

	console.log('Pill widths:', pillWidths);

	// Try to fit pills from left to right
	let currentWidth = 0;
	let visibleCount = 0;

	for (let i = 0; i < pillWidths.length; i++) {
		const pillWidth = pillWidths[i];
		const gapWidth = visibleCount > 0 ? cfg.gap : 0;
		const tempWidth = currentWidth + gapWidth + pillWidth;

		// Check if this is the last pill
		if (i === pillWidths.length - 1) {
			// Last pill - just check if it fits
			if (tempWidth <= availableWidth) {
				visibleCount++;
				currentWidth = tempWidth;
			}
			break;
		}

		// Not the last pill - check if we need a "see more" button
		const remainingPills = pillWidths.length - i - 1;
		const seeMoreWidth = measureSeeMoreButton(
			remainingPills,
			container,
			cfg.moreButtonClassName
		);

		// Check if current pill + gap + see more button fits
		if (tempWidth + cfg.gap + seeMoreWidth <= availableWidth) {
			// This pill fits with room for "see more" button
			visibleCount++;
			currentWidth = tempWidth;
		} else {
			// Can't fit this pill and the "see more" button
			break;
		}
	}

	// Ensure minimum visible pills
	if (visibleCount < cfg.minVisiblePills && pills.length >= cfg.minVisiblePills) {
		visibleCount = cfg.minVisiblePills;
	}

	const hiddenCount = pills.length - visibleCount;
	const showMoreButton = hiddenCount > 0;

	// Calculate total width including "see more" button if needed
	let totalWidth = currentWidth;
	if (showMoreButton) {
		const seeMoreWidth = measureSeeMoreButton(
			hiddenCount,
			container,
			cfg.moreButtonClassName
		);
		totalWidth += cfg.gap + seeMoreWidth;
	}

	console.log('Final calc:', {
		visibleCount,
		hiddenCount,
		currentWidth,
		totalWidth,
		availableWidth,
		overflow: totalWidth > availableWidth ? 'YES - PROBLEM!' : 'no'
	});

	return {
		visibleCount,
		hiddenCount,
		showMoreButton,
		totalWidth
	};
}

/**
 * Creates a debounced version of the calculateVisiblePills function
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} Debounced calculation function
 */
export function createDebouncedCalculator(delay = 100) {
	let timeoutId;

	return (container, config, callback) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			const result = calculateVisiblePills(container, config);
			if (callback) callback(result);
		}, delay);
	};
}

/**
 * Sets up automatic recalculation on container resize
 * @param {HTMLElement} container - Container to observe
 * @param {PillCalculatorConfig} config - Configuration
 * @param {Function} callback - Callback function to call with results
 * @returns {Function} Cleanup function
 */
export function setupAutoRecalculation(container, config, callback) {
	const debouncedCalculator = createDebouncedCalculator(100);

	// Initial calculation
	callback(calculateVisiblePills(container, config));

	// Setup ResizeObserver
	const resizeObserver = new ResizeObserver(() => {
		debouncedCalculator(container, config, callback);
	});

	resizeObserver.observe(container);

	// Return cleanup function
	return () => {
		resizeObserver.disconnect();
	};
}

/**
 * Clears the button width cache
 * Useful when styles change or to free memory
 */
export function clearButtonWidthCache() {
	buttonWidthCache.clear();
}