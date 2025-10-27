<script>
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	// Get firm ID from URL
	const firmId = $page.params.id;

	// Mock firm data - in production this would come from an API
	const firm = {
		id: 1,
		name: 'Miller & Associates',
		tagline: 'Fighting for Justice Since 2003',
		address: '421 Fayetteville Street, Suite 1100, Raleigh, NC 27601',
		phone: '(919) 555-0123',
		email: 'contact@millerassociates.com',
		website: 'www.millerassociates.com',
		description: 'Miller & Associates is a premier personal injury law firm serving the Raleigh area for over 20 years. Our experienced attorneys are dedicated to securing maximum compensation for our clients while providing compassionate, personalized legal representation.',
		practiceAreas: [
			'Auto Accidents',
			'Workplace Injury',
			'Slip & Fall',
			'Medical Malpractice',
			'Product Liability',
			'Dog Bites',
			'Wrongful Death',
			'Brain Injury'
		],
		rating: 4.8,
		reviews: 234,
		yearsExperience: 20,
		casesWon: 450,
		amountCollected: '$12M',
		isOpen: true,
		hours: {
			monday: '9:00 AM - 6:00 PM',
			tuesday: '9:00 AM - 6:00 PM',
			wednesday: '9:00 AM - 6:00 PM',
			thursday: '9:00 AM - 6:00 PM',
			friday: '9:00 AM - 5:00 PM',
			saturday: 'By Appointment',
			sunday: 'Closed'
		},
		attorneys: [
			{ name: 'John Miller', title: 'Senior Partner', experience: '20 years' },
			{ name: 'Sarah Johnson', title: 'Partner', experience: '15 years' },
			{ name: 'Michael Chen', title: 'Associate Attorney', experience: '8 years' }
		]
	};

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
</script>

<svelte:head>
	<title>{firm.name} - Personal Injury Lawyers in Raleigh, NC | ClaimsBoost</title>
	<meta name="description" content="{firm.description}" />
</svelte:head>

<div class="page">
	<Header />

	<main class="firm-profile">
		<div class="container">
			<!-- Breadcrumb -->
			<nav class="breadcrumb">
				<a href="/">Home</a>
				<span class="separator">/</span>
				<a href="/search">Search Results</a>
				<span class="separator">/</span>
				<a href="/search?state=NC">North Carolina</a>
				<span class="separator">/</span>
				<span class="current">{firm.name}</span>
			</nav>

			<!-- Top Section: Firm Card and Contact Info -->
			<div class="main-grid">
				<!-- Firm Card -->
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
				</article>

				<!-- Contact Card -->
				<div class="contact-card">
						<h3>Contact Information</h3>

						<div class="contact-item">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
								<circle cx="12" cy="10" r="3"/>
							</svg>
							<div>
								<div class="contact-label">Address</div>
								<div class="contact-value">{firm.address}</div>
							</div>
						</div>

						<div class="contact-item">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="2" y="4" width="20" height="16" rx="2"/>
								<path d="m2 7 10 7 10-7"/>
							</svg>
							<div>
								<div class="contact-label">Email</div>
								<div class="contact-value">{firm.email}</div>
							</div>
						</div>

						<button class="contact-button">
							Contact Firm
						</button>
					</div>

				<!-- CTA Section -->
				<div class="cta-section">
					<h3>Is this the right law firm for you?</h3>
					<button class="cta-button">
						Find out now
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M5 12h14M12 5l7 7-7 7"/>
						</svg>
					</button>
				</div>

				<!-- Practice Areas -->
				<section class="practice-areas-card">
					<h2>Practice Areas</h2>
					<div class="practice-areas-grid">
						{#each firm.practiceAreas as area}
							<div class="practice-area-card">
								<span>{area}</span>
							</div>
						{/each}
					</div>
				</section>

				<!-- Hours Card -->
					<div class="hours-card">
						<h3>Business Hours</h3>
						<div class="hours-list">
							<div class="hours-item">
								<span class="day">Monday</span>
								<span class="time">{firm.hours.monday}</span>
							</div>
							<div class="hours-item">
								<span class="day">Tuesday</span>
								<span class="time">{firm.hours.tuesday}</span>
							</div>
							<div class="hours-item">
								<span class="day">Wednesday</span>
								<span class="time">{firm.hours.wednesday}</span>
							</div>
							<div class="hours-item">
								<span class="day">Thursday</span>
								<span class="time">{firm.hours.thursday}</span>
							</div>
							<div class="hours-item">
								<span class="day">Friday</span>
								<span class="time">{firm.hours.friday}</span>
							</div>
							<div class="hours-item">
								<span class="day">Saturday</span>
								<span class="time">{firm.hours.saturday}</span>
							</div>
							<div class="hours-item">
								<span class="day">Sunday</span>
								<span class="time">{firm.hours.sunday}</span>
							</div>
						</div>
					</div>
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
		background: #f9fafb;
	}

	main {
		flex: 1;
		padding: 32px 20px 64px;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	/* Breadcrumb */
	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 24px;
		font-size: 14px;
		flex-wrap: wrap;
	}

	.breadcrumb a {
		color: #60A5FA;
		text-decoration: none;
		transition: color 0.2s;
	}

	.breadcrumb a:hover {
		color: #2563EB;
		text-decoration: underline;
	}

	.breadcrumb .separator {
		color: #ccc;
	}

	.breadcrumb .current {
		color: #666;
		font-weight: 500;
	}

	/* Main Grid */
	.main-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 24px;
		margin-bottom: 32px;
	}

	/* Firm Card */
	.firm-card {
		background: white;
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
		transition: all 0.3s;
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

	.practice-areas {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		max-width: 100%;
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

	/* Content Sections */
	.content-sections {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	.content-section {
		background: white;
		border-radius: 16px;
		padding: 32px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
	}

	.content-section h2 {
		font-size: 24px;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0 0 20px 0;
	}

	.content-section p {
		font-size: 16px;
		line-height: 1.7;
		color: #666;
		margin: 0;
	}

	/* Practice Areas */
	.practice-areas-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.practice-area-card {
		background: #f0f0f0;
		color: #1a1a1a;
		padding: 8px 16px;
		border-radius: 16px;
		font-size: 13px;
		font-weight: 500;
		white-space: nowrap;
	}

	/* Sidebar */
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.contact-card,
	.hours-card {
		background: white;
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
	}

	.contact-card h3,
	.hours-card h3 {
		font-size: 20px;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0 0 20px 0;
	}

	.contact-item {
		display: flex;
		gap: 12px;
		margin-bottom: 20px;
	}

	.contact-item svg {
		color: #60A5FA;
		flex-shrink: 0;
		margin-top: 2px;
	}

	.contact-label {
		font-size: 12px;
		color: #999;
		margin-bottom: 4px;
		text-transform: uppercase;
		font-weight: 600;
		letter-spacing: 0.5px;
	}

	.contact-value {
		font-size: 14px;
		color: #1a1a1a;
		font-weight: 500;
		line-height: 1.5;
	}

	.contact-button {
		width: 100%;
		padding: 14px 24px;
		background: #1a1a1a;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
		margin-top: 8px;
	}

	.contact-button:hover {
		background: #333333;
	}

	/* Hours */
	.hours-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.hours-item {
		display: flex;
		justify-content: space-between;
		font-size: 14px;
		padding: 8px 0;
		border-bottom: 1px solid #f0f0f0;
	}

	.hours-item:last-child {
		border-bottom: none;
	}

	.day {
		color: #666;
		font-weight: 500;
	}

	.time {
		color: #1a1a1a;
		font-weight: 600;
	}

	/* CTA Section */
	.cta-section {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		padding: 32px 0;
	}

	.cta-section h3 {
		font-size: 20px;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0;
	}

	.cta-button {
		padding: 16px 32px;
		background: linear-gradient(135deg, #FF7B00 0%, #D85A00 100%);
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
		box-shadow: 0 4px 15px rgba(255, 123, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.cta-button:hover {
		background: linear-gradient(135deg, #FF9500 0%, #E06500 100%);
		box-shadow: 0 6px 25px rgba(255, 123, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
	}

	/* Practice Areas Card */
	.practice-areas-card {
		background: white;
		border-radius: 16px;
		padding: 32px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
	}

	.practice-areas-card h2 {
		font-size: 20px;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0 0 20px 0;
	}

	/* Responsive */
	@media (min-width: 768px) {
		.main-grid {
			grid-template-columns: 1fr 380px;
		}

		.cta-section {
			grid-column: 1 / -1;
		}
	}
</style>
