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
		<RecentSettlements />
		<LawFirms />
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
</style>
