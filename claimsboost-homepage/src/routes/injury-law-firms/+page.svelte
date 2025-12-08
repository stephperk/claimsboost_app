<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import SearchBarV2 from '$lib/components/SearchBarV2.svelte';
	import StarRating from '$lib/components/StarRating.svelte';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { location } from '$lib/stores/locationStore.js';
	import { searchLocation } from '$lib/stores/searchLocationStore.js';
	import { geocodeLocation } from '$lib/utils/geocoding.js';
	import { getStateName, stateNameToUrl, cityNameToUrl } from '$lib/utils/stateMapping.js';
	import * as PillCalculator from '$lib/utils/pillCalculator.js';

	let sortBy = $state('relevance');
	let showFilters = $state(false);

	// Search states - initialize searchQuery from URL param if present
	let searchQuery = $state(browser ? ($page.url.searchParams.get('practice_area') || '') : '');
	let locationValue = $state('');
	let displayedLocation = $state({ city: null, state: null });

	// Set location input from search location store or fallback to user location
	// Track if user has manually cleared the location
	let hasManuallyCleared = $state(false);
	let isUserEditing = $state(false);
	let isPracticeAreaEditing = $state(false);
	let initialLoadComplete = $state(false);
	// Guard flags to prevent race conditions during async operations
	let isClearing = $state(false);
	let isSearching = $state(false);

	// Only set location on initial page load
	$effect(() => {
		if (!initialLoadComplete && !isUserEditing && !hasManuallyCleared) {
			if ($searchLocation.city && $searchLocation.state) {
				// Use search location if exists
				locationValue = $searchLocation.zipCode || `${$searchLocation.city}, ${$searchLocation.state}`;
				initialLoadComplete = true;
			} else if ($location.city && $location.state) {
				// Fallback to user location
				locationValue = `${$location.city}, ${$location.state}`;
				initialLoadComplete = true;
			}
		}
	});

	// Sync locationValue with searchLocation store changes (for header navigation while on page)
	$effect(() => {
		// isSearching prevents this effect from interfering during search operations
		// isClearing prevents this effect from repopulating during clear operations
		if (isSearching) return;
		if (initialLoadComplete && !isUserEditing && !hasManuallyCleared && !isClearing && $searchLocation.city && $searchLocation.state) {
			const newLocation = $searchLocation.zipCode || `${$searchLocation.city}, ${$searchLocation.state}`;
			if (newLocation !== locationValue) {
				locationValue = newLocation;
			}
		}
	});

	// Filter states
	let selectedPracticeAreas = $state([]);
	let selectedRating = $state(0);
	let selectedExperience = $state('all');

	// Dropdown states
	let showPracticeAreaDropdown = $state(false);
	let showRatingDropdown = $state(false);
	let showSortDropdown = $state(false);

	// Practice area expansion states
	let expandedFirms = $state(new Set());
	let visiblePillCounts = $state({});
	let practiceAreaRefs = $state({});
	let pillsReady = $state({});
	let cardsReady = $state({}); // Track when entire card is ready to display
	let pillOrderHashes = $state({}); // Track pill order to detect changes
	let pillCalculationCache = $state({}); // Cache calculations by firm ID and order hash

	// Close dropdowns when clicking outside
	function handleClickOutside(event) {
		const target = event.target;
		if (!target.closest('.filter-dropdown-container') && !target.closest('.sort-dropdown-container')) {
			showPracticeAreaDropdown = false;
			showRatingDropdown = false;
			showSortDropdown = false;
		}
	}

	// Watch for URL parameter changes (e.g., when selecting from dropdown while already on page)
	$effect(() => {
		// Only run in browser
		if (!browser) return;
		// isSearching prevents this effect from interfering with active searches
		if (isSearching) return;

		const urlLocation = $page.url.searchParams.get('location');
		const urlPracticeArea = $page.url.searchParams.get('practice_area');

		// Handle practice_area param - set search query if different (but not while user is editing)
		if (urlPracticeArea && urlPracticeArea !== searchQuery && !isPracticeAreaEditing) {
			searchQuery = urlPracticeArea;
		}

		// Check if URL has location parameter and it's different from current search location
		// Skip if user has manually cleared the location field, UNLESS the store already has
		// coordinates (e.g., from header navigation which pre-populates the store)
		if (urlLocation && (!hasManuallyCleared || ($searchLocation.latitude && $searchLocation.longitude))) {
			const currentLocation = $searchLocation.city && $searchLocation.state
				? `${$searchLocation.city}, ${$searchLocation.state}`
				: null;

			// Process if:
			// 1. Location is different from current (normal case), OR
			// 2. hasManuallyCleared is true AND store has coordinates AND urlLocation matches currentLocation
			//    This is the header navigation case: header set store before goto(), so they match
			const needsSearchAfterClear = hasManuallyCleared &&
				$searchLocation.latitude &&
				$searchLocation.longitude &&
				urlLocation === currentLocation;
			if (urlLocation !== currentLocation || needsSearchAfterClear) {
				// Use queueMicrotask to let any pending clear events propagate first
				queueMicrotask(() => {
					// Re-check hasManuallyCleared after microtask - user may have clicked clear
					// BUT allow if store has coordinates (header navigation pre-populates the store)
					if (hasManuallyCleared && !($searchLocation.latitude && $searchLocation.longitude)) {
						return;
					}

					// Sync the location input field with the new URL location
					locationValue = urlLocation;

					// If we already have coordinates in searchLocation, don't geocode again
					if ($searchLocation.latitude && $searchLocation.longitude) {
						// Coordinates already set (e.g., from header navigation with pre-geocoded data)
						// Reset hasManuallyCleared since user has now selected a new location
						hasManuallyCleared = false;
						hasPerformedInitialSearch = true;
						performSearch();
					} else {
						// No coordinates yet - need to geocode
						const processLocationChange = async () => {
							// Check every 100ms for up to 5 seconds
							let attempts = 0;
							const maxAttempts = 50;

							while (!window.google?.maps && attempts < maxAttempts) {
								await new Promise(resolve => setTimeout(resolve, 100));
								attempts++;
							}

							// Re-check hasManuallyCleared after async wait - user may have cleared during this time
							if (hasManuallyCleared) {
								return;
							}

							if (window.google?.maps) {
								// Now geocode the location from URL
								const geocoded = await geocodeLocation(urlLocation);

								// Check again after geocoding
								if (hasManuallyCleared) {
									return;
								}

								if (geocoded) {
									searchLocation.setSearchLocation(geocoded);
									// Reset hasManuallyCleared since user has now navigated to a new location
									hasManuallyCleared = false;
									// Trigger a new search with the geocoded location
									hasPerformedInitialSearch = true;
									performSearch();
								}
							} else {
								console.error('Google Maps failed to load after 5 seconds');
							}
						};

						processLocationChange();
					}
				});
			}
		}
	});

	// Initialize on mount - handle event listeners
	onMount(() => {
		// Add click outside listener
		document.addEventListener('click', handleClickOutside);

		// Cleanup
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	// Update URL query params to reflect current search
	function updateUrlParams() {
		if (!browser) return;
		const url = new URL(window.location.href);
		if (locationValue && locationValue.trim()) {
			url.searchParams.set('location', locationValue.trim());
		} else {
			url.searchParams.delete('location');
		}
		if (searchQuery && searchQuery.trim()) {
			url.searchParams.set('practice_area', searchQuery.trim());
		} else {
			url.searchParams.delete('practice_area');
		}
		window.history.replaceState({}, '', url);
	}

	async function handleSearch(event) {
		const { practiceArea, location: searchLocationText, locationData } = event.detail;
		console.log('Searching for:', practiceArea, 'in', searchLocationText);

		// Set isSearching FIRST to prevent Effect 2 (URL sync) from interfering
		isSearching = true;

		// Update local state
		searchQuery = practiceArea;

		// Reset editing flag (but NOT hasManuallyCleared yet - wait until geocoding succeeds
		// to prevent URL param effect from overwriting the location field)
		isUserEditing = false;

		// Check if locationData from autocomplete selection has coordinates
		// This means user selected from autocomplete and we have pre-geocoded data
		const hasAutocompleteCoords = locationData?.latitude && locationData?.longitude &&
			locationData !== $searchLocation; // Ensure it's new data, not existing store value

		if (hasAutocompleteCoords) {
			// Use pre-geocoded data from autocomplete selection
			console.log('Using autocomplete location data:', locationData);
			searchLocation.setSearchLocation(locationData);
			hasManuallyCleared = false;
			updateUrlParams();
			performSearch();
			queueMicrotask(() => { isSearching = false; });
			return;
		}

		// Check if we need to geocode
		// Geocode if: no coordinates, OR location text doesn't match stored location
		const locationChanged = locationValue && locationValue.trim() && (
			!$searchLocation.city ||
			locationValue !== ($searchLocation.zipCode || `${$searchLocation.city}, ${$searchLocation.state}`)
		);

		// If we have coordinates AND location hasn't changed AND location is not empty, just search
		// The empty check prevents resetting hasManuallyCleared when user cleared the input
		if (($searchLocation.latitude || $location.latitude) && !locationChanged && locationValue && locationValue.trim()) {
			hasManuallyCleared = false;
			updateUrlParams();
			performSearch();
			// Reset isSearching after store updates propagate
			queueMicrotask(() => { isSearching = false; });
			return;
		}

		// If no coordinates or location changed, try geocoding
		if (locationValue && locationValue.trim()) {
			console.log('Attempting to geocode:', locationValue);
			const geocodedLocation = await geocodeLocation(locationValue);

			if (geocodedLocation) {
				// Check if geocoding returned valid location name data
				if (!geocodedLocation.city && !geocodedLocation.state) {
					// Geocoding returned coordinates but no valid location name
					// Treat as "no results" with a helpful message
					lawFirms = [];
					error = `We couldn't find a valid location for "${locationValue}". Please enter a valid US city or ZIP code.`;
					pageState = SearchState.NO_RESULTS;
					queueMicrotask(() => { isSearching = false; });
					return;
				}
				// Successfully geocoded - update search location store
				console.log('Geocoding successful:', geocodedLocation);
				searchLocation.setSearchLocation(geocodedLocation);
				// Now safe to reset hasManuallyCleared since store has the new location
				hasManuallyCleared = false;
				// Update URL params and trigger search with the new coordinates
				updateUrlParams();
				performSearch();
			} else {
				// Geocoding failed completely - treat as "no results" with helpful message
				lawFirms = [];
				error = 'Unable to find that location. Please enter a valid US city or ZIP code.';
				pageState = SearchState.NO_RESULTS;
			}
			// Reset isSearching after store updates propagate
			queueMicrotask(() => { isSearching = false; });
		} else {
			// No location provided at all
			error = 'Please enter a city or ZIP code.';
			pageState = SearchState.ERROR;
			// Reset isSearching after store updates propagate
			queueMicrotask(() => { isSearching = false; });
		}
	}

	function handleLocationClear() {
		// Set isClearing FIRST to prevent effects from repopulating during clear
		isClearing = true;
		hasManuallyCleared = true;
		isUserEditing = false;
		// Clear the search location store FIRST to prevent effects from seeing old store values
		searchLocation.clearSearchLocation();
		// Then clear the local value
		locationValue = '';
		// Reset isClearing after store update propagates (use setTimeout to ensure all effects have run)
		setTimeout(() => {
			isClearing = false;
		}, 0);
	}

	const practiceAreaOptions = [
		'Auto Accidents',
		'Workplace Injury',
		'Slip & Fall',
		'Medical Malpractice',
		'Product Liability',
		'Dog Bites',
		'Wrongful Death',
		'Brain Injury'
	];

	// State machine for search page
	const SearchState = {
		WAITING_FOR_LOCATION: 'waiting_for_location',
		SEARCHING: 'searching',
		TRANSITIONING: 'transitioning',
		READY: 'ready',
		ERROR: 'error',
		NO_RESULTS: 'no_results'
	};

	// Single source of truth for page state
	let pageState = $state(SearchState.WAITING_FOR_LOCATION);
	let hasPerformedInitialSearch = $state(false);

	// API data states
	let lawFirms = $state([]);
	let error = $state(null);
	let totalCount = $state(0);
	let radiusUsed = $state(50);

	// Derived states for template readability
	let showSkeletons = $derived(
		pageState === SearchState.WAITING_FOR_LOCATION ||
		pageState === SearchState.SEARCHING ||
		pageState === SearchState.TRANSITIONING
	);

	let loading = $derived(
		pageState === SearchState.SEARCHING
	);

	// Transform database firm to UI format
	function transformFirm(dbFirm) {
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
				amountCollected = `$${billions}B+ Recovered`;
			} else if (dbFirm.total_recovered >= 1_000_000) {
				// Millions
				const millions = Math.floor(dbFirm.total_recovered / 1_000_000);
				amountCollected = `$${millions}M+ Recovered`;
			}
		}

		// Get URL-friendly city name
		const cityUrl = cityNameToUrl(dbFirm.city);

		// Extract and reorder practice areas by semantic similarity
		let practiceAreas = (dbFirm.practice_areas && dbFirm.practice_areas.length > 0)
			? dbFirm.practice_areas
			: ['Personal Injury'];

		// Reorder by semantic similarity (if available)
		if (dbFirm.practice_area_scores && Object.keys(dbFirm.practice_area_scores).length > 0) {
			practiceAreas = practiceAreas.sort((a, b) => {
				const scoreA = dbFirm.practice_area_scores[a] || 0;
				const scoreB = dbFirm.practice_area_scores[b] || 0;
				return scoreB - scoreA; // Highest similarity first
			});
		}

		return {
			id: dbFirm.place_id,
			name: dbFirm.display_name || dbFirm.firm_name || dbFirm.name,
			slug: dbFirm.slug,
			address: dbFirm.address,
			city: dbFirm.city,
			state: dbFirm.state,
			cityUrl: cityUrl,
		stateUrl: dbFirm.state.toLowerCase(),
			distance: `${dbFirm.distance_miles.toFixed(1)} miles`,
			description: dbFirm.short_description || 'Personal injury law firm dedicated to fighting for your rights.',
			practiceAreas: practiceAreas,
			practiceAreaScores: dbFirm.practice_area_scores || {},
			rating: dbFirm.rating || 0,
			reviews: dbFirm.review_count || 0,
			phone: dbFirm.phone,
			website: dbFirm.website,
			isOpen: true,
			isVerified: dbFirm.is_personal_injury_firm || false,
			yearsExperience: yearsExperience,
			casesWon: dbFirm.cases_won,
			amountCollected: amountCollected,
			clientsServed: dbFirm.clients_served,
			shortFacts: dbFirm.short_facts || [],
			longFacts: dbFirm.long_facts || [],
			featured: false
		};
	}

	// Perform search with current filters
	async function performSearch() {
		// Capture the location we're searching for (for headline display)
		displayedLocation = {
			city: $searchLocation.city || $location.city,
			state: $searchLocation.state || $location.state
		};

		// Get coordinates from search location or fallback to user location
		const lat = $searchLocation.latitude || $location.latitude;
		const lng = $searchLocation.longitude || $location.longitude;

		// If no location available, show error
		if (!lat || !lng) {
			error = 'Location not available. Please enter a city or ZIP code.';
			lawFirms = [];
			pageState = SearchState.ERROR;
			return;
		}

		pageState = SearchState.SEARCHING;
		cardsReady = {}; // Reset cards ready state
		pillsReady = {}; // Reset pills ready state for recalculation
		visiblePillCounts = {}; // Reset pill counts for new firms
		pillOrderHashes = {}; // Reset pill order hashes
		// Keep pillCalculationCache as it can be reused if same order appears
		error = null;

		// Track when search started for minimum skeleton display time
		const searchStartTime = Date.now();

		try {
			const params = new URLSearchParams({
				lat: lat.toString(),
				lng: lng.toString(),
				radius: '50',
				sort_by: sortBy,
				limit: '50',
				practice_area_query: searchQuery || '' // Natural language query for semantic search
			});

			// Add filters
			if (selectedPracticeAreas.length > 0) {
				params.append('practice_areas', selectedPracticeAreas.join(','));
			}
			if (selectedRating > 0) {
				params.append('min_rating', selectedRating.toString());
			}

			const response = await fetch(`/api/law-firms/search-semantic?${params}`);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to search law firms');
			}

			// Transform firms from database format to UI format
			lawFirms = data.firms.map(transformFirm);
			totalCount = data.total_count;
			radiusUsed = data.radius_used;
			error = null;

			// Ensure minimum skeleton display time for better UX
			const elapsed = Date.now() - searchStartTime;
			const minDisplayTime = 500; // Show skeletons for at least 500ms
			const remainingTime = Math.max(0, minDisplayTime - elapsed);

			// Delay state transition if search was too fast
			setTimeout(() => {
				// Set state based on results
				if (lawFirms.length > 0) {
					pageState = SearchState.TRANSITIONING;
				} else {
					pageState = SearchState.NO_RESULTS;
				}
			}, remainingTime);
		} catch (err) {
			console.error('Search error:', err);
			error = err.message;
			lawFirms = [];
			pageState = SearchState.ERROR;
		}
	}

	// Unified initialization and location tracking
	let locationTimeoutId = null;

	$effect(() => {
		// Track location availability
		const hasSearchLoc = $searchLocation.hasLocation;
		const hasUserLoc = $location.hasLocation;
		const lat = $searchLocation.latitude || $location.latitude;
		const lng = $searchLocation.longitude || $location.longitude;

		// Clear any existing timeout
		if (locationTimeoutId) {
			clearTimeout(locationTimeoutId);
			locationTimeoutId = null;
		}

		// Handle location-based initialization
		if (!hasPerformedInitialSearch) {
			if (lat && lng) {
				// Location is available - perform initial search
				hasPerformedInitialSearch = true;
				performSearch();
			} else if (pageState === SearchState.WAITING_FOR_LOCATION) {
				// Still waiting for location - set timeout for error
				locationTimeoutId = setTimeout(() => {
					if (!hasPerformedInitialSearch && pageState === SearchState.WAITING_FOR_LOCATION) {
						error = 'Unable to determine your location. Please enter a city or ZIP code.';
						pageState = SearchState.ERROR;
					}
				}, 2000);
			}
		}

		// Cleanup timeout on unmount
		return () => {
			if (locationTimeoutId) {
				clearTimeout(locationTimeoutId);
			}
		};
	});

	// Re-search when filters or sort change (with debounce)
	let filterSearchTimeout = null;
	let filterEffectInitialized = false;
	let lastFilterState = { practiceAreas: [], rating: 0, sortBy: 'relevance' };

	$effect(() => {
		// Track filter/sort changes
		const _practiceAreas = selectedPracticeAreas;
		const _rating = selectedRating;
		const _sortBy = sortBy;

		// Skip the first run to avoid triggering on mount
		if (!filterEffectInitialized) {
			filterEffectInitialized = true;
			lastFilterState = {
				practiceAreas: [..._practiceAreas],
				rating: _rating,
				sortBy: _sortBy
			};
			return;
		}

		// Check if filters actually changed
		const filtersChanged =
			JSON.stringify(lastFilterState.practiceAreas) !== JSON.stringify(_practiceAreas) ||
			lastFilterState.rating !== _rating ||
			lastFilterState.sortBy !== _sortBy;

		// Only trigger search if filters changed and we're in a searchable state
		if (filtersChanged && hasPerformedInitialSearch &&
			(pageState === SearchState.READY ||
			 pageState === SearchState.NO_RESULTS)) {

			// Update last filter state
			lastFilterState = {
				practiceAreas: [..._practiceAreas],
				rating: _rating,
				sortBy: _sortBy
			};

			// Clear existing timeout
			if (filterSearchTimeout) {
				clearTimeout(filterSearchTimeout);
			}

			// Debounce the search
			filterSearchTimeout = setTimeout(() => {
				performSearch();
			}, 300);
		}

		// Cleanup
		return () => {
			if (filterSearchTimeout) {
				clearTimeout(filterSearchTimeout);
			}
		};
	});

	// Star rating rendering is now handled by the StarRating component
	// Old renderStars function removed - see StarRating.svelte for implementation

	function togglePracticeArea(area) {
		if (selectedPracticeAreas.includes(area)) {
			selectedPracticeAreas = selectedPracticeAreas.filter(a => a !== area);
		} else {
			selectedPracticeAreas = [...selectedPracticeAreas, area];
		}
	}

	function clearFilters() {
		selectedPracticeAreas = [];
		selectedRating = 0;
		selectedExperience = 'all';
	}

	// Generate a hash for pill order to detect when pills have been reordered
	function getPillOrderHash(practiceAreas) {
		return practiceAreas.join('|');
	}

	function toggleFirmExpansion(firmId) {
		if (expandedFirms.has(firmId)) {
			expandedFirms.delete(firmId);
		} else {
			expandedFirms.add(firmId);
		}
		expandedFirms = new Set(expandedFirms);

		// No recalculation needed - use cached values
		// If we don't have a value yet, the IntersectionObserver will handle it
	}

	function calculateVisiblePills(firmId, containerRef, practiceAreas) {
		if (!containerRef || !practiceAreas || practiceAreas.length === 0) {
			// No calculation possible without container and areas
			return;
		}

		// Generate hash for current pill order
		const orderHash = getPillOrderHash(practiceAreas);
		const cacheKey = `${firmId}_${orderHash}`;

		// Check if we have a cached calculation for this exact order
		if (pillCalculationCache[cacheKey]) {
			visiblePillCounts = { ...visiblePillCounts, [firmId]: pillCalculationCache[cacheKey] };
			pillsReady = { ...pillsReady, [firmId]: true };
			pillOrderHashes = { ...pillOrderHashes, [firmId]: orderHash };
			return;
		}

		// Use the new PillCalculator utility with more conservative settings
		const result = PillCalculator.calculateVisiblePills(containerRef, {
			gap: 8,
			minVisiblePills: 1,
			pillClassName: 'practice-tag',
			moreButtonClassName: 'practice-tag more-pill',
			safetyBuffer: 100 // Increased buffer to prevent cutoff from rounding errors
		});

		// Cache the result
		pillCalculationCache = { ...pillCalculationCache, [cacheKey]: result.visibleCount };
		visiblePillCounts = { ...visiblePillCounts, [firmId]: result.visibleCount };
		pillsReady = { ...pillsReady, [firmId]: true };
		pillOrderHashes = { ...pillOrderHashes, [firmId]: orderHash };
	}

	function recalculateAllPills() {
		// Only recalculate for firms whose pill order has changed
		lawFirms.forEach(firm => {
			const containerRef = practiceAreaRefs[firm.id];
			const newOrderHash = getPillOrderHash(firm.practiceAreas);
			const hasOrderChanged = pillOrderHashes[firm.id] !== newOrderHash;

			if (containerRef && (hasOrderChanged || !pillsReady[firm.id])) {
				calculateVisiblePills(firm.id, containerRef, firm.practiceAreas);
			}
		});
	}

	// Add resize observer to recalculate pills on container size change
	$effect(() => {
		if (lawFirms.length > 0 && pageState === SearchState.READY) {
			let resizeTimeout;
			const resizeObserver = new ResizeObserver(() => {
				clearTimeout(resizeTimeout);
				resizeTimeout = setTimeout(() => {
					recalculateAllPills();
				}, 100);
			});

			// Observe all practice area containers
			lawFirms.forEach(firm => {
				const containerRef = practiceAreaRefs[firm.id];
				if (containerRef) {
					resizeObserver.observe(containerRef);
				}
			});

			// Cleanup
			return () => {
				resizeObserver.disconnect();
				clearTimeout(resizeTimeout);
			};
		}
	});

	// Calculate pills as soon as containers are available
	$effect(() => {
		if (browser && lawFirms.length > 0) {
			// Clear button width cache to ensure fresh measurements with current styles
			PillCalculator.clearButtonWidthCache();

			// Wait for measurement pills to be in DOM before calculating
			requestAnimationFrame(() => {
				// Double RAF ensures measuring pills have been painted
				requestAnimationFrame(() => {
					lawFirms.forEach(firm => {
						const containerRef = practiceAreaRefs[firm.id];
						if (containerRef && visiblePillCounts[firm.id] === undefined) {
							// Calculate after measuring pills are fully rendered
							calculateVisiblePills(firm.id, containerRef, firm.practiceAreas);
						}
					});
				});
			});

			// Also set up IntersectionObserver for recalculation on visibility changes
			const visibilityObserver = new IntersectionObserver(
				(entries) => {
					entries.forEach(entry => {
						if (entry.isIntersecting) {
							// Find the firm ID from the element
							const firmId = entry.target.getAttribute('data-firm-id');
							const firm = lawFirms.find(f => f.id === firmId);
							if (firmId && firm) {
								const newOrderHash = getPillOrderHash(firm.practiceAreas);
								const hasOrderChanged = pillOrderHashes[firmId] !== newOrderHash;

								// Recalculate if order has changed
								if (hasOrderChanged && visiblePillCounts[firmId] !== undefined) {
									requestAnimationFrame(() => {
										calculateVisiblePills(firmId, entry.target, firm.practiceAreas);
									});
								}
							}
						}
					});
				},
				{
					threshold: 0.1, // Trigger when 10% visible
					rootMargin: '100px' // Start calculating slightly before visible
				}
			);

			// Observe all practice area containers
			lawFirms.forEach(firm => {
				const containerRef = practiceAreaRefs[firm.id];
				if (containerRef) {
					// Add data attribute for identification
					containerRef.setAttribute('data-firm-id', firm.id);
					visibilityObserver.observe(containerRef);
				}
			});

			// Cleanup
			return () => {
				visibilityObserver.disconnect();
			};
		}
	});

	// Simplified card animation logic
	$effect(() => {
		if (pageState === SearchState.TRANSITIONING && lawFirms.length > 0) {
			// Single RAF for paint timing
			requestAnimationFrame(() => {
				// Batch update all cards at once
				const newCardsReady = {};
				const maxAnimatedCards = 20; // Limit animations for performance

				lawFirms.forEach((firm, index) => {
					// Only animate first N cards, show rest immediately
					if (index < maxAnimatedCards) {
						newCardsReady[firm.id] = true;
					} else {
						// For cards beyond limit, show immediately without animation
						newCardsReady[firm.id] = 'immediate';
					}
				});

				cardsReady = newCardsReady;

				// Complete transition to ready state after animation starts
				const transitionDelay = Math.min(lawFirms.length * 50 + 100, 1100);
				setTimeout(() => {
					pageState = SearchState.READY;
				}, transitionDelay);
			});
		}
	});</script>

<svelte:head>
	<title>Find Personal Injury Lawyers in {$searchLocation.city || $location.city || 'Your Area'}, {$searchLocation.state || $location.state || 'USA'} | ClaimsBoost</title>
	<meta name="description" content="Browse top-rated personal injury lawyers in {$searchLocation.city || $location.city || 'your area'}, {$searchLocation.state || $location.state || 'USA'}. Compare reviews, practice areas, and experience to find the right attorney for your case." />
</svelte:head>

<div class="page">
	<Header />

	<main class="search-results">
		<div class="container">
			<!-- Page Header -->
			<div class="page-header">
				<h1>Personal injury law firms {#if displayedLocation.city}near <span class="location-highlight">{displayedLocation.city}, {displayedLocation.state}</span>{/if}</h1>
				<p class="subtitle">{lawFirms.length} law firms ready to help with your case</p>
			</div>

			<!-- Search Bar V2 -->
			<div class="search-form">
				<SearchBarV2
					bind:practiceAreaValue={searchQuery}
					bind:locationValue={locationValue}
					practiceAreaPlaceholder="How were you injured?"
					locationPlaceholder="City, State or ZIP"
					buttonText="Search"
					autofocusPracticeArea={true}
					on:search={handleSearch}
					on:clear={handleLocationClear}
					on:locationFocus={() => isUserEditing = true}
					on:locationBlur={() => isUserEditing = false}
					on:locationInput={(e) => {
						isUserEditing = true;
						// Update locationValue from event detail to ensure it's in sync
						const inputValue = e.detail?.value ?? '';
						locationValue = inputValue;
						// If user clears input via backspace, treat it like a manual clear
						if (!inputValue.trim()) {
							hasManuallyCleared = true;
						}
					}}
				on:practiceAreaFocus={() => isPracticeAreaEditing = true}
				on:practiceAreaBlur={() => isPracticeAreaEditing = false}
				on:practiceAreaInput={() => isPracticeAreaEditing = true}
				/>
			</div>

			<!-- Minimal Filter/Sort Bar -->
			<div class="filter-sort-bar">
				<div class="filter-chips">
					<div class="filter-dropdown-container">
						<button
							class="chip"
							class:active={selectedPracticeAreas.length > 0}
							onclick={() => showPracticeAreaDropdown = !showPracticeAreaDropdown}
						>
							Practice Areas {#if selectedPracticeAreas.length > 0}({selectedPracticeAreas.length}){/if}
							<svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5">
								<path d="M1 1L5 5L9 1" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button>

						{#if showPracticeAreaDropdown}
							<div class="dropdown-menu">
								{#each practiceAreaOptions as area}
									<label class="dropdown-item">
										<input
											type="checkbox"
											checked={selectedPracticeAreas.includes(area)}
											onchange={() => togglePracticeArea(area)}
										/>
										<span>{area}</span>
									</label>
								{/each}
							</div>
						{/if}
					</div>

					<div class="filter-dropdown-container">
						<button
							class="chip"
							class:active={selectedRating > 0}
							onclick={() => showRatingDropdown = !showRatingDropdown}
						>
							Rating {#if selectedRating > 0}({selectedRating}+){/if}
							<svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5">
								<path d="M1 1L5 5L9 1" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button>

						{#if showRatingDropdown}
							<div class="dropdown-menu">
								<button class="dropdown-item" onclick={() => { selectedRating = 4.5; showRatingDropdown = false; }}>
									<StarRating rating={4.5} size={18} />
									<span>4.5+ Stars</span>
								</button>
								<button class="dropdown-item" onclick={() => { selectedRating = 4.0; showRatingDropdown = false; }}>
									<StarRating rating={4.0} size={18} />
									<span>4.0+ Stars</span>
								</button>
								<button class="dropdown-item" onclick={() => { selectedRating = 3.5; showRatingDropdown = false; }}>
									<StarRating rating={3.5} size={18} />
									<span>3.5+ Stars</span>
								</button>
								<button class="dropdown-item" onclick={() => { selectedRating = 0; showRatingDropdown = false; }}>
									<span>Any Rating</span>
								</button>
							</div>
						{/if}
					</div>

					<!-- Active Filter Tags -->
					{#each selectedPracticeAreas as area}
						<div class="filter-tag">
							<button
								class="remove-tag"
								onclick={() => togglePracticeArea(area)}
								aria-label="Remove {area} filter"
							>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<line x1="18" y1="6" x2="6" y2="18"/>
									<line x1="6" y1="6" x2="18" y2="18"/>
								</svg>
							</button>
							<span>{area}</span>
						</div>
					{/each}
				</div>
				<div class="sort-dropdown-container">
					<button
						class="sort-dropdown"
						onclick={() => showSortDropdown = !showSortDropdown}
					>
						Sort: {sortBy === 'relevance' ? 'Relevance' : sortBy === 'rating' ? 'Rating' : 'Distance'}
						<svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M1 1L5 5L9 1" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>

					{#if showSortDropdown}
						<div class="dropdown-menu">
							<button class="dropdown-item" onclick={() => { sortBy = 'relevance'; showSortDropdown = false; }}>
								{#if sortBy === 'relevance'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polyline points="20 6 9 17 4 12"/>
									</svg>
								{:else}
									<span class="checkmark-spacer"></span>
								{/if}
								<span>Sort: Relevance</span>
							</button>
							<button class="dropdown-item" onclick={() => { sortBy = 'rating'; showSortDropdown = false; }}>
								{#if sortBy === 'rating'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polyline points="20 6 9 17 4 12"/>
									</svg>
								{:else}
									<span class="checkmark-spacer"></span>
								{/if}
								<span>Sort: Rating</span>
							</button>
							<button class="dropdown-item" onclick={() => { sortBy = 'distance'; showSortDropdown = false; }}>
								{#if sortBy === 'distance'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polyline points="20 6 9 17 4 12"/>
									</svg>
								{:else}
									<span class="checkmark-spacer"></span>
								{/if}
								<span>Sort: Distance</span>
							</button>
						</div>
					{/if}
				</div>
			</div>

			<!-- Filters Panel -->
			{#if showFilters}
				<div class="filters-panel">
					<div class="filter-group">
						<h3>Practice Areas</h3>
						<div class="checkbox-group">
							{#each practiceAreaOptions as area}
								<label class="checkbox-label">
									<input
										type="checkbox"
										checked={selectedPracticeAreas.includes(area)}
										onchange={() => togglePracticeArea(area)}
									/>
									<span>{area}</span>
								</label>
							{/each}
						</div>
					</div>

					<div class="filter-group">
						<h3>Minimum Rating</h3>
						<div class="rating-filter">
							{#each [4.5, 4.0, 3.5, 3.0] as rating}
								<label class="radio-label">
									<input
										type="radio"
										name="rating"
										value={rating}
										checked={selectedRating === rating}
										onchange={() => selectedRating = rating}
									/>
									<StarRating rating={rating} size={18} />
									<span>{rating}+ Stars</span>
								</label>
							{/each}
						</div>
					</div>

					<div class="filter-group">
						<h3>Experience</h3>
						<select bind:value={selectedExperience} class="filter-select">
							<option value="all">All Experience Levels</option>
							<option value="5+">5+ Years</option>
							<option value="10+">10+ Years</option>
							<option value="15+">15+ Years</option>
							<option value="20+">20+ Years</option>
						</select>
					</div>

					<button class="clear-filters-btn" onclick={clearFilters}>
						Clear All Filters
					</button>
				</div>
			{/if}

			<!-- Loading State with Skeletons -->
			{#if showSkeletons}
				<div class="results-grid skeleton-grid" class:showing={showSkeletons}>
					{#each Array(6) as _, i}
						<div class="firm-card skeleton">
							<!-- Firm Header -->
							<div class="firm-header" style="min-height: 80px;">
								<div class="skeleton-avatar" style="width: 55px; height: 55px;"></div>
								<div class="firm-header-content" style="min-height: 55px;">
									<div style="display: flex; align-items: center; gap: 8px;">
										<div class="skeleton-text" style="width: 180px; height: 20px;"></div>
										<div class="skeleton-text" style="width: 60px; height: 24px; border-radius: 6px;"></div>
									</div>
									<div style="display: flex; align-items: center; gap: 4px; margin-top: 6px;">
										<div class="skeleton-text" style="width: 90px; height: 18px;"></div>
										<div class="skeleton-text" style="width: 80px; height: 16px;"></div>
									</div>
								</div>
							</div>

							<!-- Divider -->
							<div class="card-divider" style="margin: 2px 0 2px 0;"></div>

							<!-- Practice Areas Section -->
							<div class="info-section">
								<div class="section-header">
									<div class="skeleton-text" style="width: 20px; height: 20px; border-radius: 4px;"></div>
									<div class="skeleton-text" style="width: 110px; height: 14px;"></div>
								</div>
								<div style="display: flex; gap: 8px; flex-wrap: wrap;">
									<div class="skeleton-text" style="width: 90px; height: 32px; border-radius: 20px;"></div>
									<div class="skeleton-text" style="width: 110px; height: 32px; border-radius: 20px;"></div>
									<div class="skeleton-text" style="width: 80px; height: 32px; border-radius: 20px;"></div>
								</div>
							</div>

							<!-- Divider -->
							<div class="card-divider"></div>

							<!-- AI Overview Section -->
							<div class="info-section ai-overview-section" style="min-height: 100px;">
								<div class="section-header">
									<div class="skeleton-text" style="width: 20px; height: 20px; border-radius: 4px;"></div>
									<div class="skeleton-text" style="width: 100px; height: 14px;"></div>
								</div>
								<div>
									<div class="skeleton-text" style="width: 100%; height: 15px; margin-bottom: 6px;"></div>
									<div class="skeleton-text" style="width: 95%; height: 15px; margin-bottom: 6px;"></div>
									<div class="skeleton-text" style="width: 85%; height: 15px;"></div>
								</div>
							</div>

							<!-- Divider -->
							<div class="card-divider"></div>

							<!-- Location Section -->
							<div class="info-section" style="margin-bottom: 0;">
								<div class="section-header">
									<div class="skeleton-text" style="width: 20px; height: 20px; border-radius: 4px;"></div>
									<div class="skeleton-text" style="width: 80px; height: 14px;"></div>
								</div>
								<div>
									<div class="skeleton-text" style="width: 200px; height: 15px;"></div>
								</div>
							</div>

							<!-- No divider before button -->

							<!-- View Profile Button -->
							<div class="button-wrapper" style="margin-top: 0;">
								<div class="skeleton-text" style="width: 95px; height: 16px;"></div>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Content States -->
			{#if pageState === SearchState.ERROR}
				<!-- Error State -->
				<div class="error-state">
					<p class="error-message">{error}</p>
					<button class="retry-button" onclick={performSearch}>Try Again</button>
				</div>
			{:else if pageState === SearchState.NO_RESULTS}
				<!-- Empty State -->
				<div class="empty-state">
					{#if error}
						<p>{error}</p>
					{:else}
						<p>No law firms found in your area.</p>
						<p class="hint">Try expanding your search radius or adjusting filters.</p>
					{/if}
				</div>
			{/if}

			<!-- Results Grid - Render when firms are available, but control visibility with CSS -->
			{#if lawFirms.length > 0 && pageState !== SearchState.SEARCHING}
				<div class="results-grid">
					{#each lawFirms as firm, index}
					{#if index === 2}
						<!-- CTA Section after first 2 cards -->
						<div class="cta-between-results">
							<h3>Accidents are stressful. Getting legal help shouldn't be.</h3>
							<a href="/get-started" class="cta-button">
								Get free consultation
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M5 12h14M12 5l7 7-7 7"/>
								</svg>
							</a>
						</div>
					{/if}
					<article class="firm-card" class:ready={cardsReady[firm.id] === true} class:immediate={cardsReady[firm.id] === 'immediate'} style="animation-delay: {Math.min(index * 50, 1000)}ms;">
						<div class="firm-header">
							<div class="firm-avatar">
								{firm.name.charAt(0)}
							</div>
							<div class="firm-header-content">
								<div class="firm-name-row">
									<h2>{firm.name}</h2>
									{#if firm.isVerified}
										<span class="verified-badge">Verified</span>
									{/if}
								</div>
								<div class="firm-rating">
									<StarRating rating={firm.rating} size={18} />
									<span class="rating-text">{firm.rating} ({firm.reviews} reviews)</span>
								</div>
							</div>
						</div>

						<div class="card-divider"></div>


						<!-- Firm Highlights Section -->
						<!-- <div class="info-section firm-highlights-section">
							<div class="firm-stats">
								{#if firm.isOpen}
									<div class="stat open-now">
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<circle cx="12" cy="12" r="10"/>
											<polyline points="12 6 12 12 16 14"/>
										</svg>
										<span>Open now</span>
									</div>
								{/if}
								{#if firm.yearsExperience}
									<div class="stat">
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
											<line x1="16" y1="2" x2="16" y2="6"/>
											<line x1="8" y1="2" x2="8" y2="6"/>
											<line x1="3" y1="10" x2="21" y2="10"/>
										</svg>
										<span>{firm.yearsExperience}+ years</span>
									</div>
								{/if}
								{#if firm.casesWon}
									<div class="stat">
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
											<polyline points="22 4 12 14.01 9 11.01"/>
										</svg>
										<span>{firm.casesWon.toLocaleString()}+ cases won</span>
									</div>
								{/if}
								{#if firm.amountCollected}
									<div class="stat">
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<rect x="2" y="6" width="20" height="12" rx="2"/>
											<circle cx="12" cy="12" r="2"/>
											<path d="M6 12h.01M18 12h.01"/>
										</svg>
										<span>{firm.amountCollected}</span>
									</div>
								{/if}
							</div>
						</div> -->

						<!-- Practice Areas Section -->
						{#if firm.practiceAreas && firm.practiceAreas.length > 0}
						<div class="info-section">
							<div class="section-header">
								<img src="/shield-black.svg" alt="Practice Areas" class="section-icon" />
								<span class="section-title">PRACTICE AREAS</span>
							</div>
							<div class="practice-areas"
								class:expanded={expandedFirms.has(firm.id)}
								bind:this={practiceAreaRefs[firm.id]}
								data-firm-id={firm.id}>
								{#if expandedFirms.has(firm.id)}
									<!-- Expanded state: show all -->
									{#each firm.practiceAreas as area, i}
										{@const score = firm.practiceAreaScores?.[area] || 0}
										{@const isTopMatch = score >= 0.82}
										{@const isRelatedMatch = score >= 0.72 && score < 0.82}
										<span class="practice-tag no-animation" class:top-match={isTopMatch} class:related-match={isRelatedMatch}>
											{#if isTopMatch}
												<span class="check">✓</span>
											{/if}
											{area}
										</span>
									{/each}
									{#if firm.practiceAreas.length > 0}
										<button class="practice-tag more-pill no-animation" onclick={() => toggleFirmExpansion(firm.id)}>
											Show less
										</button>
									{/if}
								{:else if visiblePillCounts[firm.id] !== undefined}
									<!-- Collapsed state: only show when calculation is ready -->
									{@const pillCount = visiblePillCounts[firm.id]}
									{@const isInitialRender = pageState === SearchState.TRANSITIONING || pageState === SearchState.SEARCHING}
									{@const cardDelay = isInitialRender ? Math.min(index * 50, 1000) : 0}
									{@const cardAnimDuration = isInitialRender ? 500 : 0}
									{@const pillBaseDelay = cardDelay + cardAnimDuration}
									{#each firm.practiceAreas.slice(0, pillCount) as area, i}
										{@const score = firm.practiceAreaScores?.[area] || 0}
										{@const isTopMatch = score >= 0.82}
										{@const isRelatedMatch = score >= 0.72 && score < 0.82}
										<span class="practice-tag" class:no-animation={!isInitialRender} class:top-match={isTopMatch} class:related-match={isRelatedMatch} style="animation-delay: {pillBaseDelay + (i * 100)}ms">
											{#if isTopMatch}
												<span class="check">✓</span>
											{/if}
											{area}
										</span>
									{/each}
									{#if firm.practiceAreas.length > pillCount}
										<button class="practice-tag more-pill" class:no-animation={!isInitialRender} onclick={() => toggleFirmExpansion(firm.id)}
											style="animation-delay: {pillBaseDelay + (pillCount * 100)}ms">
											+{firm.practiceAreas.length - pillCount} more
										</button>
									{/if}
								{:else}
									<!-- Loading state: measure all pills invisibly to calculate -->
									{#each firm.practiceAreas as area}
										{@const score = firm.practiceAreaScores?.[area] || 0}
										{@const isTopMatch = score >= 0.82}
										{@const isRelatedMatch = score >= 0.72 && score < 0.82}
										<span class="practice-tag measuring" class:top-match={isTopMatch} class:related-match={isRelatedMatch} style="opacity: 0; pointer-events: none;">
											{#if isTopMatch}
												<span class="check">✓</span>
											{/if}
											{area}
										</span>
									{/each}
								{/if}
							</div>
						</div>
						{/if}

						<div class="card-divider"></div>

						<!-- AI Overview Section -->
						<div class="info-section ai-overview-section">
							<div class="section-header">
								<img src="/stars-gradient-black.svg" alt="AI" class="section-icon" />
								<span class="section-title">OVERVIEW</span>
							</div>
							<p class="section-content">{firm.description}</p>
						</div>

						<div class="card-divider"></div>

						<!-- Location Section -->
						<div class="firm-location">
							<img src="/map-pin-gray.svg" alt="Location" class="location-icon" />
							<span class="location-text">
								<span class="location-primary">{firm.city}, {firm.state}</span>
								<span class="location-distance">{firm.distance} away</span>
							</span>
						</div>

						<!-- View Profile Footer -->
						<div class="firm-footer">
							<a href="/injury-law-firms/{firm.stateUrl}/{firm.cityUrl}/{firm.slug}" class="view-profile-link">
								View profile
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M5 12h14M12 5l7 7-7 7"/>
								</svg>
							</a>
						</div>
					</article>
				{/each}
			</div>
			{/if}
		</div>
	</main>

	<Footer />
</div>

<style>
	@import '$lib/styles/practiceAreaPills.css';

	.page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: white;
	}

	main {
		flex: 1;
		padding: 32px 20px 64px;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	/* Page Header */
	.page-header {
		margin-bottom: 32px;
	}

	h1 {
		font-size: 30px;
		font-weight: 700;
		margin-bottom: 8px;
		color: #1a1a1a;
	}

	.location-highlight {
		background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		color: #666;
		font-size: 16px;
	}

	/* Search Form */
	.search-form {
		margin-bottom: 24px;
	}

	.search-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
		border-radius: 16px;
		overflow: visible;
	}

	.search-input-container {
		position: relative;
		background: white;
	}

	.search-icon,
	.location-icon {
		position: absolute;
		left: 16px;
		top: 50%;
		transform: translateY(-50%);
		color: #999;
		z-index: 3;
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 16px 20px 16px 48px;
		border: none;
		font-size: 16px;
		transition: border-color 0.2s;
		border-radius: 0;
		position: relative;
		z-index: 1;
	}

	.query-input {
		border-bottom: 1px solid #e5e5e5;
		border-radius: 16px 16px 0 0;
	}

	.location-input {
		border-top: 1px solid #e5e5e5;
		border-radius: 0;
	}

	.search-input:focus {
		outline: none;
		z-index: 2;
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
	}

	.search-button {
		padding: 16px 32px;
		border-radius: 0 0 16px 16px;
		background: linear-gradient(135deg, #FF7B00 0%, #D85A00 100%);
		color: white;
		border: none;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		white-space: nowrap;
		box-shadow: 0 4px 15px rgba(255, 123, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.search-button:hover {
		background: linear-gradient(135deg, #FF9500 0%, #E06500 100%);
		box-shadow: 0 6px 25px rgba(255, 123, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15);
	}

	/* Minimal Filter/Sort Bar */
	.filter-sort-bar {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
		gap: 16px;
	}

	.filter-chips {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		flex: 1;
		min-width: 0;
	}

	.filter-dropdown-container {
		position: relative;
	}

	.chip {
		padding: 8px 16px;
		background: white;
		border: none;
		border-radius: 16px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		color: #666;
		display: flex;
		align-items: center;
		gap: 8px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
	}

	.chip svg {
		width: 10px;
		height: 6px;
	}

	.chip:hover {
		color: #60A5FA;
		box-shadow: 0 2px 8px rgba(96, 165, 250, 0.3);
	}

	.chip.active {
		background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		color: white;
		border-radius: 16px;
		box-shadow: 0 4px 15px rgba(96, 165, 250, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
		padding: 8px;
		min-width: 240px;
		z-index: 10;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		cursor: pointer;
		border-radius: 6px;
		transition: background 0.2s;
		width: 100%;
		background: transparent;
		border: none;
		text-align: left;
		font-size: 14px;
		color: #333;
	}

	.dropdown-item:hover {
		background: #f9fafb;
	}

	.dropdown-item input[type="checkbox"] {
		cursor: pointer;
	}

	.dropdown-item span {
		flex: 1;
	}

	.sort-dropdown-container {
		position: relative;
	}

	.sort-dropdown {
		padding: 8px 16px;
		border: none;
		border-radius: 16px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		background: white;
		color: #666;
		transition: all 0.2s;
		flex-shrink: 0;
		white-space: nowrap;
		display: flex;
		align-items: center;
		gap: 8px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
	}

	.sort-dropdown:hover {
		color: #60A5FA;
		box-shadow: 0 2px 8px rgba(96, 165, 250, 0.3);
	}

	.sort-dropdown svg {
		width: 10px;
		height: 6px;
	}

	.sort-dropdown-container .dropdown-menu {
		right: 0;
		left: auto;
		min-width: 200px;
	}

	.sort-dropdown-container .dropdown-item {
		justify-content: flex-start;
		gap: 8px;
	}

	.sort-dropdown-container .dropdown-item .checkmark-spacer {
		width: 16px;
		min-width: 16px;
		height: 16px;
		flex-shrink: 0;
	}

	@media (max-width: 640px) {
		.sort-dropdown-container .dropdown-menu {
			right: 0;
			min-width: 240px;
		}
	}

	.checkmark-spacer {
		width: 16px !important;
		height: 16px !important;
		display: inline-block;
		flex-shrink: 0;
		min-width: 16px !important;
		max-width: 16px !important;
	}

	.sort-dropdown-container .dropdown-item svg {
		flex-shrink: 0;
		min-width: 16px !important;
		max-width: 16px !important;
		width: 16px !important;
		height: 16px !important;
	}

	/* Active Filter Tags */
	.filter-tag {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 12px;
		background: rgba(96, 165, 250, 0.15);
		color: #2563EB;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
	}

	.remove-tag {
		background: transparent;
		border: none;
		color: #2563EB;
		cursor: pointer;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: opacity 0.2s;
		width: 18px;
		height: 18px;
	}

	.remove-tag:hover {
		opacity: 0.7;
	}

	.remove-tag svg {
		width: 14px;
		height: 14px;
	}

	/* Filters Panel */
	.filters-panel {
		background: white;
		padding: 24px;
		border-radius: 12px;
		margin-bottom: 24px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.08);
		display: grid;
		gap: 24px;
	}

	.filter-group h3 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 12px;
		color: #1a1a1a;
	}

	.checkbox-group {
		display: grid;
		gap: 8px;
	}

	.checkbox-label, .radio-label {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		padding: 8px;
		border-radius: 6px;
		transition: background 0.2s;
	}

	.checkbox-label:hover, .radio-label:hover {
		background: #f9fafb;
	}

	.checkbox-label input, .radio-label input {
		cursor: pointer;
	}

	.rating-filter {
		display: grid;
		gap: 8px;
	}

	.filter-select {
		width: 100%;
		padding: 10px 12px;
		border: 2px solid #e5e5e5;
		border-radius: 8px;
		font-size: 14px;
		cursor: pointer;
		background: white;
	}

	.clear-filters-btn {
		padding: 12px 24px;
		background: #f3f4f6;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.clear-filters-btn:hover {
		background: #e5e7eb;
	}

	/* Results Grid */
	.results-grid {
		display: grid;
		gap: 20px;
		position: relative;
		align-items: start;
	}

	/* Skeleton Grid - overlays during transition */
	.skeleton-grid {
		position: relative;
		z-index: 1;
		transition: opacity 0.3s ease-out;
	}

	/* Skeleton grid when showing */
	.skeleton-grid.showing {
		opacity: 1;
		animation: none;
	}

	.cta-between-results {
		grid-column: 1 / -1;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		padding: 32px 0;
	}

	.cta-between-results h3 {
		font-size: 18px;
		font-weight: 400;
		color: #666;
		margin: 0;
	}

	.cta-button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 16px 32px;
		background: linear-gradient(135deg, #FF6800 0%, #FFA500 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		text-decoration: none;
		box-shadow: 0 4px 15px rgba(255, 104, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.cta-button:hover {
		background: linear-gradient(135deg, #FF8000 0%, #FFB733 100%);
		box-shadow: 0 6px 25px rgba(255, 104, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
	}

	.cta-button svg {
		transition: transform 0.2s;
	}

	.cta-button:hover svg {
		transform: translateX(3px);
	}

	.firm-card {
		background: white;
		border-radius: 16px;
		padding: 24px 24px 20px 24px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
		transition: all 0.3s;
		position: relative;
		min-width: 0;
		width: 100%;
		/* Start invisible but in the DOM */
		visibility: hidden;
		opacity: 0;
		transform: translateY(20px);
		will-change: transform, opacity, visibility;
		display: flex;
		flex-direction: column;
	}

	.firm-card.ready {
		visibility: visible;
		animation: fadeInUp 0.5s ease-out forwards;
	}

	/* Immediate display for cards beyond animation limit */
	.firm-card.immediate {
		visibility: visible;
		opacity: 1;
		transform: none;
		animation: none;
	}

	.firm-card.ready:hover,
	.firm-card.immediate:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0,0,0,0.22);
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes bubblePop {
		0% {
			opacity: 0;
			transform: scale(0.8);
		}
		60% {
			transform: scale(1.05);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	/* Respect prefers-reduced-motion for accessibility */
	@media (prefers-reduced-motion: reduce) {
		.firm-card {
			animation: none !important;
			transition: none !important;
		}

		.firm-card.ready {
			visibility: visible;
			opacity: 1;
			transform: none;
		}

		.skeleton-text,
		.skeleton-avatar {
			animation: none !important;
		}

		.practice-tag {
			animation: none !important;
			opacity: 1;
			transform: none;
		}
	}

	/* Performance optimizations for large result sets */
	.results-grid:has(> :nth-child(20)) .firm-card {
		/* Reduce animation complexity for 20+ items */
		animation-duration: 0.3s;
		will-change: auto;
	}

	.firm-header {
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-rows: auto auto;
		gap: 0 12px;
		margin-bottom: 8px;
		min-width: 0;
		min-height: 80px; /* Ensures consistent height regardless of name length */
	}

	.firm-avatar {
		width: 55px;
		height: 55px;
		border-radius: 50%;
		background: #1a1a1a;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		font-weight: bold;
		flex-shrink: 0;
		grid-row: 1 / 3;
	}

	.firm-header-content {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		gap: 4px;
		min-width: 0;
		min-height: 55px; /* Match avatar height to ensure consistent content positioning */
	}

	.firm-name-row {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}

	.firm-header h2 {
		font-size: 20px;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0;
		min-width: 0;
	}

	.firm-title-section {
		flex: 1;
		min-width: 0;
	}

	.name-badges {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: 1;
		min-width: 0;
	}

	.firm-title-section h2 {
		font-size: 20px;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0;
	}

	.verified-badge {
		display: inline-flex;
		align-items: center;
		padding: 4px 10px;
		background: rgba(16, 185, 129, 0.15);
		color: #10b981;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 600;
		flex-shrink: 0;
	}

	.location-info {
		display: flex;
		align-items: center;
		gap: 6px;
		color: #666;
		font-size: 14px;
		min-width: 0;
		flex-wrap: nowrap;
	}

	.location-icon-img {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		object-fit: contain;
	}

	.location-info .pipe {
		color: #ccc;
		margin: 0 2px;
	}

	.distance {
		display: flex;
		align-items: center;
		gap: 4px;
		color: #999;
		font-size: 14px;
		font-weight: 500;
		white-space: nowrap;
		flex-shrink: 0;
		margin-left: auto;
	}

	.distance svg {
		color: #999;
	}

	.firm-stats {
		display: flex;
		gap: 16px;
		margin-bottom: 14px;
		flex-wrap: wrap;
		min-width: 0;
		padding-left: 28px;
	}

	/* New Section Layout Styles */
	.info-section {
		margin-bottom: 12px;
		padding-top: 0;
		display: flex;
		flex-direction: column;
	}

	.info-section:first-of-type {
		padding-top: 0;
	}

	.info-section:last-of-type {
		margin-bottom: 0; /* No space before button */
		min-height: auto; /* Remove fixed height for location section */
	}

	/* Specifically target the practice areas section */
	.info-section:has(.practice-areas) {
		margin-bottom: 10px;
		min-height: unset; /* Remove the fixed height for practice areas */
	}

	/* AI Overview section needs consistent height */
	.ai-overview-section {
		min-height: 100px; /* Ensures consistent positioning of location section */
	}

	/* Firm highlights without header */
	.firm-highlights-section {
		border-top: none;
		padding-top: 0;
		margin-bottom: 16px;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 12px;
		flex-shrink: 0;
		padding-left: 4px;
	}

	.section-icon {
		width: 20px;
		height: 20px;
		flex-shrink: 0;
	}

	img.section-icon {
		object-fit: contain;
	}

	.section-title {
		font-size: 14px;
		font-weight: 600;
		color: #999;
		text-transform: uppercase;
	}

	.section-content {
		color: #666666;
		font-size: 15px;
		font-weight: 500;
		line-height: 1.5;
		margin: 0;
		padding-left: 4px;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Option 1: Visual Hierarchy for Location Text */
	.location-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
	}

	.location-text {
		display: block;
		-webkit-line-clamp: unset;
		-webkit-box-orient: unset;
		overflow: visible;
		margin: 0;
	}

	.location-primary {
		font-size: 16px;
		font-weight: 600;
		color: #1a1a1a;
	}

	.location-separator {
		display: none;
	}

	.location-distance {
		font-size: 14px;
		font-weight: 400;
		color: #6b7280;
		margin-left: 12px;
	}

	.firm-location {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 4px;
	}

	.firm-location .location-icon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		position: static;
		transform: none;
	}

	.firm-footer {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 10px 16px;
		margin: 16px -24px -20px -24px;
		background: #f9fafb;
		border-radius: 0 0 16px 16px;
		border-top: 1px solid #e5e7eb;
	}

	.view-profile-link {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		color: #1a1a1a;
		text-decoration: none;
		font-weight: 600;
		font-size: 16px;
		transition: color 0.2s;
	}

	.firm-footer:hover .view-profile-link {
		color: #FF6800;
	}

	.view-profile-link svg {
		width: 16px;
		height: 16px;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 6px;
		color: #666;
		font-size: 14px;
	}

	.stat svg {
		color: #60A5FA;
	}

	.stat.open-now {
		color: #10b981;
		font-weight: 600;
	}

	.stat.open-now svg {
		color: #10b981;
	}

	.firm-description {
		color: #666;
		font-size: 16px;
		line-height: 1.6;
		margin-bottom: 14px;
	}

	.ai-label {
		font-weight: normal;
		color: #666;
	}

	.ai-icon {
		width: 24px;
		height: 24px;
		display: inline-block;
		vertical-align: middle;
		margin-right: 4px;
		margin-top: -3px;
	}

	.rating-location-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		margin-top: 16px;
		margin-bottom: 8px;
		flex-wrap: wrap;
	}

	.card-divider {
		height: 1px;
		background-color: transparent;
		margin: 6px 0 8px 0;
	}

	/* Extra space only after the header section */
	.firm-header + .card-divider {
		margin: 2px 0 2px 0;
	}

	/* Reduce space before the button */
	.info-section:last-of-type + .card-divider {
		display: none; /* Hide the last divider before button */
	}

	/* Hide the divider between location and button */
	.location-button-divider {
		display: none;
	}

	.firm-rating {
		display: flex;
		align-items: center;
		gap: 4px;
		line-height: 1;
		margin-top: 6px;
	}

	/* Practice area styles are imported from shared CSS */
	/* Additional overrides or specific styles can go here if needed */

	/* Make practice-areas compatible with the standardized container */
	.practice-areas {
		display: flex;
		flex-wrap: nowrap;
		gap: 8px;
		max-width: 100%;
		overflow: hidden;
		position: relative;
		padding-left: 4px;
		padding-bottom: 6px;
		margin-bottom: -6px;
		min-height: 32px; /* Prevent layout shift */
	}

	.practice-areas.expanded {
		flex-wrap: wrap;
		overflow: visible;
		max-width: 100%;
	}

	/* Keep existing practice-tag styles for backward compatibility */
	.practice-tag {
		background: #f3f4f6;
		color: #374151;
		padding: 6px 14px;
		border-radius: 20px;
		font-size: 13px;
		font-weight: 500;
		white-space: nowrap;
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		transition: all 0.2s ease;
		border: 1px solid transparent;
		opacity: 0;
		transform: scale(0.8);
		animation: bubblePop 0.4s ease-out forwards;
	}

	/* Skip animation for measurement pills */
	.practice-tag.measuring {
		animation: none !important;
		opacity: 0 !important;
		pointer-events: none !important;
		/* Keep in document flow for container width calculation */
	}

	/* Skip animation when toggling expanded/collapsed */
	.practice-tag.no-animation {
		animation: none !important;
		opacity: 1 !important;
		transform: scale(1) !important;
	}

	.practice-tag.top-match {
		background: #10b981;
		color: white;
		font-weight: 600;
		border: 1px solid #34d399;
	}

	.practice-tag.related-match {
		background: linear-gradient(white, white) padding-box,
					linear-gradient(135deg, #10b981, #34d399) border-box;
		color: #10b981;
		border: 2px solid transparent;
		font-weight: 600;
	}

	.practice-tag .check {
		font-size: 14px;
		font-weight: bold;
		line-height: 1;
		filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5));
	}

	.more-pill {
		background: #ffffff;
		border: 2px solid transparent;
		background-image: linear-gradient(white, white), linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		background-origin: border-box;
		background-clip: padding-box, border-box;
		color: #2563EB;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
	}

	button.practice-tag:hover {
		background: rgba(96, 165, 250, 0.25);
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	button.more-pill:hover {
		background: #ffffff;
		background-image: linear-gradient(white, white), linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		background-origin: border-box;
		background-clip: padding-box, border-box;
		color: #2563EB;
		box-shadow: 0 3px 8px rgba(37, 99, 235, 0.3);
		transform: translateY(-1px);
	}

	button.practice-tag:focus {
		outline: 2px solid #2563EB;
		outline-offset: 2px;
	}

	button.more-pill:focus {
		outline: none;
	}

	/* Star styles removed - using StarRating component instead */

	.rating-text {
		font-size: 14px;
		color: #FFA500;
		font-weight: 500;
		line-height: 1;
	}

	.button-wrapper {
		display: flex;
		justify-content: flex-end;
		margin-top: 0;
		padding-right: 0;
	}

	.connect-link {
		color: #1a1a1a;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		gap: 8px;
		text-decoration: none;
	}

	.connect-link:hover {
		color: #FF9933;
	}

	.firm-card:hover .connect-link {
		color: #FF9933;
	}

	.connect-link svg {
		transition: transform 0.2s;
		width: 18px;
		height: 18px;
	}

	.connect-link:hover svg {
		transform: translateX(3px);
	}

	.firm-card:hover .connect-link svg {
		transform: translateX(3px);
	}

	.card-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.view-profile-btn {
		padding: 12px;
		background: #1a1a1a;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.view-profile-btn:hover {
		background: #333333;
	}

	.contact-btn {
		padding: 12px;
		background: linear-gradient(135deg, #FF7B00 0%, #D85A00 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		box-shadow: 0 2px 8px rgba(255, 123, 0, 0.3);
	}

	.contact-btn:hover {
		background: linear-gradient(135deg, #FF9500 0%, #E06500 100%);
		box-shadow: 0 4px 12px rgba(255, 123, 0, 0.4);
	}

	/* Responsive */
	@media (min-width: 640px) {
		.filters-panel {
			grid-template-columns: repeat(2, 1fr);
		}

		.clear-filters-btn {
			grid-column: 1 / -1;
		}
	}

	@media (min-width: 768px) {
		h1 {
			font-size: 30px;
		}

		.search-wrapper {
			flex-direction: row;
		}

		.search-input-container:first-child {
			flex: 65;
		}

		.location-container {
			flex: 35;
		}

		.query-input {
			border-right: 1px solid #e5e5e5;
			border-radius: 16px 0 0 16px;
			border-bottom: 0;
		}

		.location-input {
			border-left: 1px solid #e5e5e5;
			border-radius: 0;
			border-top: 0;
		}

		.search-button {
			border-radius: 0 16px 16px 0;
			flex-shrink: 0;
			border-top-left-radius: 0;
			border-bottom-left-radius: 0;
		}

		.filter-bar {
			flex-direction: row;
		}

		.filter-toggle, .sort-select {
			flex: 0 0 auto;
			width: 140px;
		}

		.location-info {
			margin-left: auto;
		}
	}

	@media (min-width: 1024px) {
		.filters-panel {
			grid-template-columns: repeat(4, 1fr);
		}

		.results-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	/* Loading, Error, and Empty States */
	.error-state,
	.empty-state {
		text-align: center;
		padding: 64px 20px;
	}

	.empty-state p {
		color: #666;
		font-size: 16px;
		margin: 8px 0;
	}

	.hint {
		color: #999;
		font-size: 14px;
	}

	.error-message {
		color: #dc2626;
		font-size: 16px;
		margin-bottom: 16px;
	}

	.retry-button {
		padding: 12px 24px;
		background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s;
		box-shadow: 0 4px 15px rgba(96, 165, 250, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.retry-button:hover {
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		box-shadow: 0 6px 25px rgba(96, 165, 250, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
	}

	/* Skeleton loading styles */
	.skeleton {
		pointer-events: none;
		opacity: 1 !important;
		transform: none !important;
		animation: none !important;
		visibility: visible !important;
		position: relative !important;
	}

	.skeleton-avatar {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: loading 1.5s ease-in-out infinite;
		flex-shrink: 0;
	}

	.skeleton-text {
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: loading 1.5s ease-in-out infinite;
		border-radius: 4px;
	}

	@keyframes loading {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
</style>
