<script>
	import { goto } from '$app/navigation';
	import { searchLocation } from '$lib/stores/searchLocationStore.js';

	let menuOpen = $state(false);
	let locationDropdownOpen = $state(false);
	let practiceAreaDropdownOpen = $state(false);

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
		{ name: 'San Francisco', state: 'CA' },
		{ name: 'Indianapolis', state: 'IN' },
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
		{ name: 'Mesa', state: 'AZ' },
		{ name: 'Sacramento', state: 'CA' },
		{ name: 'Atlanta', state: 'GA' },
		{ name: 'Kansas City', state: 'MO' },
		{ name: 'Colorado Springs', state: 'CO' },
		{ name: 'Raleigh', state: 'NC' },
		{ name: 'Miami', state: 'FL' },
		{ name: 'Long Beach', state: 'CA' },
		{ name: 'Virginia Beach', state: 'VA' },
		{ name: 'Omaha', state: 'NE' },
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
		locationDropdownOpen = false;
		goto('/search');
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
				<img src="/claimsboost-logo.png" alt="ClaimsBoost" class="logo-img" />
			</a>

			<nav class="desktop-nav">
				<div
					class="nav-dropdown"
					role="group"
					onmouseenter={() => locationDropdownOpen = true}
					onmouseleave={() => locationDropdownOpen = false}
				>
					<a href="/injury-law-firms" class="nav-link">
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
					<a href="/injury-settlements" class="nav-link">
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
									<a href="/law-firms/{area.toLowerCase().replace(/ /g, '-')}" class="state-link">
										{area}
									</a>
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
				<button class="login-button">Login</button>
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
				<a href="/injury-law-firms">
					Law Firms by Location
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-left: 4px;">
						<path d="M6 9l6 6 6-6"/>
					</svg>
				</a>
				<a href="/injury-settlements">
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
					<button class="login-button-mobile">Login</button>
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
		top: 70px;
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