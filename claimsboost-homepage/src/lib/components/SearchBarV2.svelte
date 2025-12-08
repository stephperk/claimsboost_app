<script>
	import { onMount } from 'svelte';
	import LocationAutocomplete from './LocationAutocomplete.svelte';
	import { location } from '$lib/stores/locationStore.js';
	import { searchLocation } from '$lib/stores/searchLocationStore.js';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	// Props
	export let practiceAreaValue = '';
	export let locationValue = '';
	export let practiceAreaPlaceholder = 'How were you injured?';
	export let locationPlaceholder = 'City, State';
	export let buttonText = 'Search';
	export let showLocationField = true; // Toggle location field visibility
	export let autofocusPracticeArea = false; // Auto-focus practice area input on mount

	// Store pending location data from autocomplete selection
	// This allows user to select from autocomplete without triggering an immediate search
	let pendingLocationData = null;

	// Reference to practice area input for autofocus
	let practiceAreaInput;

	onMount(() => {
		if (autofocusPracticeArea && practiceAreaInput) {
			practiceAreaInput.focus();
		}
	});

	// Handle location selection from autocomplete
	function handleLocationSelect(event) {
		const selected = event.detail;
		// Store location data temporarily - don't update store yet
		// Store will be updated when user clicks Search button
		pendingLocationData = selected;
		// Update the bound value (text display only)
		locationValue = selected.city && selected.state
			? `${selected.city}, ${selected.state}`
			: selected.formatted;
	}

	// Handle location clear
	function handleLocationClear() {
		// Dispatch clear FIRST so parent can set hasManuallyCleared before value change propagates
		dispatch('clear');
		// Don't clear the store here - let the parent component handle it
		// after setting hasManuallyCleared to prevent race conditions
		locationValue = '';
		// Clear any pending location data from autocomplete selection
		pendingLocationData = null;
	}

	// Handle location input events
	function handleLocationInput() {
		dispatch('locationInput', { value: locationValue });
	}

	function handleLocationFocus() {
		dispatch('locationFocus');
	}

	function handleLocationBlur() {
		dispatch('locationBlur');
	}

	// Handle practice area input events
	function handlePracticeAreaInput() {
		dispatch('practiceAreaInput', { value: practiceAreaValue });
	}

	function handlePracticeAreaFocus() {
		dispatch('practiceAreaFocus');
	}

	function handlePracticeAreaBlur() {
		dispatch('practiceAreaBlur');
	}

	// Handle search submission
	function handleSearch(e) {
		e.preventDefault();

		// Dispatch search event with current values
		// Use pending location data if available (from autocomplete selection),
		// otherwise fall back to current store value
		dispatch('search', {
			practiceArea: practiceAreaValue,
			location: locationValue,
			locationData: pendingLocationData || $searchLocation
		});
		// Clear pending data after dispatching
		pendingLocationData = null;
	}
</script>

<form class="search-bar-v2" on:submit={handleSearch}>
	<div class="search-wrapper">
		<!-- Practice Area Input -->
		<div class="practice-area-container">
			<div class="input-with-icon">
				{#if showLocationField}
					<!-- Search icon for search page -->
					<svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="11" cy="11" r="8"/>
						<path d="m21 21-4.35-4.35"/>
					</svg>
				{:else}
					<!-- Right arrow icon for hero -->
					<svg class="search-icon arrow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M5 12h14M12 5l7 7-7 7"/>
					</svg>
				{/if}
				<input
					type="text"
					class="practice-area-input"
					bind:value={practiceAreaValue}
					bind:this={practiceAreaInput}
					placeholder={practiceAreaPlaceholder}
					on:input={handlePracticeAreaInput}
					on:focus={handlePracticeAreaFocus}
					on:blur={handlePracticeAreaBlur}
				/>
			</div>
		</div>

		<!-- Location Input -->
		{#if showLocationField}
			<div class="location-container">
				<LocationAutocomplete
					bind:value={locationValue}
					placeholder={locationPlaceholder}
					userLocation={$location}
					on:select={handleLocationSelect}
					on:clear={handleLocationClear}
					on:input={handleLocationInput}
					on:focus={handleLocationFocus}
					on:blur={handleLocationBlur}
				/>
			</div>
		{/if}

		<!-- Search Button -->
		<button type="submit" class="search-button">
			{buttonText}
		</button>
	</div>
</form>

<style>
	.search-bar-v2 {
		width: 100%;
	}

	.search-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
		border-radius: 16px;
		overflow: visible;
		background: white;
	}

	/* Practice Area Container */
	.practice-area-container {
		position: relative;
		border-radius: 16px 16px 0 0;
		overflow: hidden;
		border-bottom: 1px solid #e5e5e5;
	}

	/* When location field is hidden, keep bottom rounded corners */
	.search-wrapper:not(:has(.location-container)) .practice-area-container {
		border-bottom: none;
		border-radius: 16px 16px 16px 16px;
	}

	.input-with-icon {
		position: relative;
		width: 100%;
	}

	.search-icon {
		position: absolute;
		left: 16px;
		top: 50%;
		transform: translateY(-50%);
		color: #9ca3af;
		pointer-events: none;
		z-index: 1;
	}

	.practice-area-input {
		width: 100%;
		padding: 16px 16px 16px 48px;
		border: none;
		font-size: 16px;
		outline: none;
		background: white;
		box-sizing: border-box;
		font-family: inherit;
		color: #1a1a1a;
		line-height: 1.5;
	}

	
	.practice-area-input::placeholder {
		color: #9ca3af;
	}

	.practice-area-input:focus {
		outline: none;
		background: #f9fafb;
	}

	.practice-area-container:focus-within {
		background: #f9fafb;
	}

	.practice-area-container:focus-within .search-icon {
		color: #FF7B00;
	}

	/* Location Container */
	.location-container {
		position: relative;
		border-bottom: 1px solid #e5e5e5;
		display: flex;
		align-items: stretch;
	}

	.location-container:focus-within {
		border-bottom-color: #FF7B00;
	}

	.location-container :global(.location-autocomplete) {
		width: 100%;
	}

	/* Search Button */
	.search-button {
		width: 100%;
		padding: 16px;
		border: none;
		background: linear-gradient(135deg, #FF6800 0%, #FFA500 100%);
		color: white;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		font-family: inherit;
		border-radius: 0 0 16px 16px;
		box-shadow: 0 4px 15px rgba(255, 104, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
		line-height: 1.5;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		position: relative;
		overflow: hidden;
	}

	.search-button::after {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.3),
			transparent
		);
		animation: shine 1s ease-in-out 1.2s 1;
	}

	@keyframes shine {
		0% {
			left: -100%;
		}
		100% {
			left: 100%;
		}
	}

	.search-button:hover {
		background: linear-gradient(135deg, #FF8000 0%, #FFB733 100%);
		box-shadow: 0 6px 25px rgba(255, 104, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15);
	}

	.search-button:active {
		transform: translateY(1px);
		box-shadow: 0 2px 8px rgba(255, 123, 0, 0.3);
	}

	/* Desktop Layout (768px and up) */
	@media (min-width: 768px) {
		.search-wrapper {
			flex-direction: row;
			align-items: stretch;
		}

		.practice-area-container {
			flex: 3;
			border-bottom: none;
			border-right: 1px solid #e5e5e5;
			border-radius: 16px 0 0 16px;
		}

		.location-container {
			flex: 2;
			border-right: 1px solid #e5e5e5;
			border-bottom: none;
			border-radius: 0;
		}

		.location-container :global(gmp-place-autocomplete input) {
			border-bottom: none !important;
		}

		.search-button {
			flex: 1;
			min-width: 120px;
			border-radius: 0 16px 16px 0;
		}

		/* When location field is hidden on desktop */
		.search-wrapper:not(:has(.location-container)) .practice-area-container {
			border-right: none;
			border-radius: 16px 0 0 16px;
		}

		.search-wrapper:not(:has(.location-container)) .search-button {
			border-radius: 0 16px 16px 0;
		}
	}
</style>
