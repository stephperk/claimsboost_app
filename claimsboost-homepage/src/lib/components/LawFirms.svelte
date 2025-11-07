<script>
	import { onMount } from 'svelte';
	import { location } from '$lib/stores/locationStore.js';

	let scrollContainer = $state(null);
	let currentIndex = $state(0);
	let firms = $state([]);
	let isLoading = $state(true);
	let error = $state(null);
	let radiusUsed = $state(50);

	// Fetch law firms based on user location
	async function fetchNearbyFirms() {
		// Wait for location to be available with valid coordinates
		if (!$location.hasLocation || !$location.latitude || !$location.longitude) {
			isLoading = false;
			return;
		}

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
			firms = data.firms.map((firm) => ({
				id: firm.place_id,
				name: firm.firm_name,
				location: `${firm.city}, ${firm.state}`,
				description: 'Experienced personal injury attorney dedicated to fighting for your rights and maximizing your compensation.',
				practiceAreas: firm.practice_areas || ['Personal Injury', 'Auto Accidents'],
				rating: firm.rating || 0,
				reviews: firm.review_count || 0,
				distance: firm.distance_miles
			}));

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

	function renderStars(rating) {
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 >= 0.5;
		let stars = [];

		for (let i = 0; i < fullStars; i++) {
			stars.push('★');
		}
		if (hasHalfStar) {
			stars.push('☆');
		}

		return stars.join('');
	}
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
						<div class="firm-header">
							<div class="skeleton-avatar"></div>
							<div style="flex: 1;">
								<div class="skeleton-text" style="width: 60%; height: 18px; margin-bottom: 8px;"></div>
								<div class="skeleton-text" style="width: 40%; height: 14px;"></div>
							</div>
						</div>
						<div class="skeleton-text" style="width: 100%; height: 14px; margin-bottom: 8px;"></div>
						<div class="skeleton-text" style="width: 85%; height: 14px; margin-bottom: 16px;"></div>
						<div style="display: flex; gap: 6px; margin-bottom: 16px;">
							<div class="skeleton-text" style="width: 80px; height: 24px; border-radius: 16px;"></div>
							<div class="skeleton-text" style="width: 100px; height: 24px; border-radius: 16px;"></div>
						</div>
						<div class="skeleton-text" style="width: 120px; height: 18px; margin-bottom: 16px;"></div>
						<div class="skeleton-text" style="width: 100%; height: 40px; border-radius: 8px;"></div>
					</div>
				{/each}
			</div>
		{:else if error}
			<!-- Error state -->
			<div class="error-message">
				<p>Unable to load law firms at this time. Please try again later.</p>
			</div>
		{:else if firms.length === 0}
			<!-- No results -->
			<div class="no-results">
				<p>No law firms found in your area. Try searching for a specific location.</p>
			</div>
		{:else}
			<!-- Firms loaded successfully -->
			<div class="carousel-container">
				<button class="carousel-button carousel-button-left" onclick={scrollLeft} disabled={currentIndex === 0} aria-label="Previous law firm">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M15 18l-6-6 6-6"/>
					</svg>
				</button>

				<div class="firms-carousel" bind:this={scrollContainer}>
					{#each firms as firm (firm.id)}
						<div class="firm-card">
							<div class="firm-header">
								<div class="firm-avatar">
									{firm.name.charAt(0)}
								</div>
								<div>
									<h3>{firm.name}</h3>
									<p class="firm-location">{firm.location}</p>
								</div>
							</div>

							<p class="firm-description">
								<span class="ai-label">
									<img src="/ai_icon_star_brand.png" alt="AI" class="ai-icon" />
									AI Summary:
								</span> {firm.description}
							</p>

							<div class="practice-areas">
								{#each firm.practiceAreas as area}
									<span class="practice-tag">{area}</span>
								{/each}
							</div>

							<div class="firm-rating">
								<span class="stars">{renderStars(firm.rating)}</span>
								<span class="rating-text">{firm.rating} ({firm.reviews} reviews)</span>
							</div>

							<button class="view-profile-btn">View firm profile</button>
						</div>
					{/each}
				</div>

				<button class="carousel-button carousel-button-right" onclick={scrollRight} disabled={currentIndex >= firms.length - 1} aria-label="Next law firm">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M9 18l6-6-6-6"/>
					</svg>
				</button>
			</div>

			<div class="see-more">
				<p>Looking for more options? Discover additional law firms in your area.</p>
				<a href="/search" class="see-more-btn">
					See more in my area
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M5 12h14M12 5l7 7-7 7"/>
					</svg>
				</a>
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
	}

	.firms-carousel::-webkit-scrollbar {
		display: none;
	}

	.firm-card {
		background: white;
		border: none;
		border-radius: 16px;
		padding: 20px;
		width: calc(100vw - 100px);
		flex: 0 0 auto;
		scroll-snap-align: center;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
		transition: transform 0.2s, box-shadow 0.2s;
		cursor: pointer;
	}

	.firm-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0,0,0,0.22);
	}

	.firm-header {
		display: flex;
		gap: 12px;
		margin-bottom: 16px;
	}

	.firm-avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		font-weight: bold;
		flex-shrink: 0;
	}

	.firm-header h3 {
		font-size: 18px;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0 0 4px;
	}

	.firm-location {
		font-size: 14px;
		color: #666;
		margin: 0;
	}

	.firm-description {
		color: #666;
		font-size: 14px;
		line-height: 1.5;
		margin-bottom: 16px;
	}

	.ai-label {
		font-weight: 600;
		color: #1a1a1a;
	}

	.ai-icon {
		width: 16px;
		height: 16px;
		display: inline-block;
		vertical-align: middle;
		margin-right: 4px;
		margin-top: -3px;
	}

	.practice-areas {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 16px;
	}

	.practice-tag {
		background: #f0f0f0;
		color: #666;
		padding: 4px 10px;
		border-radius: 16px;
		font-size: 12px;
	}

	.firm-rating {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 16px;
	}

	.stars {
		background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		font-size: 18px;
	}

	.rating-text {
		font-size: 14px;
		color: #666;
	}

	.view-profile-btn {
		width: 100%;
		padding: 12px;
		background: #1a1a1a;
		color: #ffffff;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.view-profile-btn:hover {
		background: #333333;
	}

	.carousel-button {
		display: none;
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 50%;
		width: 48px;
		height: 48px;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		z-index: 10;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
	}

	.carousel-button:hover:not(:disabled) {
		background: #f8f9fa;
		border-color: #FF7B00;
		color: #FF7B00;
	}

	.carousel-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.carousel-button-left {
		left: -24px;
	}

	.carousel-button-right {
		right: -24px;
	}

	.see-more {
		text-align: center;
		margin-top: 48px;
	}

	.see-more p {
		font-size: 18px;
		color: #666;
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

	@media (min-width: 768px) {
		h2 {
			font-size: 30px;
		}

		.firm-card {
			width: 350px;
			min-width: 350px;
			max-width: 350px;
		}

		.carousel-button {
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
		width: 48px;
		height: 48px;
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

	/* Error and no results styles */
	.error-message,
	.no-results {
		text-align: center;
		padding: 60px 20px;
		color: #666;
	}

	.error-message p,
	.no-results p {
		font-size: 16px;
		margin: 0;
	}
</style>