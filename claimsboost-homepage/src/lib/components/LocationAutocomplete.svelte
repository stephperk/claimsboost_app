<script>
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { browser } from '$app/environment';
	import { PUBLIC_GOOGLE_MAPS_API_KEY } from '$env/static/public';

	// Props
	export let value = '';
	export let placeholder = 'City, State or ZIP';
	export let userLocation = null; // For proximity-based ranking

	const dispatch = createEventDispatcher();

	// State
	let inputElement;
	let suggestions = [];
	let showDropdown = false;
	let selectedIndex = -1;
	let isLoading = false;
	let error = null;
	let sessionToken = null;
	let debounceTimer = null;

	// Google Maps API references
	let AutocompleteSuggestion = null;
	let AutocompleteSessionToken = null;
	let Place = null;

	// Load Google Maps API dynamically
	async function loadGoogleMaps() {
		if (!browser) return false;

		// Check if already loaded
		if (window.google?.maps?.importLibrary) {
			return true;
		}

		// Check if script is already being loaded
		const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
		if (existingScript) {
			// Wait for it to load
			return new Promise((resolve) => {
				const checkInterval = setInterval(() => {
					if (window.google?.maps?.importLibrary) {
						clearInterval(checkInterval);
						resolve(true);
					}
				}, 100);

				// Timeout after 10 seconds
				setTimeout(() => {
					clearInterval(checkInterval);
					resolve(false);
				}, 10000);
			});
		}

		// Load the script - using loading=async as recommended
		return new Promise((resolve) => {
			const script = document.createElement('script');
			script.src = `https://maps.googleapis.com/maps/api/js?key=${PUBLIC_GOOGLE_MAPS_API_KEY}&loading=async`;
			script.async = true;
			script.defer = true;
			script.onload = () => {
				// Wait for google.maps to be fully available
				const checkMaps = setInterval(() => {
					if (window.google?.maps?.importLibrary) {
						clearInterval(checkMaps);
						resolve(true);
					}
				}, 50);

				// Timeout after 5 seconds
				setTimeout(() => {
					clearInterval(checkMaps);
					resolve(false);
				}, 5000);
			};
			script.onerror = () => {
				console.error('Failed to load Google Maps API');
				error = 'Failed to load autocomplete service';
				resolve(false);
			};
			document.head.appendChild(script);
		});
	}

	// Initialize Google Places API
	async function initAutocomplete() {
		if (!window.google?.maps) {
			console.error('Google Maps not available');
			error = 'Failed to initialize autocomplete';
			return;
		}

		try {
			// Import the places library
			const placesLib = await google.maps.importLibrary("places");
			AutocompleteSuggestion = placesLib.AutocompleteSuggestion;
			AutocompleteSessionToken = placesLib.AutocompleteSessionToken;
			Place = placesLib.Place;

			// Create initial session token
			sessionToken = new AutocompleteSessionToken();

			// Clear errors
			error = null;

		} catch (err) {
			console.error('Error initializing autocomplete:', err);
			error = 'Failed to initialize autocomplete';
		}
	}

	// Debounced fetch suggestions
	async function fetchSuggestions(input) {
		// Clear any existing timer
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		// Require minimum 2 characters
		if (!input || input.length < 2) {
			suggestions = [];
			showDropdown = false;
			return;
		}

		// Debounce for 150ms
		debounceTimer = setTimeout(async () => {
			isLoading = true;
			try {
				const request = {
					input,
					includedPrimaryTypes: ['locality'],
					includedRegionCodes: ['us'],
					sessionToken
				};

				// Add location bias if available
				if (userLocation?.latitude && userLocation?.longitude) {
					request.locationBias = {
						center: {
							lat: userLocation.latitude,
							lng: userLocation.longitude
						},
						radius: 50000 // 50km
					};
				}

				const { suggestions: results } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

				suggestions = results || [];
				showDropdown = suggestions.length > 0;
				selectedIndex = -1;
				error = null;

			} catch (err) {
				console.error('Error fetching suggestions:', err);
				error = 'Failed to fetch suggestions';
				suggestions = [];
				showDropdown = false;
			} finally {
				isLoading = false;
			}
		}, 150);
	}

	// Handle input change
	function handleInput(event) {
		const newValue = event.target.value;
		value = newValue;

		// If user clears input via typing/backspace, treat it like a clear action
		if (!newValue.trim()) {
			dispatch('clear');
		}

		fetchSuggestions(newValue);
		dispatch('input', { value: newValue });
	}

	// Handle suggestion selection
	async function selectSuggestion(suggestion) {
		if (!suggestion?.placePrediction) return;

		isLoading = true;
		try {
			// Convert prediction to Place object
			const place = suggestion.placePrediction.toPlace();

			// Fetch place details
			await place.fetchFields({
				fields: ['displayName', 'formattedAddress', 'addressComponents', 'location']
			});

			// Extract location data
			const components = place.addressComponents || [];

			const city = components.find(c =>
				c.types.includes('locality') ||
				c.types.includes('sublocality') ||
				c.types.includes('administrative_area_level_3')
			)?.longText;

			const state = components.find(c =>
				c.types.includes('administrative_area_level_1')
			)?.shortText;

			const zipCode = components.find(c =>
				c.types.includes('postal_code')
			)?.longText;

			const location = {
				city: city || place.displayName,
				state,
				zipCode,
				latitude: place.location?.lat(),
				longitude: place.location?.lng(),
				formatted: place.formattedAddress
			};

			// Update the value
			value = city && state ? `${city}, ${state}` : place.formattedAddress;

			// Dispatch selection
			dispatch('select', location);

			// Close dropdown
			showDropdown = false;
			suggestions = [];
			selectedIndex = -1;
			error = null;

			// Reset session token after selection
			sessionToken = new AutocompleteSessionToken();

		} catch (err) {
			console.error('Error processing place:', err);
			error = 'Failed to get place details';
		} finally {
			isLoading = false;
		}
	}

	// Handle keyboard navigation
	function handleKeyDown(event) {
		if (!showDropdown || suggestions.length === 0) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, -1);
				break;
			case 'Enter':
				event.preventDefault();
				if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
					selectSuggestion(suggestions[selectedIndex]);
				}
				break;
			case 'Escape':
				event.preventDefault();
				showDropdown = false;
				selectedIndex = -1;
				break;
		}
	}

	// Handle click outside to close
	function handleClickOutside(event) {
		if (inputElement && !inputElement.contains(event.target)) {
			showDropdown = false;
			selectedIndex = -1;
		}
	}

	// Handle clear
	function handleClear() {
		// Dispatch clear FIRST so parent can set hasManuallyCleared before value change propagates
		dispatch('clear');

		value = '';
		error = null;
		suggestions = [];
		showDropdown = false;
		selectedIndex = -1;

		// Focus the input
		if (inputElement) {
			inputElement.focus();
		}
	}

	onMount(async () => {
		// Check API key
		if (!PUBLIC_GOOGLE_MAPS_API_KEY) {
			console.error('PUBLIC_GOOGLE_MAPS_API_KEY is not defined');
			error = 'API key not configured';
			return;
		}

		isLoading = true;

		// Load Google Maps
		const loaded = await loadGoogleMaps();

		if (!loaded) {
			console.error('Failed to load Google Maps');
			error = 'Failed to load Google Maps';
			isLoading = false;
			return;
		}

		// Initialize autocomplete
		await initAutocomplete();
		isLoading = false;

		// Add click outside listener
		if (browser) {
			document.addEventListener('click', handleClickOutside);
		}
	});

	onDestroy(() => {
		// Clean up event listeners
		if (browser) {
			document.removeEventListener('click', handleClickOutside);
		}

		// Clear debounce timer
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}
	});
</script>

<div class="location-autocomplete" bind:this={inputElement}>
	<div class="input-wrapper">
		<!-- Location Pin Icon -->
		<svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
			<circle cx="12" cy="10" r="3"/>
		</svg>

		<!-- Custom Input -->
		<input
			type="text"
			class="autocomplete-input"
			value={value}
			on:input={handleInput}
			on:focus={() => dispatch('focus')}
			on:blur={() => dispatch('blur')}
			on:keydown={handleKeyDown}
			placeholder={placeholder}
			autocomplete="off"
		/>

		<!-- Clear Button -->
		{#if value}
			<button type="button" class="clear-button" on:click={handleClear} aria-label="Clear location">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10"/>
					<path d="m15 9-6 6m0-6 6 6"/>
				</svg>
			</button>
		{/if}

	</div>

	<!-- Suggestions Dropdown -->
	{#if showDropdown && suggestions.length > 0}
		<div class="suggestions-dropdown">
			{#each suggestions as suggestion, index}
				<button
					type="button"
					class="suggestion-item"
					class:selected={index === selectedIndex}
					on:click={() => selectSuggestion(suggestion)}
				>
					<div class="suggestion-main">{suggestion.placePrediction?.text?.text || ''}</div>
					{#if suggestion.placePrediction?.structuredFormat?.secondaryText}
						<div class="suggestion-secondary">{suggestion.placePrediction.structuredFormat.secondaryText.text}</div>
					{/if}
				</button>
			{/each}

			<!-- Google Attribution -->
			<div class="google-attribution">Google Maps</div>
		</div>
	{/if}

	<!-- Error Message -->
	{#if error}
		<div class="error-message">{error}</div>
	{/if}
</div>

<style>
	.location-autocomplete {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.input-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		background: white;
	}

	.input-wrapper:focus-within {
		background: #f9fafb;
	}

	/* Search Icon */
	.search-icon {
		position: absolute;
		left: 16px;
		top: 50%;
		transform: translateY(-50%);
		color: #9ca3af;
		pointer-events: none;
		z-index: 1;
	}

	/* Custom Input */
	.autocomplete-input {
		width: 100%;
		padding: 16px 48px 16px 48px;
		border: none;
		border-radius: 0;
		font-size: 16px;
		outline: none;
		background: white;
		color: #1a1a1a;
		box-sizing: border-box;
		font-family: inherit;
		line-height: normal;
		font-weight: 400;
	}

	.autocomplete-input::placeholder {
		color: #9ca3af;
	}

	.autocomplete-input:focus {
		outline: none;
		background: transparent;
	}

	.input-wrapper:focus-within .search-icon {
		color: #FF7B00;
	}

	/* Clear Button */
	.clear-button {
		position: absolute;
		right: 12px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #9ca3af;
		transition: color 0.2s;
		z-index: 2;
	}

	.clear-button:hover {
		color: #1a1a1a;
	}


	/* Suggestions Dropdown */
	.suggestions-dropdown {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
		overflow: hidden;
		z-index: 10000;
		max-height: 300px;
		overflow-y: auto;
	}

	.suggestion-item {
		width: 100%;
		padding: 12px 16px;
		border: none;
		background: white;
		cursor: pointer;
		text-align: left;
		transition: background 0.2s ease;
		border-bottom: 1px solid #f5f5f5;
	}

	.suggestion-item:last-child {
		border-bottom: none;
	}

	.suggestion-item:hover,
	.suggestion-item.selected {
		background: linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%);
	}

	.suggestion-main {
		font-size: 15px;
		color: #1a1a1a;
		font-weight: 500;
		margin-bottom: 2px;
	}

	.suggestion-secondary {
		font-size: 13px;
		color: #6b7280;
	}

	/* Error Message */
	.error-message {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		color: #EF4444;
		font-size: 12px;
		padding: 8px 16px;
		background: #FEE2E2;
		border-radius: 8px;
		border: 1px solid #FCA5A5;
		z-index: 10001;
	}

	/* Google Attribution */
	.google-attribution {
		padding: 8px 16px;
		font-size: 11px;
		color: #5E5E5E;
		font-family: 'Roboto', Arial, sans-serif;
		text-align: right;
		background: #f9f9f9;
		border-top: 1px solid #e5e5e5;
	}
</style>
