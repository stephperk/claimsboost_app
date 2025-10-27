<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';

	let sortBy = $state('relevance');
	let showFilters = $state(false);

	// Search states
	let searchQuery = $state('');
	let location = $state('Raleigh, NC');

	// Filter states
	let selectedPracticeAreas = $state([]);
	let selectedRating = $state(0);
	let selectedExperience = $state('all');

	// Dropdown states
	let showPracticeAreaDropdown = $state(false);
	let showRatingDropdown = $state(false);
	let showSortDropdown = $state(false);

	// Practice area expansion states
	let expandedFirms = $state(new Set());
	let visiblePillCounts = $state({});
	let practiceAreaRefs = $state({});
	let pillsReady = $state({});

	// Close dropdowns when clicking outside
	function handleClickOutside(event) {
		const target = event.target;
		if (!target.closest('.filter-dropdown-container') && !target.closest('.sort-dropdown-container')) {
			showPracticeAreaDropdown = false;
			showRatingDropdown = false;
			showSortDropdown = false;
		}
	}

	// Fetch user location on mount
	onMount(async () => {
		try {
			// Using ipapi.co for IP geolocation (free tier available)
			const response = await fetch('https://ipapi.co/json/');
			const data = await response.json();
			if (data.city && data.region_code) {
				location = `${data.city}, ${data.region_code}`;
			}
		} catch (error) {
			console.error('Failed to fetch location:', error);
			// Keep default location
		}

		// Add click outside listener
		document.addEventListener('click', handleClickOutside);

		// Add window resize listener for pill recalculation
		window.addEventListener('resize', recalculateAllPills);

		// Initial pill calculation (with small delay to ensure DOM is ready)
		setTimeout(() => {
			recalculateAllPills();
		}, 100);

		// Cleanup
		return () => {
			document.removeEventListener('click', handleClickOutside);
			window.removeEventListener('resize', recalculateAllPills);
		};
	});

	function handleSearch(e) {
		e.preventDefault();
		console.log('Searching for:', searchQuery, 'in', location);
		// In production, this would trigger an API call to search for lawyers
	}

	const practiceAreaOptions = [
		'Auto Accidents',
		'Workplace Injury',
		'Slip & Fall',
		'Medical Malpractice',
		'Product Liability',
		'Dog Bites',
		'Wrongful Death',
		'Brain Injury'
	];

	// Mock data - in production this would come from an API
	const lawFirms = [
		{
			id: 1,
			name: 'Miller & Associates',
			address: '421 Fayetteville Street, Suite 1100, Raleigh, NC 27601',
			distance: '2.3 miles',
			description: 'Specializing in auto accidents, workplace injuries, and slip & fall cases with over 20 years of experience serving the Raleigh area.',
			practiceAreas: ['Auto Accidents', 'Workplace Injury', 'Slip & Fall', 'Medical Malpractice', 'Product Liability', 'Dog Bites', 'Wrongful Death', 'Brain Injury', 'Nursing Home Abuse', 'Bicycle Accidents', 'Pedestrian Accidents', 'Truck Accidents'],
			rating: 4.8,
			reviews: 234,
			yearsExperience: 20,
			casesWon: 450,
			amountCollected: '$12M',
			isOpen: true,
			featured: true
		},
		{
			id: 2,
			name: 'Chen Legal Group',
			address: '3737 Glenwood Avenue, Suite 200, Raleigh, NC 27612',
			distance: '3.1 miles',
			description: 'Award-winning personal injury attorneys dedicated to securing maximum compensation for our clients.',
			practiceAreas: ['Auto Accidents', 'Medical Malpractice', 'Product Liability', 'Wrongful Death', 'Brain Injury', 'Spinal Cord Injury', 'Birth Injury'],
			rating: 4.9,
			reviews: 512,
			yearsExperience: 15,
			casesWon: 680,
			amountCollected: '$18M',
			isOpen: true,
			featured: true
		},
		{
			id: 3,
			name: 'Rodriguez Law Firm',
			address: '1200 Wade Avenue, Raleigh, NC 27605',
			distance: '4.5 miles',
			description: 'Compassionate legal representation with a proven track record in personal injury cases.',
			practiceAreas: ['Workplace Injury', 'Slip & Fall', 'Wrongful Death', 'Construction Accidents', 'Premises Liability'],
			rating: 4.7,
			reviews: 389,
			yearsExperience: 12,
			casesWon: 320,
			amountCollected: '$8M',
			isOpen: false
		},
		{
			id: 4,
			name: 'Johnson & Partners',
			address: '8300 Health Park, Suite 223, Raleigh, NC 27615',
			distance: '5.2 miles',
			description: 'Dedicated personal injury attorneys fighting for maximum compensation. Free consultation available.',
			practiceAreas: ['Medical Malpractice', 'Product Liability', 'Dog Bites', 'Pharmaceutical Liability', 'Defective Medical Devices', 'Surgical Errors', 'Misdiagnosis', 'Birth Injury', 'Anesthesia Errors'],
			rating: 4.6,
			reviews: 178,
			yearsExperience: 18,
			casesWon: 275,
			amountCollected: '$10M',
			isOpen: true
		},
		{
			id: 5,
			name: 'Thompson Injury Law',
			address: '5540 Centerview Drive, Suite 204, Raleigh, NC 27606',
			distance: '6.8 miles',
			description: 'Aggressive representation for injury victims. No fee unless we win your case.',
			practiceAreas: ['Auto Accidents', 'Brain Injury', 'Wrongful Death', 'Motorcycle Accidents'],
			rating: 4.5,
			reviews: 156,
			yearsExperience: 10,
			casesWon: 198,
			amountCollected: '$6M',
			isOpen: true
		},
		{
			id: 6,
			name: 'Garcia & Associates',
			address: '2626 Glenwood Avenue, Suite 550, Raleigh, NC 27608',
			distance: '7.3 miles',
			description: 'Trusted legal advocates with a commitment to client satisfaction and justice.',
			practiceAreas: ['Slip & Fall', 'Workplace Injury', 'Product Liability', 'Premises Liability', 'Swimming Pool Accidents', 'Elevator Accidents', 'Stairway Accidents', 'Inadequate Security', 'Toxic Exposure', 'Burns & Scalds'],
			rating: 4.7,
			reviews: 289,
			yearsExperience: 14,
			casesWon: 412,
			amountCollected: '$14M',
			isOpen: false
		}
	];

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

	function togglePracticeArea(area) {
		if (selectedPracticeAreas.includes(area)) {
			selectedPracticeAreas = selectedPracticeAreas.filter(a => a !== area);
		} else {
			selectedPracticeAreas = [...selectedPracticeAreas, area];
		}
	}

	function clearFilters() {
		selectedPracticeAreas = [];
		selectedRating = 0;
		selectedExperience = 'all';
	}

	function toggleFirmExpansion(firmId) {
		if (expandedFirms.has(firmId)) {
			expandedFirms.delete(firmId);
		} else {
			expandedFirms.add(firmId);
		}
		expandedFirms = new Set(expandedFirms);
	}

	function calculateVisiblePills(firmId, containerRef) {
		if (!containerRef) return;

		const pills = Array.from(containerRef.children).filter(el =>
			el.classList.contains('practice-tag')
		);

		if (pills.length === 0) return;

		const containerWidth = containerRef.offsetWidth;
		const gap = 8; // Gap between pills
		let currentWidth = 0;
		let visibleCount = 0;

		// Reserve space for "see more" pill with extra buffer
		const seeMoreWidth = 120; // Increased from 100 to give more space
		const availableWidth = containerWidth - seeMoreWidth - gap;

		for (let i = 0; i < pills.length; i++) {
			const pillWidth = pills[i].offsetWidth;
			if (currentWidth + pillWidth <= availableWidth) {
				currentWidth += pillWidth + gap;
				visibleCount++;
			} else {
				break;
			}
		}

		// If all pills fit, don't need "see more"
		if (visibleCount === pills.length) {
			visibleCount = pills.length;
		}

		visiblePillCounts = { ...visiblePillCounts, [firmId]: visibleCount };
		pillsReady = { ...pillsReady, [firmId]: true };
	}

	function recalculateAllPills() {
		// Reset ready state for recalculation
		pillsReady = {};

		lawFirms.forEach(firm => {
			const containerRef = practiceAreaRefs[firm.id];
			if (containerRef) {
				calculateVisiblePills(firm.id, containerRef);
			}
		});
	}
</script>

<svelte:head>
	<title>Find Personal Injury Lawyers in Raleigh, NC | ClaimsBoost</title>
	<meta name="description" content="Browse top-rated personal injury lawyers in Raleigh, NC. Compare reviews, practice areas, and experience to find the right attorney for your case." />
</svelte:head>

<div class="page">
	<Header />

	<main class="search-results">
		<div class="container">
			<!-- Page Header -->
			<div class="page-header">
				<h1>Personal Injury Lawyers in <span class="location-highlight">Raleigh, NC</span></h1>
				<p class="subtitle">{lawFirms.length} law firms ready to help with your case</p>
			</div>

			<!-- Search Bar -->
			<form class="search-form" onsubmit={handleSearch}>
				<div class="search-wrapper">
					<div class="search-input-container">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
							<circle cx="11" cy="11" r="8"/>
							<path d="m21 21-4.35-4.35"/>
						</svg>
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="What type of lawyer do you need?"
							class="search-input query-input"
						/>
					</div>
					<div class="search-input-container location-container">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="location-icon">
							<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
							<circle cx="12" cy="10" r="3"/>
						</svg>
						<input
							type="text"
							bind:value={location}
							placeholder="City, State"
							class="search-input location-input"
						/>
					</div>
					<button type="submit" class="search-button">
						Search
					</button>
				</div>
			</form>

			<!-- Minimal Filter/Sort Bar -->
			<div class="filter-sort-bar">
				<div class="filter-chips">
					<div class="filter-dropdown-container">
						<button
							class="chip"
							class:active={selectedPracticeAreas.length > 0}
							onclick={() => showPracticeAreaDropdown = !showPracticeAreaDropdown}
						>
							Practice Areas {#if selectedPracticeAreas.length > 0}({selectedPracticeAreas.length}){/if}
							<svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5">
								<path d="M1 1L5 5L9 1" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button>

						{#if showPracticeAreaDropdown}
							<div class="dropdown-menu">
								{#each practiceAreaOptions as area}
									<label class="dropdown-item">
										<input
											type="checkbox"
											checked={selectedPracticeAreas.includes(area)}
											onchange={() => togglePracticeArea(area)}
										/>
										<span>{area}</span>
									</label>
								{/each}
							</div>
						{/if}
					</div>

					<div class="filter-dropdown-container">
						<button
							class="chip"
							class:active={selectedRating > 0}
							onclick={() => showRatingDropdown = !showRatingDropdown}
						>
							Rating {#if selectedRating > 0}({selectedRating}+){/if}
							<svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5">
								<path d="M1 1L5 5L9 1" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button>

						{#if showRatingDropdown}
							<div class="dropdown-menu">
								<button class="dropdown-item" onclick={() => { selectedRating = 4.5; showRatingDropdown = false; }}>
									<span>{renderStars(4.5)} 4.5+ Stars</span>
								</button>
								<button class="dropdown-item" onclick={() => { selectedRating = 4.0; showRatingDropdown = false; }}>
									<span>{renderStars(4.0)} 4.0+ Stars</span>
								</button>
								<button class="dropdown-item" onclick={() => { selectedRating = 3.5; showRatingDropdown = false; }}>
									<span>{renderStars(3.5)} 3.5+ Stars</span>
								</button>
								<button class="dropdown-item" onclick={() => { selectedRating = 0; showRatingDropdown = false; }}>
									<span>Any Rating</span>
								</button>
							</div>
						{/if}
					</div>

					<!-- Active Filter Tags -->
					{#each selectedPracticeAreas as area}
						<div class="filter-tag">
							<button
								class="remove-tag"
								onclick={() => togglePracticeArea(area)}
								aria-label="Remove {area} filter"
							>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<line x1="18" y1="6" x2="6" y2="18"/>
									<line x1="6" y1="6" x2="18" y2="18"/>
								</svg>
							</button>
							<span>{area}</span>
						</div>
					{/each}
				</div>
				<div class="sort-dropdown-container">
					<button
						class="sort-dropdown"
						onclick={() => showSortDropdown = !showSortDropdown}
					>
						Sort: {sortBy === 'relevance' ? 'Relevance' : sortBy === 'rating' ? 'Rating' : 'Distance'}
						<svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M1 1L5 5L9 1" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>

					{#if showSortDropdown}
						<div class="dropdown-menu">
							<button class="dropdown-item" onclick={() => { sortBy = 'relevance'; showSortDropdown = false; }}>
								{#if sortBy === 'relevance'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polyline points="20 6 9 17 4 12"/>
									</svg>
								{:else}
									<span class="checkmark-spacer"></span>
								{/if}
								<span>Sort: Relevance</span>
							</button>
							<button class="dropdown-item" onclick={() => { sortBy = 'rating'; showSortDropdown = false; }}>
								{#if sortBy === 'rating'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polyline points="20 6 9 17 4 12"/>
									</svg>
								{:else}
									<span class="checkmark-spacer"></span>
								{/if}
								<span>Sort: Rating</span>
							</button>
							<button class="dropdown-item" onclick={() => { sortBy = 'distance'; showSortDropdown = false; }}>
								{#if sortBy === 'distance'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polyline points="20 6 9 17 4 12"/>
									</svg>
								{:else}
									<span class="checkmark-spacer"></span>
								{/if}
								<span>Sort: Distance</span>
							</button>
						</div>
					{/if}
				</div>
			</div>

			<!-- Filters Panel -->
			{#if showFilters}
				<div class="filters-panel">
					<div class="filter-group">
						<h3>Practice Areas</h3>
						<div class="checkbox-group">
							{#each practiceAreaOptions as area}
								<label class="checkbox-label">
									<input
										type="checkbox"
										checked={selectedPracticeAreas.includes(area)}
										onchange={() => togglePracticeArea(area)}
									/>
									<span>{area}</span>
								</label>
							{/each}
						</div>
					</div>

					<div class="filter-group">
						<h3>Minimum Rating</h3>
						<div class="rating-filter">
							{#each [4.5, 4.0, 3.5, 3.0] as rating}
								<label class="radio-label">
									<input
										type="radio"
										name="rating"
										value={rating}
										checked={selectedRating === rating}
										onchange={() => selectedRating = rating}
									/>
									<span>{renderStars(rating)} {rating}+ Stars</span>
								</label>
							{/each}
						</div>
					</div>

					<div class="filter-group">
						<h3>Experience</h3>
						<select bind:value={selectedExperience} class="filter-select">
							<option value="all">All Experience Levels</option>
							<option value="5+">5+ Years</option>
							<option value="10+">10+ Years</option>
							<option value="15+">15+ Years</option>
							<option value="20+">20+ Years</option>
						</select>
					</div>

					<button class="clear-filters-btn" onclick={clearFilters}>
						Clear All Filters
					</button>
				</div>
			{/if}

			<!-- Results Grid -->
			<div class="results-grid">
				{#each lawFirms as firm}
					<article class="firm-card">
						<div class="firm-header">
							<div class="firm-avatar">
								{firm.name.charAt(0)}
							</div>
							<h2>{firm.name}</h2>
							<span class="verified-badge">Verified</span>
						</div>

						<div class="rating-location-row">
							<div class="firm-rating">
								<span class="stars">{renderStars(firm.rating)}</span>
								<span class="rating-text">{firm.rating} ({firm.reviews} reviews)</span>
							</div>

							<div class="location-info">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
									<circle cx="12" cy="10" r="3"/>
								</svg>
								<span>{firm.address.split(', ').slice(-2)[0]}, {firm.address.split(', ').slice(-1)[0].split(' ')[0]}</span>
								<span class="pipe">|</span>
								<span>{firm.distance} away</span>
							</div>
						</div>

						<p class="firm-description">
							<span class="ai-label">
								<img src="/ai_icon_star_brand.png" alt="AI" class="ai-icon" />
								AI Summary:
							</span> {firm.description}
						</p>

						<div class="firm-stats">
							{#if firm.isOpen}
								<div class="stat open-now">
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<circle cx="12" cy="12" r="10"/>
										<polyline points="12 6 12 12 16 14"/>
									</svg>
									<span>Open now</span>
								</div>
							{/if}
							<div class="stat">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
									<line x1="16" y1="2" x2="16" y2="6"/>
									<line x1="8" y1="2" x2="8" y2="6"/>
									<line x1="3" y1="10" x2="21" y2="10"/>
								</svg>
								<span>{firm.yearsExperience} years</span>
							</div>
							<div class="stat">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
									<polyline points="22 4 12 14.01 9 11.01"/>
								</svg>
								<span>{firm.casesWon}+ cases won</span>
							</div>
							<div class="stat">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="2" y="6" width="20" height="12" rx="2"/>
									<circle cx="12" cy="12" r="2"/>
									<path d="M6 12h.01M18 12h.01"/>
								</svg>
								<span>{firm.amountCollected} collected</span>
							</div>
						</div>

						<div
							class="practice-areas"
							class:expanded={expandedFirms.has(firm.id)}
							class:measuring={!pillsReady[firm.id]}
							bind:this={practiceAreaRefs[firm.id]}
						>
							{#if expandedFirms.has(firm.id)}
								<!-- Show all pills when expanded -->
								{#each firm.practiceAreas as area}
									<span class="practice-tag">{area}</span>
								{/each}
								<button
									class="practice-tag see-more-pill"
									onclick={() => toggleFirmExpansion(firm.id)}
								>
									See less
								</button>
							{:else if pillsReady[firm.id]}
								<!-- Show only visible pills when collapsed and measurement is complete -->
								{#each firm.practiceAreas.slice(0, visiblePillCounts[firm.id] || 3) as area}
									<span class="practice-tag">{area}</span>
								{/each}
								{#if (visiblePillCounts[firm.id] || 3) < firm.practiceAreas.length}
									<button
										class="practice-tag see-more-pill"
										onclick={() => toggleFirmExpansion(firm.id)}
									>
										+{firm.practiceAreas.length - (visiblePillCounts[firm.id] || 3)} more
									</button>
								{/if}
							{:else}
								<!-- Render all pills invisibly for measurement -->
								{#each firm.practiceAreas as area}
									<span class="practice-tag">{area}</span>
								{/each}
							{/if}
						</div>

						<div class="button-wrapper">
							<button class="connect-btn">
								Connect
							</button>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</main>

	<Footer />
</div>

<style>
	.page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: white;
	}

	main {
		flex: 1;
		padding: 32px 20px 64px;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	/* Page Header */
	.page-header {
		margin-bottom: 32px;
	}

	h1 {
		font-size: 32px;
		font-weight: 700;
		margin-bottom: 8px;
		color: #1a1a1a;
	}

	.location-highlight {
		background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		color: #666;
		font-size: 16px;
	}

	/* Search Form */
	.search-form {
		margin-bottom: 24px;
	}

	.search-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
		border-radius: 16px;
		overflow: hidden;
	}

	.search-input-container {
		position: relative;
		background: white;
	}

	.search-icon,
	.location-icon {
		position: absolute;
		left: 16px;
		top: 50%;
		transform: translateY(-50%);
		color: #999;
		z-index: 3;
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 16px 20px 16px 48px;
		border: none;
		font-size: 16px;
		transition: border-color 0.2s;
		border-radius: 0;
		position: relative;
		z-index: 1;
	}

	.query-input {
		border-bottom: 1px solid #e5e5e5;
		border-radius: 16px 16px 0 0;
	}

	.location-input {
		border-top: 1px solid #e5e5e5;
		border-radius: 0;
	}

	.search-input:focus {
		outline: none;
		z-index: 2;
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
	}

	.search-button {
		padding: 16px 32px;
		border-radius: 0 0 16px 16px;
		background: linear-gradient(135deg, #FF7B00 0%, #D85A00 100%);
		color: white;
		border: none;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		white-space: nowrap;
		box-shadow: 0 4px 15px rgba(255, 123, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.search-button:hover {
		background: linear-gradient(135deg, #FF9500 0%, #E06500 100%);
		box-shadow: 0 6px 25px rgba(255, 123, 0, 0.7), 0 3px 6px rgba(0, 0, 0, 0.15);
	}

	/* Minimal Filter/Sort Bar */
	.filter-sort-bar {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
		gap: 16px;
	}

	.filter-chips {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		flex: 1;
		min-width: 0;
	}

	.filter-dropdown-container {
		position: relative;
	}

	.chip {
		padding: 8px 16px;
		background: white;
		border: none;
		border-radius: 16px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		color: #666;
		display: flex;
		align-items: center;
		gap: 8px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
	}

	.chip svg {
		width: 10px;
		height: 6px;
	}

	.chip:hover {
		color: #60A5FA;
		box-shadow: 0 2px 8px rgba(96, 165, 250, 0.3);
	}

	.chip.active {
		background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		color: white;
		border-radius: 16px;
		box-shadow: 0 4px 15px rgba(96, 165, 250, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
		padding: 8px;
		min-width: 200px;
		z-index: 10;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		cursor: pointer;
		border-radius: 6px;
		transition: background 0.2s;
		width: 100%;
		background: transparent;
		border: none;
		text-align: left;
		font-size: 14px;
		color: #333;
	}

	.dropdown-item:hover {
		background: #f9fafb;
	}

	.dropdown-item input[type="checkbox"] {
		cursor: pointer;
	}

	.dropdown-item span {
		flex: 1;
	}

	.sort-dropdown-container {
		position: relative;
	}

	.sort-dropdown {
		padding: 8px 16px;
		border: none;
		border-radius: 16px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		background: white;
		color: #666;
		transition: all 0.2s;
		flex-shrink: 0;
		white-space: nowrap;
		display: flex;
		align-items: center;
		gap: 8px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
	}

	.sort-dropdown:hover {
		color: #60A5FA;
		box-shadow: 0 2px 8px rgba(96, 165, 250, 0.3);
	}

	.sort-dropdown svg {
		width: 10px;
		height: 6px;
	}

	.sort-dropdown-container .dropdown-menu {
		right: 0;
		left: auto;
		min-width: 200px;
	}

	.sort-dropdown-container .dropdown-item {
		justify-content: flex-start;
		gap: 8px;
	}

	.sort-dropdown-container .dropdown-item .checkmark-spacer {
		width: 16px;
		min-width: 16px;
		height: 16px;
		flex-shrink: 0;
	}

	@media (max-width: 640px) {
		.sort-dropdown-container .dropdown-menu {
			right: 0;
			min-width: 240px;
		}
	}

	.checkmark-spacer {
		width: 16px !important;
		height: 16px !important;
		display: inline-block;
		flex-shrink: 0;
		min-width: 16px !important;
		max-width: 16px !important;
	}

	.sort-dropdown-container .dropdown-item svg {
		flex-shrink: 0;
		min-width: 16px !important;
		max-width: 16px !important;
		width: 16px !important;
		height: 16px !important;
	}

	/* Active Filter Tags */
	.filter-tag {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 12px;
		background: rgba(96, 165, 250, 0.15);
		color: #2563EB;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
	}

	.remove-tag {
		background: transparent;
		border: none;
		color: #2563EB;
		cursor: pointer;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: opacity 0.2s;
		width: 18px;
		height: 18px;
	}

	.remove-tag:hover {
		opacity: 0.7;
	}

	.remove-tag svg {
		width: 14px;
		height: 14px;
	}

	/* Filters Panel */
	.filters-panel {
		background: white;
		padding: 24px;
		border-radius: 12px;
		margin-bottom: 24px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.08);
		display: grid;
		gap: 24px;
	}

	.filter-group h3 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 12px;
		color: #1a1a1a;
	}

	.checkbox-group {
		display: grid;
		gap: 8px;
	}

	.checkbox-label, .radio-label {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		padding: 8px;
		border-radius: 6px;
		transition: background 0.2s;
	}

	.checkbox-label:hover, .radio-label:hover {
		background: #f9fafb;
	}

	.checkbox-label input, .radio-label input {
		cursor: pointer;
	}

	.rating-filter {
		display: grid;
		gap: 8px;
	}

	.filter-select {
		width: 100%;
		padding: 10px 12px;
		border: 2px solid #e5e5e5;
		border-radius: 8px;
		font-size: 14px;
		cursor: pointer;
		background: white;
	}

	.clear-filters-btn {
		padding: 12px 24px;
		background: #f3f4f6;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.clear-filters-btn:hover {
		background: #e5e7eb;
	}

	/* Results Grid */
	.results-grid {
		display: grid;
		gap: 20px;
	}

	.firm-card {
		background: white;
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
		transition: all 0.3s;
		position: relative;
		min-width: 0;
		width: 100%;
		cursor: pointer;
	}

	.firm-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0,0,0,0.22);
	}

	.firm-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 14px;
		min-width: 0;
	}

	.firm-header h2 {
		font-size: 16px;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0;
	}

	.firm-avatar {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		font-weight: bold;
		flex-shrink: 0;
	}

	.firm-title-section {
		flex: 1;
		min-width: 0;
	}

	.firm-name-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
		gap: 12px;
	}

	.name-badges {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: 1;
		min-width: 0;
	}

	.firm-title-section h2 {
		font-size: 20px;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0;
	}

	.verified-badge {
		display: inline-flex;
		align-items: center;
		padding: 4px 10px;
		background: rgba(16, 185, 129, 0.15);
		color: #10b981;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 600;
		flex-shrink: 0;
	}

	.location-info {
		display: flex;
		align-items: center;
		gap: 6px;
		color: #666;
		font-size: 14px;
		min-width: 0;
		flex-wrap: nowrap;
	}

	.location-info .pipe {
		color: #ccc;
		margin: 0 2px;
	}

	.distance {
		display: flex;
		align-items: center;
		gap: 4px;
		color: #999;
		font-size: 14px;
		font-weight: 500;
		white-space: nowrap;
		flex-shrink: 0;
		margin-left: auto;
	}

	.distance svg {
		color: #999;
	}

	.firm-stats {
		display: flex;
		gap: 16px;
		margin-bottom: 14px;
		flex-wrap: wrap;
		min-width: 0;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 6px;
		color: #666;
		font-size: 14px;
	}

	.stat svg {
		color: #60A5FA;
	}

	.stat.open-now {
		color: #10b981;
		font-weight: 600;
	}

	.stat.open-now svg {
		color: #10b981;
	}

	.firm-description {
		color: #666;
		font-size: 14px;
		line-height: 1.6;
		margin-bottom: 14px;
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

	.rating-location-row {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 14px;
		flex-wrap: wrap;
	}

	.firm-rating {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.practice-areas {
		display: flex;
		flex-wrap: nowrap;
		gap: 8px;
		max-width: 100%;
		overflow: hidden;
		position: relative;
	}

	.practice-areas.expanded {
		flex-wrap: wrap;
		overflow: visible;
		max-width: 100%;
	}

	.practice-areas.measuring {
		visibility: hidden;
		height: 0;
		min-height: 0;
	}

	.practice-tag {
		background: #f0f0f0;
		color: #666;
		padding: 6px 12px;
		border-radius: 16px;
		font-size: 12px;
		font-weight: 500;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.see-more-pill {
		background: rgba(96, 165, 250, 0.15);
		color: #2563EB;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
		font-weight: 600;
	}

	.see-more-pill:hover {
		background: rgba(96, 165, 250, 0.25);
		transform: translateY(-1px);
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

	.button-wrapper {
		display: flex;
		justify-content: center;
		margin-top: 14px;
	}

	.connect-btn {
		padding: 12px 48px;
		background: linear-gradient(135deg, #FF7B00 0%, #D85A00 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 15px rgba(255, 123, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.connect-btn:hover {
		background: linear-gradient(135deg, #FF9500 0%, #E06500 100%);
		box-shadow: 0 6px 25px rgba(255, 123, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
	}

	.connect-btn svg {
		transition: transform 0.2s;
	}

	.connect-btn:hover svg {
		transform: translateX(3px);
	}

	.card-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.view-profile-btn {
		padding: 12px;
		background: #1a1a1a;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.view-profile-btn:hover {
		background: #333333;
	}

	.contact-btn {
		padding: 12px;
		background: linear-gradient(135deg, #FF7B00 0%, #D85A00 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		box-shadow: 0 2px 8px rgba(255, 123, 0, 0.3);
	}

	.contact-btn:hover {
		background: linear-gradient(135deg, #FF9500 0%, #E06500 100%);
		box-shadow: 0 4px 12px rgba(255, 123, 0, 0.4);
	}

	/* Responsive */
	@media (min-width: 640px) {
		.filters-panel {
			grid-template-columns: repeat(2, 1fr);
		}

		.clear-filters-btn {
			grid-column: 1 / -1;
		}
	}

	@media (min-width: 768px) {
		h1 {
			font-size: 40px;
		}

		.search-wrapper {
			flex-direction: row;
		}

		.search-input-container:first-child {
			flex: 65;
		}

		.location-container {
			flex: 35;
		}

		.query-input {
			border-right: 1px solid #e5e5e5;
			border-radius: 16px 0 0 16px;
			border-bottom: 0;
		}

		.location-input {
			border-left: 1px solid #e5e5e5;
			border-radius: 0;
			border-top: 0;
		}

		.search-button {
			border-radius: 0 16px 16px 0;
			flex-shrink: 0;
			border-top-left-radius: 0;
			border-bottom-left-radius: 0;
		}

		.filter-bar {
			flex-direction: row;
		}

		.filter-toggle, .sort-select {
			flex: 0 0 auto;
			width: 140px;
		}
	}

	@media (min-width: 1024px) {
		.filters-panel {
			grid-template-columns: repeat(4, 1fr);
		}

		.results-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
