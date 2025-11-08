<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import StarRating from '$lib/components/StarRating.svelte';
	import { stateNameToUrl } from '$lib/utils/stateMapping.js';

	export let data;
	const { firm } = data;

	// Star rating rendering is now handled by the StarRating component
	// Old renderStars function removed - see StarRating.svelte for implementation
</script>

<svelte:head>
	<title>{firm.name} - Personal Injury Law Firm in {firm.city}, {firm.state} | ClaimsBoost</title>
	<meta name="description" content="{firm.description || `Contact ${firm.name}, a top-rated personal injury law firm in ${firm.city}, ${firm.state}. ${firm.yearsExperience ? `${firm.yearsExperience}+ years of experience.` : ''}`}" />
</svelte:head>

<div class="page">
	<!-- SVG Gradient Definition (hidden) -->
	<svg width="0" height="0" style="position: absolute;">
		<defs>
			<linearGradient id="checkmark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" style="stop-color:#60A5FA;stop-opacity:1" />
				<stop offset="100%" style="stop-color:#2563EB;stop-opacity:1" />
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
				<a href="/search?state={firm.state}" class="breadcrumb-link">{firm.stateName}</a>
				<span class="breadcrumb-separator">›</span>
				<span class="breadcrumb-current">{firm.name}</span>
			</nav>

			<!-- Hero Section -->
			<div class="hero-section">
				<div class="firm-avatar-large">
					{firm.name.charAt(0)}
				</div>
				<div class="firm-intro">
					<h1>{firm.name}</h1>
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

			<!-- Main Content -->
			<div class="content-grid">
				<!-- Left Column: Firm Details -->
				<div class="main-content">
					<!-- CTA Section -->
					<div class="cta-section">
						<p class="cta-text">Injured in an accident? Get the compensation you deserve.</p>
						<a href="/get-started" class="cta-button-main">
							Get free estimate
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M5 12h14M12 5l7 7-7 7"/>
							</svg>
						</a>
					</div>

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

					<!-- Firm Highlights -->
					{#if firm.longFacts && firm.longFacts.length > 0}
						<div class="info-section">
							<div class="section-header">
								<img src="/stars-gradient-black.svg" alt="Details" class="section-icon" />
								<span class="section-title">FIRM HIGHLIGHTS</span>
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

					<!-- Long Description -->
					{#if firm.longDescription && firm.longDescription !== firm.description}
						<div class="info-section">
							<div class="section-header">
								<img src="/stars-gradient-black.svg" alt="About" class="section-icon" />
								<span class="section-title">ABOUT THIS FIRM</span>
							</div>
							<p class="section-content">{firm.longDescription}</p>
						</div>
					{/if}
				</div>

				<!-- Right Column: Contact Card -->
				<aside class="sidebar">
					<div class="contact-card">
						<h2>Contact Information</h2>

						<!-- Firm Stats -->
						<div class="firm-stats-grid">
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

						<!-- Contact Details -->
						<div class="contact-details">
							{#if firm.phone}
								<div class="contact-item">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
									</svg>
									<a href="tel:{firm.phone}">{firm.phone}</a>
								</div>
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

						<!-- CTA Button -->
						<a href="/get-started" class="cta-button">
							Get Free Consultation
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M5 12h14M12 5l7 7-7 7"/>
							</svg>
						</a>
					</div>
				</aside>
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

	/* Breadcrumbs */
	.breadcrumbs {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 24px;
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
		gap: 24px;
		margin-bottom: 48px;
		padding: 32px;
		background: white;
		border-radius: 16px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
	}

	.firm-avatar-large {
		width: 96px;
		height: 96px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 38px;
		font-weight: bold;
		flex-shrink: 0;
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
		color: #666;
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
		background: white;
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
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
		color: #1a1a1a;
		font-size: 16px;
		font-weight: 400;
		line-height: 1.6;
		margin: 0;
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
		color: #1a1a1a;
		font-size: 16px;
		line-height: 1.6;
	}

	.checkmark-icon {
		flex-shrink: 0;
		margin-top: 2px;
		stroke: url(#checkmark-gradient);
	}

	.checkmark-icon {
		stroke: #60A5FA;
	}

	@supports (stroke: url(#gradient)) {
		.checkmark-icon {
			stroke: url(#checkmark-gradient);
		}
	}

	/* Sidebar */
	.sidebar {
		position: relative;
	}

	.contact-card {
		background: white;
		border-radius: 16px;
		padding: 32px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
		position: sticky;
		top: 102px;
	}

	.contact-card h2 {
		font-size: 20px;
		font-weight: 600;
		margin: 0 0 24px 0;
		color: #1a1a1a;
	}

	.firm-stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: 16px;
		margin-bottom: 24px;
		padding-bottom: 24px;
		border-bottom: 1px solid #e5e5e5;
	}

	.stat-item {
		text-align: center;
	}

	.stat-value {
		font-size: 24px;
		font-weight: 700;
		color: #2563EB;
		margin-bottom: 4px;
	}

	.stat-label {
		font-size: 12px;
		color: #666;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.contact-details {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-bottom: 24px;
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
	}

	.cta-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		padding: 16px 32px;
		background: #1a1a1a;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		text-decoration: none;
	}

	.cta-button:hover {
		background: #333333;
	}

	.cta-button svg {
		transition: transform 0.2s;
	}

	.cta-button:hover svg {
		transform: translateX(3px);
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.hero-section {
			flex-direction: column;
			text-align: center;
		}

		.firm-avatar-large {
			width: 80px;
			height: 80px;
			font-size: 32px;
		}

		.firm-intro h1 {
			font-size: 24px;
		}

		.rating-location {
			justify-content: center;
		}

		.contact-card {
			position: relative;
			top: 0;
		}
	}
</style>
