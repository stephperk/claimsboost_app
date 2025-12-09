<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { location } from '$lib/stores/locationStore.js';
	import { searchLocation } from '$lib/stores/searchLocationStore.js';
	import { getStateName, stateNameToUrl, cityNameToUrl } from '$lib/utils/stateMapping.js';
	import StarRating from '$lib/components/StarRating.svelte';

	let scrollContainer = $state(null);
	let currentIndex = $state(0);
	let firms = $state([]);
	let isLoading = $state(true);
	let error = $state(null);
	let radiusUsed = $state(50);
	let locationUnavailable = $state(false);

	// Fetch law firms based on user location
	async function fetchNearbyFirms() {
		// Wait for location to be available with valid coordinates
		if (!$location.hasLocation || !$location.latitude || !$location.longitude) {
			locationUnavailable = true;
			isLoading = false;
			return;
		}

		// Reset locationUnavailable if we have valid coordinates
		locationUnavailable = false;

		try {
			isLoading = true;
			error = null;

			const response = await fetch(
				`/api/law-firms/nearby?lat=${$location.latitude}&lng=${$location.longitude}`
			);

			if (!response.ok) {
				throw new Error('Failed to fetch law firms');
			}

			const data = await response.json();

			// Map database response to component format
			firms = data.firms.map((firm) => {
				// Get URL-friendly city name
				const cityUrl = cityNameToUrl(firm.city);

				return {
					id: firm.place_id,
					name: firm.display_name || firm.firm_name,
					slug: firm.slug,
					city: firm.city,
					state: firm.state,
					cityUrl: cityUrl,
				stateUrl: firm.state.toLowerCase(),
				location: `${firm.city}, ${firm.state}`,
					description: firm.short_description || 'Experienced personal injury attorney dedicated to fighting for your rights and maximizing your compensation.',
					practiceAreas: firm.practice_areas || ['Personal Injury', 'Auto Accidents'],
					rating: firm.rating || 0,
					reviews: firm.review_count || 0,
					distance: firm.distance_miles
				};
			});

			radiusUsed = data.radius_used;
		} catch (err) {
			console.error('Error fetching law firms:', err);
			error = err.message;
			firms = [];
		} finally {
			isLoading = false;
		}
	}

	// Fetch firms when location becomes available
	$effect(() => {
		if ($location.hasLocation && $location.latitude && $location.longitude) {
			fetchNearbyFirms();
		}
	});

	function scrollLeft() {
		if (scrollContainer) {
			const cardWidth = scrollContainer.querySelector('.firm-card').offsetWidth + 20;
			scrollContainer.scrollBy({ left: -cardWidth, behavior: 'smooth' });
			currentIndex = Math.max(0, currentIndex - 1);
		}
	}

	function scrollRight() {
		if (scrollContainer) {
			const cardWidth = scrollContainer.querySelector('.firm-card').offsetWidth + 20;
			scrollContainer.scrollBy({ left: cardWidth, behavior: 'smooth' });
			currentIndex = Math.min(firms.length - 1, currentIndex + 1);
		}
	}

	// Handle "See more in my area" button click
	function seeMoreInMyArea() {
		// Clear search location so the search page uses IP location
		searchLocation.clearSearchLocation();
		// Navigate to search page
		goto('/injury-law-firms');
	}

	// Star rating rendering is now handled by the StarRating component
	// Old renderStars function removed - see StarRating.svelte for implementation
</script>

<section class="law-firms">
	<div class="container">
		<h2>
			{#if $location.hasLocation}
				Top-rated law firms near <span class="location-highlight">{$location.city}, {$location.state}</span>
			{:else}
				Top-rated law firms
			{/if}
		</h2>
		<p class="subtitle">Trusted personal injury law firms with proven track records and satisfied clients.</p>

		{#if isLoading}
			<!-- Loading skeleton -->
			<div class="firms-carousel">
				{#each Array(4) as _, i}
					<div class="firm-card skeleton">
						<!-- Row 1: Logo, Name and Rating -->
						<div class="firm-header">
							<div class="skeleton-avatar"></div>
							<div style="display: flex; flex-direction: column; gap: 8px;">
								<div class="skeleton-text" style="width: 60%; height: 18px;"></div>
								<div class="skeleton-text" style="width: 120px; height: 16px;"></div>
							</div>
						</div>

						<!-- Row 3: AI Overview -->
						<div style="margin-bottom: 12px; min-height: 126px; display: flex; flex-direction: column;">
							<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
								<div class="skeleton-text" style="width: 20px; height: 20px; border-radius: 4px;"></div>
								<div class="skeleton-text" style="width: 100px; height: 12px;"></div>
							</div>
							<div class="skeleton-text" style="width: 100%; height: 14px; margin-bottom: 6px;"></div>
							<div class="skeleton-text" style="width: 95%; height: 14px; margin-bottom: 6px;"></div>
							<div class="skeleton-text" style="width: 100%; height: 14px; margin-bottom: 6px;"></div>
							<div class="skeleton-text" style="width: 90%; height: 14px; margin-bottom: 6px;"></div>
							<div class="skeleton-text" style="width: 70%; height: 14px;"></div>
						</div>

						<!-- Row 4: Location -->
						<div style="display: flex; align-items: center; gap: 6px; margin-bottom: 20px;">
							<div class="skeleton-text" style="width: 16px; height: 16px; border-radius: 4px;"></div>
							<div style="display: flex; gap: 12px;">
								<div class="skeleton-text" style="width: 100px; height: 16px;"></div>
								<div class="skeleton-text" style="width: 80px; height: 14px;"></div>
							</div>
						</div>

						<!-- Row 5: Footer -->
						<div class="firm-footer">
							<div class="skeleton-text" style="width: 100px; height: 16px;"></div>
						</div>
					</div>
				{/each}
			</div>
		{:else if error}
			<!-- Error state -->
			<div class="error-message">
				<p>Unable to load law firms at this time.</p>
				<button onclick={fetchNearbyFirms} class="retry-btn">
					Try again
				</button>
			</div>
		{:else if locationUnavailable}
			<!-- No location detected -->
			<div class="no-location">
				<p>We couldn't detect your location. Search for law firms in your area.</p>
				<button onclick={seeMoreInMyArea} class="search-btn">
					Search for law firms
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M5 12h14M12 5l7 7-7 7"/>
					</svg>
				</button>
			</div>
		{:else if firms.length === 0}
			<!-- No results -->
			<div class="no-results">
				<p>No law firms found nearby. Try searching a different location.</p>
				<button onclick={seeMoreInMyArea} class="search-btn">
					Search for law firms
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M5 12h14M12 5l7 7-7 7"/>
					</svg>
				</button>
			</div>
		{:else}
			<!-- Firms loaded successfully -->
			<div class="carousel-container">
				<div class="firms-carousel" bind:this={scrollContainer}>
					{#each firms as firm (firm.id)}
						<a href="/injury-law-firms/{firm.stateUrl}/{firm.cityUrl}/{firm.slug}" class="firm-card">
							<!-- Row 1: Logo, Name, and Rating -->
							<div class="firm-header">
								<div class="firm-avatar">
									{firm.name.charAt(0)}
								</div>
								<div class="firm-header-content">
									<h3>{firm.name}</h3>
									<div class="firm-rating">
										<StarRating rating={firm.rating} size={18} />
										<span class="rating-text">{firm.rating} ({firm.reviews} reviews)</span>
									</div>
								</div>
							</div>

							<!-- Row 3: AI Overview -->
							<div class="info-section">
								<div class="section-header">
									<img src="/stars-gradient-black.svg" alt="AI" class="section-icon" />
									<span class="section-title">OVERVIEW</span>
								</div>
								<p class="section-content">{firm.description}</p>
							</div>

							<!-- Row 4: Location -->
							<div class="firm-location">
								<img src="/map-pin-gray.svg" alt="Location" class="location-icon" />
								<span class="location-text">
									<span class="location-primary">{firm.city}, {firm.state}</span>
									<span class="location-distance">{firm.distance.toFixed(1)} miles away</span>
								</span>
							</div>

							<!-- Row 5: Footer with View Profile Link -->
							<div class="firm-footer">
								<span class="view-profile-link">
									View profile
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M5 12h14M12 5l7 7-7 7"/>
									</svg>
								</span>
							</div>
						</a>
					{/each}
				</div>

				<div class="carousel-nav">
					<button class="carousel-button" onclick={scrollLeft} disabled={currentIndex === 0} aria-label="Previous law firm">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M15 18l-6-6 6-6"/>
						</svg>
					</button>
					<button class="carousel-button" onclick={scrollRight} disabled={currentIndex >= firms.length - 1} aria-label="Next law firm">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M9 18l6-6-6-6"/>
						</svg>
					</button>
				</div>
			</div>

			<div class="see-more">
				<p>Looking for more options? Discover additional law firms in your area.</p>
				<button onclick={seeMoreInMyArea} class="see-more-btn">
					See more in my area
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M5 12h14M12 5l7 7-7 7"/>
					</svg>
				</button>
			</div>
		{/if}
	</div>
</section>

<style>
	.law-firms {
		padding: 48px 20px;
		background: #ffffff;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	h2 {
		font-size: 30px;
		font-weight: 700;
		margin-bottom: 12px;
		text-align: left;
		color: #1a1a1a;
	}

	.location-highlight {
		background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		text-align: left;
		color: #666;
		font-size: 16px;
		margin-bottom: 20px;
	}

	.carousel-container {
		position: relative;
		margin: 0px;
		padding: 0px;
	}

	.firms-carousel {
		display: flex;
		gap: 20px;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		padding: 20px 10px;
		margin: 0px;
		scrollbar-width: none;
		-ms-overflow-style: none;
		align-items: stretch; /* Make all cards equal height */
	}

	.firms-carousel::-webkit-scrollbar {
		display: none;
	}

	.firm-card {
		background: white;
		border: none;
		border-radius: 16px;
		padding: 20px 20px 0 20px;
		width: calc(100vw - 100px);
		flex: 0 0 auto;
		scroll-snap-align: center;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
		transition: transform 0.2s, box-shadow 0.2s;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		text-decoration: none;
		color: inherit;
	}

	.firm-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0,0,0,0.22);
	}

	/* Row 1: Logo and Name */
	.firm-header {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0 12px;
		margin-bottom: 12px;
	}

	.firm-header-content {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
		padding-top: 6px;
	}

	.firm-avatar {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		grid-row: 1 / 3;
		background: #1a1a1a;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		font-weight: bold;
		flex-shrink: 0;
	}

	.firm-header h3 {
		font-size: 18px;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0;
		flex: 1;
	}

	/* Row 2: Rating */
	.firm-rating {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 20px;
		margin-top: 6px;
	}

	.stars {
		font-size: 18px;
		display: inline-flex;
		gap: 2px;
	}

	.star {
		line-height: 1;
	}

	.star-full {
		color: #FFA500;
	}

	.star-half {
		color: #FFA500;
	}

	.star-empty {
		color: #d0d0d0;
	}

	.rating-text {
		font-size: 14px;
		color: #FFA500;
		font-weight: 500;
		line-height: 1;
	}

	/* Row 4: Location */
	.firm-location {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 20px;
	}

	.location-icon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}

	.location-text {
		display: inline;
	}

	.location-primary {
		font-size: 16px;
		font-weight: 600;
		color: #1a1a1a;
	}

	.location-distance {
		font-size: 14px;
		font-weight: 400;
		color: #6b7280;
		margin-left: 12px;
	}

	/* Row 3: AI Overview */
	.info-section {
		margin-bottom: 12px;
		min-height: 126px; /* Minimum height for consistent layout */
		flex: 1; /* Grow to fill available space, pushing location to bottom */
		display: flex;
		flex-direction: column;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
		flex-shrink: 0;
	}

	.section-icon {
		width: 20px;
		height: 20px;
		flex-shrink: 0;
		object-fit: contain;
	}

	.section-title {
		font-size: 12px;
		font-weight: 600;
		color: #999;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.section-content {
		color: #666666;
		font-size: 14px;
		font-weight: 400;
		line-height: 1.6;
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Row 5: Footer */
	.firm-footer {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 12px;
		margin: auto -20px 0 -20px;
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

	.firm-footer:hover .view-profile-link,
	.firm-card:hover .view-profile-link {
		color: #FF6800;
	}

	.view-profile-link svg {
		width: 16px;
		height: 16px;
		transition: transform 0.2s;
	}

	.firm-footer:hover .view-profile-link svg,
	.firm-card:hover .view-profile-link svg {
		transform: translateX(4px);
	}

	.carousel-nav {
		display: none;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 16px;
	}

	.carousel-button {
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 50%;
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 2px 8px rgba(0,0,0,0.08);
	}

	.carousel-button:hover:not(:disabled) {
		background: #f8f9fa;
		border-color: #FF7B00;
		color: #FF7B00;
	}

	.carousel-button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.see-more {
		text-align: center;
		margin-top: 32px;
	}

	.see-more p {
		font-size: 18px;
		color: #1a1a1a;
		margin-bottom: 20px;
	}

	.see-more-btn {
		padding: 16px 32px;
		background: linear-gradient(135deg, #FF6800 0%, #FFA500 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		box-shadow: 0 4px 15px rgba(255, 104, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
		text-decoration: none;
		line-height: 1.5;
	}

	.see-more-btn:hover {
		background: linear-gradient(135deg, #FF8000 0%, #FFB733 100%);
		box-shadow: 0 6px 25px rgba(255, 104, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15);
	}

	.see-more-btn svg {
		transition: transform 0.2s;
	}

	.see-more-btn:hover svg {
		transform: translateX(4px);
	}

	@media (min-width: 768px) {
		h2 {
			font-size: 30px;
		}

		.firm-card {
			width: 350px;
			min-width: 350px;
			max-width: 350px;
		}

		.carousel-nav {
			display: flex;
		}
	}

	@media (min-width: 1024px) {
		.law-firms {
			padding: 64px 20px;
		}

		h2 {
			font-size: 30px;
		}
	}

	/* Loading skeleton styles */
	.skeleton {
		pointer-events: none;
	}

	.skeleton-avatar {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: loading 1.5s ease-in-out infinite;
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

	/* Error, no location, and no results styles */
	.error-message,
	.no-location,
	.no-results {
		text-align: center;
		padding: 60px 20px;
		color: #666;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}

	.error-message p,
	.no-location p,
	.no-results p {
		font-size: 16px;
		margin: 0;
	}

	.search-btn {
		padding: 14px 28px;
		background: linear-gradient(135deg, #FF6800 0%, #FFA500 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		box-shadow: 0 4px 15px rgba(255, 104, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.search-btn:hover {
		background: linear-gradient(135deg, #FF8000 0%, #FFB733 100%);
		box-shadow: 0 6px 25px rgba(255, 104, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15);
	}

	.retry-btn {
		padding: 12px 24px;
		background: white;
		color: #1a1a1a;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.retry-btn:hover {
		background: #f8f9fa;
		border-color: #FF7B00;
		color: #FF7B00;
	}
</style>
