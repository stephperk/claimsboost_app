<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { goto } from '$app/navigation';
	import { searchLocation } from '$lib/stores/searchLocationStore.js';

	const popularCities = [
		{ name: 'New York', state: 'NY' },
		{ name: 'Los Angeles', state: 'CA' },
		{ name: 'Chicago', state: 'IL' },
		{ name: 'Houston', state: 'TX' },
		{ name: 'Phoenix', state: 'AZ' },
		{ name: 'Philadelphia', state: 'PA' },
		{ name: 'San Antonio', state: 'TX' },
		{ name: 'San Diego', state: 'CA' },
		{ name: 'Dallas', state: 'TX' },
		{ name: 'San Jose', state: 'CA' },
		{ name: 'Austin', state: 'TX' },
		{ name: 'Jacksonville', state: 'FL' },
		{ name: 'Fort Worth', state: 'TX' },
		{ name: 'Columbus', state: 'OH' },
		{ name: 'Charlotte', state: 'NC' },
		{ name: 'Indianapolis', state: 'IN' },
		{ name: 'San Francisco', state: 'CA' },
		{ name: 'Seattle', state: 'WA' },
		{ name: 'Denver', state: 'CO' },
		{ name: 'Washington', state: 'DC' },
		{ name: 'Boston', state: 'MA' },
		{ name: 'El Paso', state: 'TX' },
		{ name: 'Nashville', state: 'TN' },
		{ name: 'Detroit', state: 'MI' },
		{ name: 'Oklahoma City', state: 'OK' },
		{ name: 'Portland', state: 'OR' },
		{ name: 'Las Vegas', state: 'NV' },
		{ name: 'Memphis', state: 'TN' },
		{ name: 'Louisville', state: 'KY' },
		{ name: 'Baltimore', state: 'MD' },
		{ name: 'Milwaukee', state: 'WI' },
		{ name: 'Albuquerque', state: 'NM' },
		{ name: 'Tucson', state: 'AZ' },
		{ name: 'Fresno', state: 'CA' },
		{ name: 'Sacramento', state: 'CA' },
		{ name: 'Kansas City', state: 'MO' },
		{ name: 'Mesa', state: 'AZ' },
		{ name: 'Atlanta', state: 'GA' },
		{ name: 'Omaha', state: 'NE' },
		{ name: 'Colorado Springs', state: 'CO' },
		{ name: 'Raleigh', state: 'NC' },
		{ name: 'Miami', state: 'FL' },
		{ name: 'Long Beach', state: 'CA' },
		{ name: 'Virginia Beach', state: 'VA' },
		{ name: 'Oakland', state: 'CA' },
		{ name: 'Minneapolis', state: 'MN' },
		{ name: 'Tulsa', state: 'OK' },
		{ name: 'Tampa', state: 'FL' },
		{ name: 'Arlington', state: 'TX' },
		{ name: 'New Orleans', state: 'LA' }
	];

	function navigateToCity(city) {
		searchLocation.setSearchLocation({
			city: city.name,
			state: city.state,
			latitude: null,
			longitude: null,
			zipCode: null,
			formatted: `${city.name}, ${city.state}`
		});
		goto('/search');
	}
</script>

<svelte:head>
	<title>Find Injury Law Firms by City - ClaimsBoost</title>
	<meta name="description" content="Find personal injury lawyers in major cities across the United States. Search for experienced attorneys in your area." />
</svelte:head>

<div class="page-wrapper">
	<Header />

	<main class="cities-page">
		<div class="container">
			<div class="page-header">
				<h1>Find Injury Law Firms by City</h1>
				<p class="page-description">
					Search for experienced personal injury attorneys in major cities across the United States.
					Click on any city to find qualified law firms in your area.
				</p>
			</div>

			<div class="cities-grid">
				{#each popularCities as city}
					<button type="button" class="city-card" onclick={() => navigateToCity(city)}>
						<div class="city-name">{city.name}</div>
						<div class="state-name">{city.state}</div>
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

	.cities-page {
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

	.cities-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 16px;
	}

	.city-card {
		background: white;
		border: 2px solid #e5e7eb;
		border-radius: 12px;
		padding: 24px;
		text-align: left;
		cursor: pointer;
		transition: all 0.3s ease;
		font-family: inherit;
		width: 100%;
	}

	.city-card:hover {
		border-color: #FF7B00;
		box-shadow: 0 4px 12px rgba(255, 123, 0, 0.15);
		transform: translateY(-2px);
	}

	.city-card:active {
		transform: translateY(0);
	}

	.city-name {
		font-size: 20px;
		font-weight: 600;
		color: #1a1a1a;
		margin-bottom: 4px;
	}

	.state-name {
		font-size: 14px;
		color: #666;
		font-weight: 500;
	}

	/* Tablet */
	@media (max-width: 768px) {
		.cities-page {
			padding: 60px 16px 40px;
		}

		.page-header h1 {
			font-size: 28px;
		}

		.page-description {
			font-size: 16px;
		}

		.cities-grid {
			grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
			gap: 12px;
		}

		.city-card {
			padding: 20px;
		}

		.city-name {
			font-size: 18px;
		}
	}

	/* Mobile */
	@media (max-width: 480px) {
		.cities-page {
			padding: 40px 12px 32px;
		}

		.page-header h1 {
			font-size: 24px;
		}

		.page-description {
			font-size: 15px;
		}

		.cities-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 10px;
		}

		.city-card {
			padding: 16px;
		}

		.city-name {
			font-size: 16px;
		}

		.state-name {
			font-size: 13px;
		}
	}
</style>
