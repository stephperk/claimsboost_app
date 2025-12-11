<script>
	import { goto } from '$app/navigation';
	import { searchLocation } from '$lib/stores/searchLocationStore.js';
	import { location } from '$lib/stores/locationStore.js';

	function handleLogin() {
		goto('/login');
	}

	let menuOpen = $state(false);
	let locationDropdownOpen = $state(false);
	let practiceAreaDropdownOpen = $state(false);

	const popularCities = [
		{ name: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060 },
		{ name: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
		{ name: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
		{ name: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698 },
		{ name: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740 },
		{ name: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652 },
		{ name: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936 },
		{ name: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611 },
		{ name: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970 },
		{ name: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863 },
		{ name: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431 },
		{ name: 'Jacksonville', state: 'FL', lat: 30.3322, lng: -81.6557 },
		{ name: 'Fort Worth', state: 'TX', lat: 32.7555, lng: -97.3308 },
		{ name: 'Columbus', state: 'OH', lat: 39.9612, lng: -82.9988 },
		{ name: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431 },
		{ name: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194 },
		{ name: 'Indianapolis', state: 'IN', lat: 39.7684, lng: -86.1581 },
		{ name: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
		{ name: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903 },
		{ name: 'Washington', state: 'DC', lat: 38.9072, lng: -77.0369 },
		{ name: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589 },
		{ name: 'El Paso', state: 'TX', lat: 31.7619, lng: -106.4850 },
		{ name: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816 },
		{ name: 'Detroit', state: 'MI', lat: 42.3314, lng: -83.0458 },
		{ name: 'Oklahoma City', state: 'OK', lat: 35.4676, lng: -97.5164 },
		{ name: 'Portland', state: 'OR', lat: 45.5152, lng: -122.6784 },
		{ name: 'Las Vegas', state: 'NV', lat: 36.1699, lng: -115.1398 },
		{ name: 'Memphis', state: 'TN', lat: 35.1495, lng: -90.0490 },
		{ name: 'Louisville', state: 'KY', lat: 38.2527, lng: -85.7585 },
		{ name: 'Baltimore', state: 'MD', lat: 39.2904, lng: -76.6122 },
		{ name: 'Milwaukee', state: 'WI', lat: 43.0389, lng: -87.9065 },
		{ name: 'Albuquerque', state: 'NM', lat: 35.0853, lng: -106.6056 },
		{ name: 'Tucson', state: 'AZ', lat: 32.2226, lng: -110.9747 },
		{ name: 'Fresno', state: 'CA', lat: 36.7378, lng: -119.7871 },
		{ name: 'Mesa', state: 'AZ', lat: 33.4152, lng: -111.8315 },
		{ name: 'Sacramento', state: 'CA', lat: 38.5816, lng: -121.4944 },
		{ name: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880 },
		{ name: 'Kansas City', state: 'MO', lat: 39.0997, lng: -94.5786 },
		{ name: 'Colorado Springs', state: 'CO', lat: 38.8339, lng: -104.8214 },
		{ name: 'Raleigh', state: 'NC', lat: 35.7796, lng: -78.6382 },
		{ name: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918 },
		{ name: 'Long Beach', state: 'CA', lat: 33.7701, lng: -118.1937 },
		{ name: 'Virginia Beach', state: 'VA', lat: 36.8529, lng: -75.9780 },
		{ name: 'Omaha', state: 'NE', lat: 41.2565, lng: -95.9345 },
		{ name: 'Oakland', state: 'CA', lat: 37.8044, lng: -122.2712 },
		{ name: 'Minneapolis', state: 'MN', lat: 44.9778, lng: -93.2650 },
		{ name: 'Tulsa', state: 'OK', lat: 36.1540, lng: -95.9928 },
		{ name: 'Tampa', state: 'FL', lat: 27.9506, lng: -82.4572 },
		{ name: 'Arlington', state: 'TX', lat: 32.7357, lng: -97.1081 },
		{ name: 'New Orleans', state: 'LA', lat: 29.9511, lng: -90.0715 }
	];

	function navigateToCity(city) {
		// Set the search location with pre-geocoded coordinates
		searchLocation.setSearchLocation({
			city: city.name,
			state: city.state,
			latitude: city.lat,
			longitude: city.lng,
			zipCode: null,
			formatted: `${city.name}, ${city.state}`
		});

		locationDropdownOpen = false;

		// Navigate to search page with location in URL and coordinates ready
		goto(`/injury-law-firms?location=${encodeURIComponent(`${city.name}, ${city.state}`)}`);
	}

	function navigateToPracticeArea(practiceArea) {
		// Close dropdown
		practiceAreaDropdownOpen = false;

		// Build URL with practice area
		const params = new URLSearchParams();
		params.set('practice_area', practiceArea);

		// Include user's location if available
		if ($searchLocation.hasLocation) {
			params.set('location', `${$searchLocation.city}, ${$searchLocation.state}`);
		} else if ($location.hasLocation) {
			// Use IP-based location as fallback
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

	const practiceAreas = [
		'Auto Accidents',
		'Motorcycle Accidents',
		'Truck Accidents',
		'Pedestrian Accidents',
		'Bicycle Accidents',
		'Slip and Fall',
		'Premises Liability',
		'Medical Malpractice',
		'Nursing Home Abuse',
		'Dog Bites',
		'Workplace Injuries',
		'Construction Accidents',
		'Wrongful Death',
		'Product Liability',
		'Defective Products',
		'Burn Injuries',
		'Brain Injuries',
		'Spinal Cord Injuries',
		'Birth Injuries',
		'Catastrophic Injuries'
	];
</script>

<header>
	<div class="container">
		<div class="header-content">
			<a href="/" class="logo">
				<img src="/claimsboost-logo.webp" alt="ClaimsBoost" class="logo-img" width="450" height="98" />
			</a>

			<nav class="desktop-nav">
				<div
					class="nav-dropdown"
					role="group"
					onmouseenter={() => locationDropdownOpen = true}
					onmouseleave={() => locationDropdownOpen = false}
				>
					<a href="/injury-law-firms/locations" class="nav-link">
						Law Firms by Location
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-left: 4px;">
							<path d="M6 9l6 6 6-6"/>
						</svg>
					</a>
					{#if locationDropdownOpen}
						<div class="dropdown-menu">
							<div class="dropdown-header">Search Law Firms by City</div>
							<div class="states-grid">
								{#each popularCities as city}
									<button type="button" class="city-link" onclick={() => navigateToCity(city)}>
										{city.name}, {city.state}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
				<div
					class="nav-dropdown"
					role="group"
					onmouseenter={() => practiceAreaDropdownOpen = true}
					onmouseleave={() => practiceAreaDropdownOpen = false}
				>
					<a href="/injury-law-firms/practice-areas" class="nav-link">
						Law Firms by Practice Area
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-left: 4px;">
							<path d="M6 9l6 6 6-6"/>
						</svg>
					</a>
					{#if practiceAreaDropdownOpen}
						<div class="dropdown-menu">
							<div class="dropdown-header">Search Law Firms by Practice Area</div>
							<div class="practice-areas-grid">
								{#each practiceAreas as area}
									<button type="button" class="practice-area-link" onclick={() => navigateToPracticeArea(area)}>
										{area}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</nav>

			<div class="header-actions">
				<a href="tel:8888660849" class="phone-button">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
					</svg>
					<span class="phone-number">(888) 866-0849</span>
				</a>
				<button class="login-button" onclick={handleLogin}>Login</button>
			</div>

			<button
				class="mobile-menu-toggle"
				onclick={() => menuOpen = !menuOpen}
				aria-label="Toggle menu"
			>
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					{#if menuOpen}
						<path d="M18 6L6 18M6 6l12 12"/>
					{:else}
						<path d="M3 12h18M3 6h18M3 18h18"/>
					{/if}
				</svg>
			</button>
		</div>
	</div>

	{#if menuOpen}
		<div class="mobile-menu">
			<nav>
				<a href="/injury-law-firms/locations">
					Law Firms by Location
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-left: 4px;">
						<path d="M6 9l6 6 6-6"/>
					</svg>
				</a>
				<a href="/injury-law-firms/practice-areas">
					Law Firms by Practice Area
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-left: 4px;">
						<path d="M6 9l6 6 6-6"/>
					</svg>
				</a>
				<div class="mobile-buttons">
					<a href="tel:8888660849" class="phone-button-mobile">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
						</svg>
						Call Now
					</a>
					<button class="login-button-mobile" onclick={handleLogin}>Login</button>
				</div>
			</nav>
		</div>
	{/if}
</header>

<style>
	header {
		background: #ffffff;
		border-bottom: 1px solid #e5e5e5;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 20px;
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 70px;
	}

	.logo {
		text-decoration: none;
		display: flex;
		align-items: center;
	}

	.logo-img {
		max-height: 49px;
		width: auto;
		object-fit: contain;
	}

	.desktop-nav {
		display: none;
		gap: 32px;
		flex: 1;
		margin-left: 60px;
		align-items: center;
	}

	.nav-dropdown {
		position: relative;
	}

	.nav-dropdown::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		height: 20px;
		background: transparent;
	}

	.nav-dropdown {
		position: relative;
	}

	/* Extend hover area downward to bridge gap */
	.nav-dropdown::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		height: 20px;
		background: transparent;
		display: none;
	}

	.nav-dropdown:hover::after {
		display: block;
	}

	.desktop-nav a,
	.desktop-nav .nav-link {
		color: #1a1a1a;
		text-decoration: none;
		font-size: 16px;
		font-weight: 600;
		transition: color 0.2s;
	}

	.desktop-nav a:hover,
	.desktop-nav .nav-link:hover {
		color: #FF7B00;
	}

	.dropdown-menu {
		position: fixed;
		top: 65px;
		left: 50%;
		transform: translateX(-50%);
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 12px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
		padding: 20px;
		min-width: 900px;
		z-index: 1000;
	}

	/* Invisible bridge to maintain hover when moving to dropdown */
	.dropdown-menu::before {
		content: '';
		position: absolute;
		top: -5px;
		left: 0;
		right: 0;
		height: 10px;
		background: transparent;
	}

	.dropdown-header {
		font-size: 16px;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 12px;
		padding-bottom: 12px;
		border-bottom: 2px solid #e5e5e5;
	}

	.states-grid {
		display: grid;
		grid-template-rows: repeat(13, auto);
		grid-auto-flow: column;
		gap: 4px 16px;
	}

	.practice-areas-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 4px 20px;
	}

	.city-link {
		color: #666;
		text-decoration: none;
		font-size: 16px;
		font-weight: 500;
		padding: 6px 10px;
		border-radius: 6px;
		transition: all 0.2s;
		display: block;
		white-space: nowrap;
		background: transparent;
		border: none;
		cursor: pointer;
		text-align: left;
		width: 100%;
		font-family: inherit;
	}

	.city-link:hover {
		background: #f8f9fa;
		color: #FF7B00;
	}

	.practice-area-link {
		color: #666;
		text-decoration: none;
		font-size: 16px;
		font-weight: 500;
		padding: 6px 10px;
		border-radius: 6px;
		transition: all 0.2s;
		display: block;
		white-space: nowrap;
		background: transparent;
		border: none;
		cursor: pointer;
		text-align: left;
		width: 100%;
		font-family: inherit;
	}

	.practice-area-link:hover {
		background: #f8f9fa;
		color: #FF7B00;
	}

	.dropdown-menu .state-link {
		color: #666;
		text-decoration: none;
		font-size: 16px;
		font-weight: 500;
		padding: 6px 10px;
		border-radius: 6px;
		transition: all 0.2s;
		display: block;
		white-space: nowrap;
	}

	.dropdown-menu .state-link:hover {
		background: #f8f9fa;
		color: #FF7B00;
	}

	.header-actions {
		display: none;
		gap: 16px;
		align-items: center;
	}

	.phone-button {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		border: none;
		border-radius: 8px;
		text-decoration: none;
		color: white;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1);
		font-size: 16px;
		font-weight: 500;
		line-height: 1.5;
	}

	.phone-button:hover {
		background: linear-gradient(135deg, #7BB8FF 0%, #3B82F6 100%);
		box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4), 0 3px 6px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
	}

	.phone-number {
		font-weight: 500;
	}

	.login-button {
		padding: 10px 24px;
		background: #1a1a1a;
		color: #ffffff;
		border: none;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		line-height: 1.5;
	}

	.login-button:hover {
		background: #333333;
	}

	.mobile-menu-toggle {
		display: block;
		background: none;
		border: none;
		cursor: pointer;
		padding: 8px;
		color: #1a1a1a;
	}

	.mobile-menu {
		background: #ffffff;
		border-bottom: 1px solid #e5e5e5;
		padding: 20px;
	}

	.mobile-menu nav {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.mobile-menu a {
		color: #1a1a1a;
		text-decoration: none;
		font-size: 18px;
		font-weight: 600;
		padding: 12px 0;
		border-bottom: 1px solid #e5e5e5;
	}

	.mobile-buttons {
		display: flex;
		gap: 12px;
		padding: 12px 0 0;
		border-bottom: none !important;
	}

	.phone-button-mobile {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 14px;
		background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		color: white !important;
		border: none;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		text-decoration: none;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.phone-button-mobile svg {
		color: white;
	}

	.phone-button-mobile:active {
		background: linear-gradient(135deg, #7BB8FF 0%, #3B82F6 100%);
		transform: translateY(1px);
	}

	.login-button-mobile {
		flex: 1;
		padding: 14px;
		background: #1a1a1a;
		color: #ffffff;
		border: none;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.3s ease;
		line-height: 1.5;
	}

	.login-button-mobile:active {
		background: #333333;
		transform: translateY(1px);
	}

	@media (min-width: 768px) {
		.desktop-nav {
			display: flex;
		}

		.header-actions {
			display: flex;
		}

		.mobile-menu-toggle {
			display: none;
		}

		.mobile-menu {
			display: none;
		}
	}
</style>