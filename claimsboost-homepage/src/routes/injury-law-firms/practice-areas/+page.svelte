<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { goto } from '$app/navigation';
	import { searchLocation } from '$lib/stores/searchLocationStore.js';
	import { location } from '$lib/stores/locationStore.js';

	const practiceAreas = [
		{ name: 'Auto Accidents', icon: '🚗', description: 'Car, truck, and motorcycle collisions' },
		{ name: 'Motorcycle Accidents', icon: '🏍️', description: 'Motorcycle crash injuries and claims' },
		{ name: 'Truck Accidents', icon: '🚚', description: 'Commercial vehicle and semi-truck collisions' },
		{ name: 'Slip & Fall', icon: '⚠️', description: 'Premises liability and property accidents' },
		{ name: 'Medical Malpractice', icon: '🏥', description: 'Healthcare provider negligence' },
		{ name: 'Workplace Injury', icon: '🏗️', description: 'On-the-job accidents and workers comp' },
		{ name: 'Dog Bites', icon: '🐕', description: 'Animal attack injuries' },
		{ name: 'Product Liability', icon: '📦', description: 'Defective product injuries' },
		{ name: 'Wrongful Death', icon: '💔', description: 'Fatal accident claims' },
		{ name: 'Brain Injury', icon: '🧠', description: 'Traumatic brain injuries (TBI)' },
		{ name: 'Spinal Cord Injury', icon: '🦴', description: 'Back and spinal cord damage' },
		{ name: 'Nursing Home Abuse', icon: '👴', description: 'Elder care facility negligence' },
		{ name: 'Birth Injury', icon: '👶', description: 'Labor and delivery complications' },
		{ name: 'Construction Accidents', icon: '🔨', description: 'Building site injuries' },
		{ name: 'Pedestrian Accidents', icon: '🚶', description: 'Injuries to pedestrians' },
		{ name: 'Bicycle Accidents', icon: '🚴', description: 'Cycling-related injuries' }
	];

	function navigateToPracticeArea(practiceArea) {
		const params = new URLSearchParams();
		params.set('practice_area', practiceArea);

		// Include user's location if available
		if ($searchLocation.hasLocation) {
			params.set('location', `${$searchLocation.city}, ${$searchLocation.state}`);
		} else if ($location.hasLocation) {
			searchLocation.setSearchLocation({
				city: $location.city,
				state: $location.state,
				latitude: $location.latitude,
				longitude: $location.longitude,
				zipCode: null,
				formatted: `${$location.city}, ${$location.state}`
			});
			params.set('location', `${$location.city}, ${$location.state}`);
		}

		goto(`/injury-law-firms?${params.toString()}`);
	}
</script>

<svelte:head>
	<title>Find Injury Law Firms by Practice Area - ClaimsBoost</title>
	<meta
		name="description"
		content="Find personal injury lawyers specializing in auto accidents, medical malpractice, workplace injuries, and more."
	/>
</svelte:head>

<div class="page-wrapper">
	<Header />

	<main class="practice-areas-page">
		<div class="container">
			<div class="page-header">
				<h1>Find Law Firms by Practice Area</h1>
				<p class="page-description">
					Browse personal injury attorneys by their area of expertise. Click on a practice area to find qualified lawyers near you.
				</p>
			</div>

			<div class="practice-areas-grid">
				{#each practiceAreas as area}
					<button class="practice-area-card" on:click={() => navigateToPracticeArea(area.name)}>
						<span class="area-icon">{area.icon}</span>
						<h3 class="area-name">{area.name}</h3>
						<p class="area-description">{area.description}</p>
					</button>
				{/each}
			</div>
		</div>
	</main>

	<Footer />
</div>

<style>
	.page-wrapper {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.practice-areas-page {
		flex: 1;
		padding: 40px 20px 80px;
		background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
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
		max-width: 600px;
		margin: 0 auto;
	}

	.practice-areas-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 24px;
	}

	.practice-area-card {
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 16px;
		padding: 32px 24px;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.practice-area-card:hover {
		border-color: #FF7B00;
		box-shadow: 0 8px 24px rgba(255, 123, 0, 0.15);
		transform: translateY(-2px);
	}

	.area-icon {
		font-size: 48px;
		margin-bottom: 16px;
	}

	.area-name {
		font-size: 20px;
		font-weight: 600;
		color: #1a1a1a;
		margin-bottom: 8px;
	}

	.area-description {
		font-size: 14px;
		color: #666;
		margin: 0;
	}

	@media (max-width: 768px) {
		.page-header h1 {
			font-size: 28px;
		}

		.page-description {
			font-size: 16px;
		}

		.practice-areas-grid {
			grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
			gap: 16px;
		}

		.practice-area-card {
			padding: 24px 16px;
		}

		.area-icon {
			font-size: 36px;
		}

		.area-name {
			font-size: 18px;
		}
	}
</style>
