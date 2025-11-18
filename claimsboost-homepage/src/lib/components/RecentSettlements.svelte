<script>
	import { goto } from '$app/navigation';
	import { location } from '$lib/stores/locationStore.js';
	import SettlementCard from '$lib/components/SettlementCard.svelte';

	const settlements = [
		{
			type: 'Rear-end car accident',
			amount: 85000,
			location: 'Raleigh, NC',
			year: 2023,
			description: 'Whiplash and back injury from highway collision. Medical bills and lost wages covered.',
			similarCases: 'Similar cases in your area: 23',
			practiceArea: 'Vehicle Accidents',
			lawFirm: 'Smith & Associates Law Firm',
			firmUrl: '/injury-law-firms/nc/raleigh/smith-associates'
		},
		{
			type: 'Slip & fall at store',
			amount: 125000,
			location: 'Raleigh, NC',
			year: 2023,
			description: 'Whiplash and back injury from highway collision. Medical bills and lost wages covered.',
			similarCases: 'Similar cases in your area: 23',
			practiceArea: 'Premises Liability',
			lawFirm: 'Johnson Legal Group',
			firmUrl: '/injury-law-firms/nc/raleigh/johnson-legal'
		},
		{
			type: 'Workplace injury',
			amount: 240000,
			location: 'Raleigh, NC',
			year: 2023,
			description: 'Whiplash and back injury from highway collision. Medical bills and lost wages covered.',
			similarCases: 'Similar cases in your area: 23',
			practiceArea: 'Workplace Injuries',
			lawFirm: 'Davis Injury Attorneys',
			firmUrl: '/injury-law-firms/nc/raleigh/davis-injury'
		},
		{
			type: 'Rear-end car accident',
			amount: 85000,
			location: 'Raleigh, NC',
			year: 2023,
			description: 'Whiplash and back injury from highway collision. Medical bills and lost wages covered.',
			similarCases: 'Similar cases in your area: 23',
			practiceArea: 'Vehicle Accidents',
			lawFirm: 'Williams & Partners',
			firmUrl: '/injury-law-firms/nc/raleigh/williams-partners'
		},
		{
			type: 'Slip & fall at store',
			amount: 125000,
			location: 'Raleigh, NC',
			year: 2023,
			description: 'Whiplash and back injury from highway collision. Medical bills and lost wages covered.',
			similarCases: 'Similar cases in your area: 23',
			practiceArea: 'Premises Liability',
			lawFirm: 'Miller Law Office',
			firmUrl: '/injury-law-firms/nc/raleigh/miller-law'
		},
		{
			type: 'Workplace injury',
			amount: 240000,
			location: 'Raleigh, NC',
			year: 2023,
			description: 'Whiplash and back injury from highway collision. Medical bills and lost wages covered.',
			similarCases: 'Similar cases in your area: 23',
			practiceArea: 'Workplace Injuries',
			lawFirm: 'Anderson & Brown LLP',
			firmUrl: '/injury-law-firms/nc/raleigh/anderson-brown'
		}
	];
</script>

<section class="settlements">
	<div class="container">
		<h2>
			{#if $location.hasLocation}
				Recent settlements near <span class="location-highlight">{$location.city}, {$location.state}</span>
			{:else}
				Recent settlements
			{/if}
		</h2>
		<p class="subtitle">Real settlement amounts from personal injury cases in your area.</p>

		<div class="settlements-grid">
			{#each settlements as settlement}
				<SettlementCard {settlement} matchingCriteria={[]} />
			{/each}
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
		padding: 32px 0;
		background: transparent;
	}

	.cta-section p {
		font-size: 18px;
		color: #666;
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
		}

		.settlements {
			padding: 64px 20px;
		}

		h2 {
			font-size: 30px;
		}
	}
</style>