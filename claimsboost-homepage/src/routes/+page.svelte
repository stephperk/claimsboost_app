<script>
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import RecentSettlements from '$lib/components/RecentSettlements.svelte';
	import SettlementRanges from '$lib/components/SettlementRanges.svelte';
	import LawFirms from '$lib/components/LawFirms.svelte';
	import FAQ from '$lib/components/FAQ.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { fetchLocation } from '$lib/stores/locationStore.js';

	// Fetch user location on page load
	onMount(async () => {
		await fetchLocation();
	});
</script>

<div class="app">
	<Header />
	<main>
		<Hero />

		<!-- Stats Banner -->
		<section class="stats-banner">
			<div class="banner-content">
				<p class="headline">
					Search <span class="highlight-number">5,000+</span> law firms representing over <span class="highlight-number">$5B</span> recovered
				</p>
			</div>
		</section>

		<LawFirms />
		<RecentSettlements />
		<SettlementRanges />
		<FAQ />
	</main>
	<Footer />
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	main {
		flex: 1;
	}

	/* Stats Banner */
	.stats-banner {
		background: #f9f9f9;
		padding: 32px 20px;
		text-align: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		position: relative;
		z-index: 10;
	}

	.banner-content {
		max-width: 1200px;
		margin: 0 auto;
	}

	.headline {
		font-size: 20px;
		color: #1a1a1a;
		font-weight: 500;
		line-height: 1.6;
		margin: 0;
	}

	.highlight-number {
		font-size: 48px;
		font-weight: 700;
		background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		display: inline-block;
		vertical-align: middle;
		line-height: 1;
		margin: 0 8px;
		position: relative;
		top: -8px;
		padding-bottom: 8px;
	}

	.highlight-number::after {
		content: '';
		position: absolute;
		bottom: 6px;
		left: 0;
		right: 0;
		height: 6px;
		background: linear-gradient(90deg, #bfdbfe 0%, #93c5fd 100%);
		border-radius: 3px;
	}

	@media (max-width: 768px) {
		.stats-banner {
			display: none;
		}
	}
</style>
