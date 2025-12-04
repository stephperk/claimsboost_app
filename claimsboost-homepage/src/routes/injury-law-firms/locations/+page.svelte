<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { goto } from '$app/navigation';
	import { searchLocation } from '$lib/stores/searchLocationStore.js';
	import { onMount } from 'svelte';

	// Receive data from server load function
	let { data } = $props();

	// Handle hash scrolling after page load (fixes cross-page navigation)
	onMount(() => {
		if (window.location.hash) {
			const id = window.location.hash.slice(1);
			const element = document.getElementById(id);
			if (element) {
				// Small delay to ensure layout is complete
				setTimeout(() => {
					element.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}, 100);
			}
		}
	});

	function navigateToCity(city, stateAbbr) {
		// Set the search location with pre-geocoded coordinates (matching Header behavior)
		searchLocation.setSearchLocation({
			city: city.name,
			state: stateAbbr,
			latitude: city.lat,
			longitude: city.lng,
			zipCode: null,
			formatted: `${city.name}, ${stateAbbr}`
		});

		// Navigate to search page with location in URL and coordinates ready
		goto(`/injury-law-firms?location=${encodeURIComponent(`${city.name}, ${stateAbbr}`)}`);
	}
</script>

<svelte:head>
	<title>Find Injury Law Firms by Location - ClaimsBoost</title>
	<meta
		name="description"
		content="Find personal injury lawyers by state and city across the United States. Search for experienced attorneys in your area."
	/>
</svelte:head>

<div class="page-wrapper">
	<Header />

	<main class="locations-page">
		<div class="container">
			<div class="page-header">
				<h1>Find Injury Law Firms by Location</h1>
				<p class="page-description">
					Browse personal injury attorneys by state and city across the United States. Click on
					any city to find qualified law firms in your area.
				</p>
			</div>

			{#if data.citiesByState && data.citiesByState.length > 0}
				<!-- Quick State Navigation -->
				<div class="state-navigation">
					<h2 class="nav-header">Jump to State:</h2>
					<div class="state-pills">
						{#each data.citiesByState as state}
							<a href="#{state.stateAbbr}" class="state-pill">
								{state.stateAbbr}
							</a>
						{/each}
					</div>
				</div>
				<div class="states-container">
					{#each data.citiesByState as state}
						<section class="state-section" id={state.stateAbbr}>
							<h2 class="state-header">{state.stateName}</h2>
							<div class="cities-grid">
								{#each state.cities as city}
									<button
										type="button"
										class="city-card"
										onclick={() => navigateToCity(city, state.stateAbbr)}
									>
										<div class="city-name">{city.name}</div>
										<div class="city-state">{state.stateAbbr}</div>
									</button>
								{/each}
							</div>
						</section>
					{/each}
				</div>
			{:else}
				<div class="loading-message">
					<p>Loading cities...</p>
				</div>
			{/if}
		</div>
	</main>

	<Footer />
</div>

<style>
	/* Smooth scrolling for anchor links */
	:global(html) {
		scroll-behavior: smooth;
	}

	.page-wrapper {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.locations-page {
		flex: 1;
		padding: 80px 20px 60px;
		background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	.page-header {
		text-align: center;
		margin-bottom: 48px;
	}

	.page-header h1 {
		font-size: 36px;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 16px;
	}

	.page-description {
		font-size: 18px;
		color: #666;
		line-height: 1.6;
		max-width: 700px;
		margin: 0 auto;
	}

	.state-navigation {
		background: white;
		border-radius: 16px;
		padding: 32px;
		margin-bottom: 48px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.nav-header {
		font-size: 20px;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 20px;
		text-align: center;
	}

	.state-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: center;
		align-items: center;
	}

	.state-pill {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 10px 16px;
		background: #f8f9fa;
		border: 2px solid transparent;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		color: #1a1a1a;
		text-decoration: none;
		transition: all 0.2s ease;
		cursor: pointer;
		min-width: 48px;
	}

	.state-pill:hover {
		background: white;
		border-color: #FF7B00;
		color: #FF7B00;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(255, 123, 0, 0.15);
	}

	.state-pill:active {
		transform: translateY(0);
	}

	.states-container {
		display: flex;
		flex-direction: column;
		gap: 48px;
	}

	.state-section {
		background: white;
		border-radius: 16px;
		padding: 32px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.state-header {
		font-size: 28px;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 24px;
		padding-bottom: 16px;
		border-bottom: 3px solid #FF7B00;
	}

	.cities-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 12px;
	}

	.city-card {
		background: #f8f9fa;
		border: 2px solid transparent;
		border-radius: 10px;
		padding: 16px;
		text-align: left;
		cursor: pointer;
		transition: all 0.3s ease;
		font-family: inherit;
		width: 100%;
	}

	.city-card:hover {
		border-color: #FF7B00;
		background: white;
		box-shadow: 0 4px 12px rgba(255, 123, 0, 0.15);
		transform: translateY(-2px);
	}

	.city-card:active {
		transform: translateY(0);
	}

	.city-name {
		font-size: 16px;
		font-weight: 600;
		color: #1a1a1a;
		margin-bottom: 4px;
	}

	.city-state {
		font-size: 13px;
		color: #666;
		font-weight: 500;
	}

	.loading-message {
		text-align: center;
		padding: 60px 20px;
		font-size: 18px;
		color: #666;
	}

	/* Tablet */
	@media (max-width: 768px) {
		.locations-page {
			padding: 60px 16px 40px;
		}

		.page-header h1 {
			font-size: 28px;
		}

		.page-description {
			font-size: 16px;
		}

		.state-navigation {
			padding: 24px;
			margin-bottom: 32px;
		}

		.nav-header {
			font-size: 18px;
			margin-bottom: 16px;
		}

		.state-pill {
			padding: 8px 14px;
			font-size: 13px;
			min-width: 44px;
		}

		.states-container {
			gap: 32px;
		}

		.state-section {
			padding: 24px;
		}

		.state-header {
			font-size: 24px;
			margin-bottom: 20px;
			padding-bottom: 12px;
		}

		.cities-grid {
			grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
			gap: 10px;
		}

		.city-card {
			padding: 14px;
		}

		.city-name {
			font-size: 15px;
		}
	}

	/* Mobile */
	@media (max-width: 480px) {
		.locations-page {
			padding: 40px 12px 32px;
		}

		.page-header {
			margin-bottom: 32px;
		}

		.page-header h1 {
			font-size: 24px;
		}

		.page-description {
			font-size: 15px;
		}

		.state-navigation {
			padding: 20px;
			margin-bottom: 24px;
		}

		.nav-header {
			font-size: 16px;
			margin-bottom: 14px;
		}

		.state-pills {
			gap: 8px;
		}

		.state-pill {
			padding: 8px 12px;
			font-size: 12px;
			min-width: 40px;
		}

		.states-container {
			gap: 24px;
		}

		.state-section {
			padding: 20px;
			border-radius: 12px;
		}

		.state-header {
			font-size: 20px;
			margin-bottom: 16px;
			padding-bottom: 10px;
		}

		.cities-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 8px;
		}

		.city-card {
			padding: 12px;
		}

		.city-name {
			font-size: 14px;
		}

		.city-state {
			font-size: 12px;
		}
	}
</style>
