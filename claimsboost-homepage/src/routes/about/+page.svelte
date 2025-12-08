<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import lottie from 'lottie-web';
	import { onMount } from 'svelte';

	let lottieContainers = {};
	let lottieAnimations = {};

	const benefitIcons = [
		'/wired-outline-979-project-estimate-hover-pinch.json',
		'/wired-outline-19-magnifier-zoom-search-hover-spin.json',
		'/wired-outline-2764-reliable-alt-hover-pinch.json',
		'/wired-outline-403-museum-authority-hover-pinch.json'
	];

	function handleHover(index) {
		if (lottieAnimations[index]) {
			lottieAnimations[index].goToAndPlay(0, true);
		}
	}

	function handleLeave(index) {
		if (lottieAnimations[index]) {
			lottieAnimations[index].goToAndStop(0, true);
		}
	}

	onMount(async () => {
		for (let i = 0; i < benefitIcons.length; i++) {
			if (lottieContainers[i]) {
				const response = await fetch(benefitIcons[i]);
				const animationData = await response.json();

				lottieAnimations[i] = lottie.loadAnimation({
					container: lottieContainers[i],
					renderer: 'svg',
					loop: false,
					autoplay: false,
					animationData: animationData
				});
			}
		}
	});
</script>

<svelte:head>
	<title>About Us - ClaimsBoost | Clarity for Your Legal Situation</title>
	<meta name="description" content="Get a free settlement estimate in minutes. claimsboost.com provides clear information about civil claims—personal injury, insurance disputes, malpractice, negligence, and more." />
</svelte:head>

<div class="page">
	<Header />

	<main>
		<!-- Hero Section -->
		<section class="hero-section">
			<div class="container">
				<h1>Clarity for your legal situation</h1>
				<p>Whether you're dealing with an injury, insurance issue, malpractice concern, negligence claim, or another type of dispute, you can get a free settlement estimate in minutes—confidential and commitment-free.</p>
				<a href="/get-started" class="hero-cta-button">
					Get Free Estimate
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M5 12h14M12 5l7 7-7 7"/>
					</svg>
				</a>
			</div>
		</section>

		<!-- About Section -->
		<section class="content-section">
			<div class="container">
				<h2>About the platform</h2>
				<p>People use claimsboost.com to get clear, easy-to-understand information about a wide range of civil claims—from personal injury to insurance bad faith, malpractice, negligence, property damage, and more.</p>
				<p>The platform provides a quick settlement estimate based on similar cases and makes it simple to explore law firms that handle matters like yours in your geographic area. Your information is always protected and never shared unless you choose to take the next step.</p>
				<p>The goal is transparency, simplicity, and empowering you to understand your options without pressure, obligations, or unwanted outreach.</p>
			</div>
		</section>

		<!-- How It Works Section -->
		<section class="process-section">
			<div class="container">
				<h2>How it works</h2>
				<ol class="process-list">
					<li class="process-item">
						<div class="process-number">1</div>
						<div class="process-content">
							<h3>Tell Us What Happened</h3>
							<p>Answer a few short questions about your situation—injury, insurance dispute, malpractice, or something else.</p>
						</div>
					</li>
					<li class="process-item">
						<div class="process-number">2</div>
						<div class="process-content">
							<h3>Get Your Free Settlement Estimate</h3>
							<p>See what similar cases have historically resolved for, giving you clearer expectations before you speak with anyone.</p>
						</div>
					</li>
					<li class="process-item">
						<div class="process-number">3</div>
						<div class="process-content">
							<h3>Explore Law Firms Near You</h3>
							<p>Browse and filter law firms by practice type and location. Compare firms that regularly handle situations similar to yours.</p>
						</div>
					</li>
					<li class="process-item">
						<div class="process-number">4</div>
						<div class="process-content">
							<h3>Connect With Experts When You're Ready</h3>
							<p>Reach out to legal experts who can evaluate your case in detail. Your information is only shared when you choose.</p>
						</div>
					</li>
				</ol>
			</div>
		</section>

		<!-- Why People Use Section -->
		<section class="benefits-section">
			<div class="container">
				<h2>Why people use the platform</h2>
				<div class="benefits-grid">
					<div class="benefit-card" onmouseenter={() => handleHover(0)} onmouseleave={() => handleLeave(0)}>
						<div class="benefit-icon lottie-icon" bind:this={lottieContainers[0]}></div>
						<div class="benefit-content">
							<h3>Free Settlement Estimate</h3>
							<p>Get clarity on what outcomes are typical for situations like yours.</p>
						</div>
					</div>
					<div class="benefit-card" onmouseenter={() => handleHover(1)} onmouseleave={() => handleLeave(1)}>
						<div class="benefit-icon lottie-icon" bind:this={lottieContainers[1]}></div>
						<div class="benefit-content">
							<h3>Easy Law Firm Search</h3>
							<p>Explore law firms by category—injury, insurance disputes, malpractice, negligence, and more.</p>
						</div>
					</div>
					<div class="benefit-card" onmouseenter={() => handleHover(2)} onmouseleave={() => handleLeave(2)}>
						<div class="benefit-icon lottie-icon" bind:this={lottieContainers[2]}></div>
						<div class="benefit-content">
							<h3>Privacy & Control</h3>
							<p>Your details are encrypted and never shared unless you explicitly choose to connect.</p>
						</div>
					</div>
					<div class="benefit-card" onmouseenter={() => handleHover(3)} onmouseleave={() => handleLeave(3)}>
						<div class="benefit-icon lottie-icon" bind:this={lottieContainers[3]}></div>
						<div class="benefit-content">
							<h3>No Pressure, No Obligations</h3>
							<p>You control every step. No surprise calls or unwanted emails.</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- CTA Section -->
		<section class="cta-section">
			<div class="container">
				<h2>Start your free settlement estimate</h2>
				<p>Get clear, private insight into what similar cases have resolved for—in under 2 minutes.</p>
				<a href="/get-started" class="cta-button">
					Get Started
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M5 12h14M12 5l7 7-7 7"/>
					</svg>
				</a>
			</div>
		</section>
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
	}

	.container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 0 20px;
	}

	/* Hero Section */
	.hero-section {
		padding: 60px 20px;
		text-align: center;
		background: linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%);
	}

	.hero-section h1 {
		font-size: 30px;
		font-weight: 700;
		margin-bottom: 24px;
		color: #1a1a1a;
		line-height: 1.2;
	}

	.hero-section p {
		font-size: 18px;
		color: #666;
		max-width: 700px;
		margin: 0 auto 32px;
		line-height: 1.6;
	}

	.hero-cta-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 16px 32px;
		background: linear-gradient(135deg, #FF6800 0%, #FFA500 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 18px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		text-decoration: none;
		box-shadow: 0 4px 15px rgba(255, 104, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.hero-cta-button:hover {
		background: linear-gradient(135deg, #FF8000 0%, #FFB733 100%);
		box-shadow: 0 6px 25px rgba(255, 104, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
	}

	.hero-cta-button svg {
		transition: transform 0.2s;
	}

	.hero-cta-button:hover svg {
		transform: translateX(3px);
	}

	/* Content Section */
	.content-section {
		padding: 60px 20px;
	}

	.content-section h2 {
		font-size: 30px;
		font-weight: 700;
		margin-bottom: 24px;
		color: #1a1a1a;
	}

	.content-section p {
		font-size: 18px;
		color: #666;
		line-height: 1.8;
		margin-bottom: 20px;
	}

	/* Process Section */
	.process-section {
		padding: 60px 20px;
		background: #f9f9f9;
	}

	.process-section h2 {
		font-size: 30px;
		font-weight: 700;
		margin-bottom: 40px;
		color: #1a1a1a;
	}

	.process-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.process-item {
		display: flex;
		gap: 20px;
		align-items: flex-start;
	}

	.process-number {
		width: 48px;
		height: 48px;
		background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 20px;
		font-weight: 700;
		flex-shrink: 0;
	}

	.process-content h3 {
		font-size: 20px;
		font-weight: 600;
		margin-bottom: 8px;
		color: #1a1a1a;
	}

	.process-content p {
		font-size: 16px;
		color: #666;
		line-height: 1.6;
		margin: 0;
	}

	/* Benefits Section */
	.benefits-section {
		padding: 60px 20px;
		background: white;
	}

	.benefits-section h2 {
		font-size: 30px;
		font-weight: 700;
		margin-bottom: 40px;
		color: #1a1a1a;
	}

	.benefits-grid {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.benefit-card {
		display: flex;
		gap: 24px;
		padding: 24px;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 16px;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
		transition: box-shadow 0.2s, transform 0.2s;
	}

	.benefit-card:hover {
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
		transform: translateY(-2px);
	}

	.benefit-icon {
		width: 64px;
		height: 64px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.lottie-icon {
		width: 64px;
		height: 64px;
	}

	.benefit-content h3 {
		font-size: 22px;
		font-weight: 600;
		margin-bottom: 8px;
		color: #1a1a1a;
	}

	.benefit-content p {
		font-size: 16px;
		color: #666;
		line-height: 1.6;
	}

	/* CTA Section */
	.cta-section {
		padding: 80px 20px;
		background: white;
		text-align: center;
	}

	.cta-section h2 {
		font-size: 30px;
		font-weight: 700;
		margin-bottom: 16px;
		color: #1a1a1a;
	}

	.cta-section p {
		font-size: 20px;
		margin-bottom: 32px;
		color: #666;
	}

	.cta-button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 16px 40px;
		background: linear-gradient(135deg, #FF6800 0%, #FFA500 100%);
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 700;
		font-size: 18px;
		transition: all 0.3s;
		box-shadow: 0 4px 15px rgba(255, 104, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.cta-button:hover {
		background: linear-gradient(135deg, #FF8000 0%, #FFB733 100%);
		transform: translateY(-2px);
		box-shadow: 0 6px 25px rgba(255, 104, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15);
	}

	.cta-button svg {
		transition: transform 0.2s;
	}

	.cta-button:hover svg {
		transform: translateX(3px);
	}

	/* Tablet */
	@media (min-width: 768px) {
		.hero-section {
			padding: 80px 20px;
		}

		.hero-section h1 {
			font-size: 38px;
		}
	}

	/* Desktop */
	@media (min-width: 1024px) {
		.hero-section h1 {
			font-size: 44px;
		}

		.hero-section p {
			font-size: 20px;
		}
	}

	/* Mobile Responsive */
	@media (max-width: 767px) {
		.benefit-card {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}
	}
</style>
