<script>
	import { goto } from '$app/navigation';
	import { location } from '$lib/stores/locationStore.js';
	import SettlementCard from '$lib/components/SettlementCard.svelte';
	import { onMount } from 'svelte';

	let settlements = [];
	let loading = true;
	let error = null;

	async function fetchSettlements() {
		try {
			loading = true;
			error = null;

			const response = await fetch('/api/settlements/recent?limit=6');
			const data = await response.json();

			if (data.error) {
				throw new Error(data.error);
			}

			// Transform API data to component format
			settlements = data.settlements.map(s => {
				// Convert state to lowercase and city to URL-friendly format
				const stateUrl = s.firm_state?.toLowerCase() || '';
				const cityUrl = s.firm_city?.toLowerCase().replace(/\s+/g, '-') || '';

				return {
					type: s.display_title || s.injury_cause || 'Personal Injury',
					amount: s.amount,
					location: s.firm_city && s.firm_state ? `${s.firm_city}, ${s.firm_state}` : 'Location not specified',
					year: new Date().getFullYear(), // Default to current year
					description: s.display_summary || 'Settlement details available.',
					similarCases: 'Similar cases in your area: 23', // Placeholder for now
					practiceArea: s.primary_practice_area || 'Personal Injury',
					lawFirm: s.firm_display_name || s.firm_name || 'Law Firm',
					firmUrl: s.firm_slug && stateUrl && cityUrl
						? `/injury-law-firms/${stateUrl}/${cityUrl}/${s.firm_slug}`
						: '#',
					websiteUrl: s.firm_website
				};
			});
		} catch (err) {
			console.error('Failed to fetch settlements:', err);
			error = err.message;
			settlements = [];
		} finally {
			loading = false;
		}
	}

	function browseSettlements() {
		goto('/injury-law-firms/practice-areas');
	}

	onMount(() => {
		fetchSettlements();
	});
</script>

<section class="settlements">
	<div class="container">
		<h2>
			{#if $location.hasLocation}
				Top settlements from firms near <span class="location-highlight">{$location.city}, {$location.state}</span>
			{:else}
				Top settlements from firms
			{/if}
		</h2>
		<p class="subtitle">Real settlement amounts from personal injury cases in your area.</p>

		<div class="settlements-grid">
			{#if loading}
				<!-- Show skeleton cards while loading -->
				{#each Array(6) as _, i}
					<div class="skeleton-card">
						<div class="skeleton skeleton-title"></div>
						<div class="skeleton skeleton-amount"></div>
						<div class="skeleton skeleton-text"></div>
						<div class="skeleton skeleton-text"></div>
					</div>
				{/each}
			{:else if error}
				<!-- Error state with retry CTA -->
				<div class="error-message">
					<p>Unable to load settlements at this time.</p>
					<button onclick={fetchSettlements} class="retry-btn">
						Try again
					</button>
				</div>
			{:else if settlements.length === 0}
				<!-- No results state -->
				<div class="no-results">
					<p>No settlements found. Browse settlements by practice area.</p>
					<button onclick={browseSettlements} class="browse-btn">
						Browse settlements
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M5 12h14M12 5l7 7-7 7"/>
						</svg>
					</button>
				</div>
			{:else}
				<!-- Show settlements -->
				{#each settlements as settlement}
					<SettlementCard {settlement} matchingCriteria={[]} />
				{/each}
			{/if}
		</div>

		<div class="cta-section">
			<p>Don't settle for less than you deserve. Find out what your case could be worth.</p>
			<button class="cta-button" onclick={() => goto('/get-started')}>
				Get my free estimate
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M5 12h14M12 5l7 7-7 7"/>
				</svg>
			</button>
		</div>
	</div>
</section>

<style>
	.settlements {
		padding: 32px 20px;
		background: #f9f9f9;
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

	.subtitle {
		text-align: left;
		color: #666;
		font-size: 16px;
		margin-bottom: 40px;
	}

	.location-highlight {
		background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.settlements-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
		margin-bottom: 32px;
	}

	.cta-section {
		text-align: center;
		padding: 32px 0 0;
		background: transparent;
	}

	.cta-section p {
		font-size: 18px;
		color: #1a1a1a;
		margin-bottom: 20px;
	}

	.cta-button {
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
		line-height: 1.5;
		font-family: inherit;
	}

	.cta-button:hover {
		background: linear-gradient(135deg, #FF8000 0%, #FFB733 100%);
		box-shadow: 0 6px 25px rgba(255, 104, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15);
	}

	.cta-button svg {
		transition: transform 0.2s;
	}

	.cta-button:hover svg {
		transform: translateX(4px);
	}

	@media (min-width: 768px) {
		.settlements-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		h2 {
			font-size: 30px;
		}
	}

	@media (min-width: 1024px) {
		.settlements-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 24px;
		}

		.settlements {
			padding: 64px 20px;
		}

		h2 {
			font-size: 30px;
		}
	}

	/* Skeleton loading styles */
	.skeleton-card {
		background: white;
		border-radius: 12px;
		padding: 20px;
		border: 1px solid #e5e5e5;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.skeleton {
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: loading 1.5s infinite;
		border-radius: 4px;
	}

	.skeleton-title {
		height: 24px;
		width: 70%;
		margin-bottom: 12px;
	}

	.skeleton-amount {
		height: 32px;
		width: 50%;
		margin-bottom: 16px;
	}

	.skeleton-text {
		height: 16px;
		width: 100%;
		margin-bottom: 8px;
	}

	.skeleton-text:last-child {
		width: 85%;
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
		grid-column: 1 / -1;
		text-align: center;
		padding: 60px 20px;
		color: #666;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}

	.error-message p,
	.no-results p {
		font-size: 16px;
		margin: 0;
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

	.browse-btn {
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

	.browse-btn:hover {
		background: linear-gradient(135deg, #FF8000 0%, #FFB733 100%);
		box-shadow: 0 6px 25px rgba(255, 104, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15);
	}
</style>