<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import StarRating from '$lib/components/StarRating.svelte';
	import SettlementCard from '$lib/components/SettlementCard.svelte';
	import { stateNameToUrl, cityNameToUrl } from '$lib/utils/stateMapping.js';

	let { data } = $props();
	const { firm, settlements } = data;

	// State for expand/collapse
	let isExpanded = $state(false);
	const maxLength = 350; // Character limit for truncation

	// Function to check if text needs truncation
	let needsTruncation = $derived(firm.longDescription && firm.longDescription.length > maxLength);
	let displayText = $derived(needsTruncation && !isExpanded
		? firm.longDescription.slice(0, maxLength)
		: firm.longDescription);

	// Build canonical URL for this firm page
	let firmUrl = $derived(`https://claimsboost.com/injury-law-firms/${firm.state.toLowerCase()}/${cityNameToUrl(firm.city)}/${firm.slug}`);

	// SEO: Page title and description
	let pageTitle = $derived(`${firm.displayName || firm.name} - Personal Injury Law Firm in ${firm.city}, ${firm.state} | ClaimsBoost`);
	let pageDescription = $derived(firm.description || `Contact ${firm.displayName || firm.name}, a top-rated personal injury law firm in ${firm.city}, ${firm.state}. ${firm.yearsExperience ? `${firm.yearsExperience}+ years of experience.` : ''}`);

	// SEO: LegalService structured data
	let legalServiceSchema = $derived({
		"@context": "https://schema.org",
		"@type": "LegalService",
		"name": firm.displayName || firm.name,
		"description": firm.description || `Personal injury law firm in ${firm.city}, ${firm.state}`,
		"url": firmUrl,
		...(firm.phone && { "telephone": firm.phone }),
		"address": {
			"@type": "PostalAddress",
			"addressLocality": firm.city,
			"addressRegion": firm.state,
			"addressCountry": "US"
		},
		...(firm.rating > 0 && firm.reviews > 0 && {
			"aggregateRating": {
				"@type": "AggregateRating",
				"ratingValue": firm.rating,
				"reviewCount": firm.reviews,
				"bestRating": "5",
				"worstRating": "1"
			}
		}),
		"areaServed": {
			"@type": "City",
			"name": firm.city,
			"containedInPlace": {
				"@type": "State",
				"name": firm.stateName
			}
		},
		"knowsAbout": firm.practiceAreas || ["Personal Injury"],
		"priceRange": "Free Consultation",
		...(firm.website && {
			"sameAs": firm.website.startsWith('http') ? firm.website : `https://${firm.website}`
		})
	});

	// SEO: BreadcrumbList structured data
	let breadcrumbSchema = $derived({
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		"itemListElement": [
			{
				"@type": "ListItem",
				"position": 1,
				"name": "Home",
				"item": "https://claimsboost.com/"
			},
			{
				"@type": "ListItem",
				"position": 2,
				"name": firm.stateName,
				"item": `https://claimsboost.com/injury-law-firms/locations#${firm.state}`
			},
			{
				"@type": "ListItem",
				"position": 3,
				"name": firm.city,
				"item": `https://claimsboost.com/injury-law-firms/locations#${firm.state}`
			},
			{
				"@type": "ListItem",
				"position": 4,
				"name": firm.displayName || firm.name
			}
		]
	});
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />

	<!-- Page-specific Open Graph tags -->
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:url" content={firmUrl} />
	<meta property="og:type" content="business.business" />
	<meta property="og:image" content="https://claimsboost.com/og-image.png" />

	<!-- Page-specific Twitter tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content="https://claimsboost.com/og-image.png" />

	<!-- Structured Data: LegalService + BreadcrumbList -->
	{@html `<script type="application/ld+json">${JSON.stringify([legalServiceSchema, breadcrumbSchema])}</script>`}
</svelte:head>

<div class="page">
	<!-- SVG Gradient Definition (hidden) -->
	<svg width="0" height="0" style="position: absolute;">
		<defs>
			<linearGradient id="checkmark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
				<stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
			</linearGradient>
		</defs>
	</svg>

	<Header />

	<main class="firm-page">
		<div class="container">
			<!-- Breadcrumbs -->
			<nav class="breadcrumbs">
				<a href="/" class="breadcrumb-link">Home</a>
				<span class="breadcrumb-separator">›</span>
				<a href="/injury-law-firms/locations#{firm.state}" class="breadcrumb-link">{firm.stateName}</a>
				<span class="breadcrumb-separator">›</span>
				<a href="/injury-law-firms/locations#{firm.state}" class="breadcrumb-link">{firm.city}</a>
				<span class="breadcrumb-separator">›</span>
				<span class="breadcrumb-current">{firm.displayName || firm.name}</span>
			</nav>

			<!-- Elevated Profile Card -->
			<div class="profile-card">
				<!-- Hero Section -->
				<div class="hero-section">
					<div class="hero-left">
						<div class="firm-avatar-large">
							{(firm.displayName || firm.name).charAt(0)}
						</div>
						<div class="firm-intro">
							<h1>{firm.displayName || firm.name}</h1>
							<div class="rating-location">
								<div class="firm-rating">
									<StarRating rating={firm.rating} size={18} />
									<span class="rating-text">{firm.rating} ({firm.reviews} reviews)</span>
								</div>
								<div class="location-info">
									<img src="/map-pin-gray.svg" alt="Location" class="location-icon-img" />
									<span>{firm.city}, {firm.state}</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Firm Stats on the right -->
					<div class="hero-stats">
						{#if firm.yearsExperience}
							<div class="stat-item">
								<div class="stat-value">{firm.yearsExperience}+</div>
								<div class="stat-label">Years Experience</div>
							</div>
						{/if}
						{#if firm.casesWon}
							<div class="stat-item">
								<div class="stat-value">{firm.casesWon.toLocaleString()}+</div>
								<div class="stat-label">Cases Won</div>
							</div>
						{/if}
						{#if firm.amountCollected}
							<div class="stat-item">
								<div class="stat-value">{firm.amountCollected}</div>
								<div class="stat-label">Recovered</div>
							</div>
						{/if}
					</div>
				</div>

			<!-- Main Content -->
			<div class="content-grid">
				<div class="main-content">
					<!-- Firm Highlights -->
					{#if firm.longFacts && firm.longFacts.length > 0}
						<div class="info-section">
							<div class="section-header">
								<img src="/stars-gradient-black.svg" alt="Details" class="section-icon" />
								<span class="section-title">GENERATED HIGHLIGHTS</span>
							</div>
							<div class="facts-list">
								{#each firm.longFacts as fact}
									<div class="fact-item">
										<svg class="checkmark-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
											<polyline points="20 6 9 17 4 12"></polyline>
										</svg>
										<span>{fact}</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Practice Areas Section -->
					{#if firm.practiceAreas && firm.practiceAreas.length > 0}
						<div class="info-section">
							<div class="section-header">
								<img src="/shield-black.svg" alt="Practice Areas" class="section-icon" />
								<span class="section-title">PRACTICE AREAS</span>
							</div>
							<div class="practice-areas-list">
								{#each firm.practiceAreas as area}
									<span class="practice-tag">{area}</span>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Long Description -->
					{#if firm.longDescription && firm.longDescription !== firm.description}
						<div class="info-section">
							<div class="section-header">
								<img src="/stars-gradient-black.svg" alt="About" class="section-icon" />
								<span class="section-title">ABOUT THIS FIRM</span>
							</div>
							<p class="section-content">
								{displayText}{#if needsTruncation && !isExpanded}...{/if}
								{#if needsTruncation}
									<button
										class="read-more-button-inline"
										onclick={() => isExpanded = !isExpanded}
									>
										{isExpanded ? 'Show less' : 'Read more'}
									</button>
								{/if}
							</p>
						</div>
					{/if}
				</div>

				<!-- Right Column: CTA Card -->
				<aside class="sidebar">
					<div class="cta-card">
						<h2>Injured in an accident?</h2>
						<p>Get your free settlement estimate</p>
						<a href="/get-started" class="cta-button">
							Get Free Estimate
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M5 12h14M12 5l7 7-7 7"/>
							</svg>
						</a>
					</div>
				</aside>
			</div>

			<!-- Contact Information Section -->
			<div class="contact-section">
				<h2>Contact Information</h2>
				<div class="contact-grid">
					{#if firm.phone}
						<a href="tel:{firm.phone}" class="phone-button">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
							</svg>
							Call {firm.phone}
						</a>
					{/if}
					{#if firm.website}
						<div class="contact-item">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="12" cy="12" r="10"/>
								<line x1="2" y1="12" x2="22" y2="12"/>
								<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
							</svg>
							<a href="{firm.website.startsWith('http') ? firm.website : `https://${firm.website}`}" target="_blank" rel="noopener noreferrer">
								Visit Website
							</a>
						</div>
					{/if}
					{#if firm.address}
						<div class="contact-item">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
								<circle cx="12" cy="10" r="3"/>
							</svg>
							<span>{firm.address}</span>
						</div>
					{/if}
				</div>
			</div>

			<!-- Recent Settlements Section -->
			{#if settlements && settlements.length > 0}
				<div class="settlements-section">
					<h2>Recent Settlements</h2>
					<div class="settlements-grid">
						{#each settlements as settlement}
							<SettlementCard {settlement} matchingCriteria={[]} isProfilePage={true} />
						{/each}
					</div>
				</div>
			{/if}
			</div><!-- close profile-card -->
		</div><!-- close container -->
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
		padding: 0;
		background: #f9fafb;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 20px;
		position: relative;
	}

	/* Elevated Profile Card */
	.profile-card {
		background: white;
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(0,0,0,0.12);
		padding: 40px;
		margin-top: 24px;
		position: relative;
		z-index: 10;
		margin-bottom: 64px;
	}

	/* Breadcrumbs */
	.breadcrumbs {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 0;
		padding-top: 32px;
		padding-bottom: 12px;
		font-size: 14px;
		flex-wrap: wrap;
	}

	.breadcrumb-link {
		color: #666;
		text-decoration: none;
		transition: color 0.2s;
	}

	.breadcrumb-link:hover {
		color: #1a1a1a;
		text-decoration: underline;
	}

	.breadcrumb-separator {
		color: #999;
		font-size: 16px;
		line-height: 1;
	}

	.breadcrumb-current {
		color: #1a1a1a;
		font-weight: 400;
	}

	/* Hero Section */
	.hero-section {
		display: flex;
		align-items: center;
		gap: 48px;
		margin-bottom: 24px;
		padding-bottom: 24px;
		border-bottom: 2px solid #f0f0f0;
	}

	.hero-left {
		display: flex;
		align-items: center;
		gap: 24px;
		flex: 0 1 auto;
		min-width: 0;
	}

	.hero-stats {
		display: flex;
		gap: 32px;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
	}

	.firm-avatar-large {
		width: 120px;
		height: 120px;
		border-radius: 16px;
		background: #1a1a1a;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 48px;
		font-weight: bold;
		flex-shrink: 0;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
	}

	.firm-intro {
		flex: 1;
		min-width: 0;
	}

	.firm-intro h1 {
		font-size: 32px;
		font-weight: 700;
		margin: 0 0 16px 0;
		color: #1a1a1a;
	}

	.rating-location {
		display: flex;
		gap: 24px;
		flex-wrap: wrap;
		align-items: center;
	}

	.firm-rating {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.stars {
		font-size: 20px;
		display: inline-flex;
		gap: 2px;
	}

	.star {
		line-height: 1;
	}

	.star-full {
		color: #FFA500;
	}

	.star-half {
		color: #FFA500;
	}

	.star-empty {
		color: #d0d0d0;
	}

	.rating-text {
		font-size: 16px;
		color: #FFA500;
		font-weight: 600;
	}

	.location-info {
		display: flex;
		align-items: center;
		gap: 6px;
		color: #666;
		font-size: 16px;
	}

	.location-icon-img {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
		object-fit: contain;
	}

	/* Content Grid */
	.content-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 32px;
	}

	@media (min-width: 1024px) {
		.content-grid {
			grid-template-columns: 2fr 1fr;
		}
	}

	/* Main Content */
	.main-content {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	/* CTA Section */
	.cta-section {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		padding: 20px 0;
	}

	.cta-text {
		font-size: 18px;
		color: #666;
		margin: 0;
		line-height: 1.5;
	}

	.cta-button-main {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 16px 32px;
		background: linear-gradient(135deg, #FF6800 0%, #FFA500 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		text-decoration: none;
		box-shadow: 0 4px 15px rgba(255, 104, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.cta-button-main:hover {
		background: linear-gradient(135deg, #FF8000 0%, #FFB733 100%);
		box-shadow: 0 6px 25px rgba(255, 104, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
	}

	.cta-button-main svg {
		transition: transform 0.2s;
	}

	.cta-button-main:hover svg {
		transform: translateX(3px);
	}

	.info-section {
		margin-bottom: 32px;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 16px;
	}

	.section-icon {
		width: 24px;
		height: 24px;
		flex-shrink: 0;
		object-fit: contain;
	}

	.section-title {
		font-size: 14px;
		font-weight: 600;
		color: #999;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.section-content {
		color: #666666;
		font-size: 16px;
		font-weight: 400;
		line-height: 1.6;
		margin: 0;
	}

	.read-more-button-inline {
		background: none;
		border: none;
		color: #FF6800;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		padding: 0;
		margin-left: 4px;
		transition: color 0.2s;
		display: inline;
		font-family: inherit;
		line-height: inherit;
	}

	.read-more-button-inline:hover {
		color: #E55900;
		text-decoration: underline;
	}

	.practice-areas-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.practice-tag {
		background: #f0f0f0;
		color: #666;
		padding: 8px 16px;
		border-radius: 16px;
		font-size: 14px;
		font-weight: 500;
		white-space: nowrap;
	}

	.facts-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.fact-item {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		color: #666666;
		font-size: 16px;
		line-height: 1.6;
	}

	.checkmark-icon {
		flex-shrink: 0;
		margin-top: 2px;
		stroke: url(#checkmark-gradient);
	}

	.checkmark-icon {
		stroke: #10B981;
	}

	/* Settlements Section */
	.settlements-section {
		margin-bottom: 32px;
	}

	.settlements-section h2 {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 20px;
		color: #1a1a1a;
	}

	.settlements-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
	}

	@media (min-width: 768px) {
		.settlements-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	/* Contact Section */
	.contact-section {
		margin-top: 42px;
		margin-bottom: 48px;
		padding: 32px;
		background: #f9fafb;
		border-radius: 16px;
	}

	.contact-section h2 {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 24px;
		color: #1a1a1a;
	}

	.contact-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		align-items: center;
	}

	.phone-button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 14px 24px;
		background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		text-decoration: none;
		box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
	}

	.phone-button:hover {
		background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
		box-shadow: 0 6px 25px rgba(59, 130, 246, 0.4);
		transform: translateY(-2px);
	}

	.phone-button svg {
		flex-shrink: 0;
	}

	/* Sidebar */
	.sidebar {
		position: relative;
		padding-bottom: 32px; /* This creates the gap before contact section */
	}

	.cta-card {
		background: white;
		border-radius: 16px;
		padding: 32px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.08);
		position: sticky;
		top: 102px;
		text-align: center;
	}

	.cta-card h2 {
		font-size: 24px;
		font-weight: 700;
		margin: 0 0 12px 0;
		color: #1a1a1a;
	}

	.cta-card p {
		font-size: 16px;
		color: #6b7280;
		margin-bottom: 24px;
		line-height: 1.5;
	}

	.stat-item {
		text-align: center;
		min-width: 100px;
	}

	.stat-value {
		font-size: 28px;
		font-weight: 700;
		background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 4px;
	}

	.stat-label {
		font-size: 12px;
		color: #666;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.contact-item {
		display: flex;
		align-items: center;
		gap: 12px;
		color: #666;
		font-size: 15px;
	}

	.contact-item svg {
		flex-shrink: 0;
		color: #999;
	}

	.contact-item a {
		color: #1a1a1a;
		text-decoration: none;
		transition: color 0.2s;
	}

	.contact-item a:hover {
		color: #2563EB;
		text-decoration: underline;
	}

	.cta-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 16px 32px;
		background: linear-gradient(135deg, #FF6800 0%, #FFA500 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		text-decoration: none;
		box-shadow: 0 4px 15px rgba(255, 104, 0, 0.4);
	}

	.cta-button:hover {
		background: linear-gradient(135deg, #FF8000 0%, #FFB733 100%);
		box-shadow: 0 6px 25px rgba(255, 104, 0, 0.5);
		transform: translateY(-2px);
	}

	.cta-button svg {
		transition: transform 0.2s;
	}

	.cta-button:hover svg {
		transform: translateX(3px);
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.firm-page {
			background: white;
		}

		.hero-background {
			height: 200px;
		}

		.profile-card {
			padding: 24px;
			margin-top: 16px;
			background: transparent;
			box-shadow: none;
			border-radius: 0;
		}

		.hero-section {
			flex-direction: column;
			text-align: center;
		}

		.hero-left {
			flex-direction: column;
		}

		.hero-stats {
			width: 100%;
			justify-content: space-around;
			flex-wrap: wrap;
			gap: 16px;
		}

		.firm-avatar-large {
			width: 96px;
			height: 96px;
			font-size: 38px;
		}

		.firm-intro h1 {
			font-size: 24px;
		}

		.rating-location {
			justify-content: center;
			flex-direction: column;
			gap: 12px;
		}

		.cta-card {
			position: relative;
			top: 0;
		}

		.settlements-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
