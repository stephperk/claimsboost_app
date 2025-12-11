<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { surveyResponses } from '$lib/stores/surveyStore.js';
	import { location } from '$lib/stores/locationStore.js';
	import SettlementCard from '$lib/components/SettlementCard.svelte';

	let responses = {};
	let userLocation = {};
	let sliderValue = 50; // 0-100, representing position on slider
	let displayedAmount = 0; // For count-up animation
	let isCountingUp = false;
	let showLabel = false; // Show "You could be owed" text
	let showAmount = false; // Show the amount number
	let showSlider = false; // Show the slider
	let showSubtext = false; // Show the subtext
	let showButton = false; // Show the consultation button
	let showBelowContent = false; // Show content below estimate after animations

	// Hardcoded settlements for demonstration
	const demoSettlements = [
		{
			type: 'Rear-end collision',
			amount: 85000,
			practiceArea: 'Vehicle Accidents',
			description: 'Whiplash and back injury from highway collision. Medical bills and lost wages covered.',
			lawFirm: 'Smith & Associates',
			firmUrl: '/injury-law-firms',
			matchingCriteria: ['Motor Vehicle Accident', 'Same injuries: Neck or back pain', 'Your area']
		},
		{
			type: 'Slip & fall at grocery store',
			amount: 125000,
			practiceArea: 'Premises Liability',
			description: 'Broken wrist and soft tissue damage from wet floor accident.',
			lawFirm: 'Johnson Law Group',
			firmUrl: '/injury-law-firms',
			matchingCriteria: ['Slip & Fall', 'Same injuries: Broken bone', 'Your area']
		},
		{
			type: 'Construction site accident',
			amount: 240000,
			practiceArea: 'Workplace Injuries',
			description: 'Multiple fractures and spinal injury from scaffolding collapse.',
			lawFirm: 'Williams & Partners',
			firmUrl: '/injury-law-firms',
			matchingCriteria: ['Workplace Injury', 'Same injuries: Severe injury', 'Your area']
		}
	];

	// Settlement data by injury type and severity (from SETTLEMENT_DATA.md)
	const SETTLEMENT_RANGES = {
		'vehicle-accident': {
			minor: { min: 10000, max: 25000 },
			moderate: { min: 25000, max: 100000 },
			severe: { min: 100000, max: 250000 },
			catastrophic: { min: 250000, max: 1000000 }
		},
		'slip-fall': {
			minor: { min: 10000, max: 25000 },
			moderate: { min: 25000, max: 75000 },
			severe: { min: 75000, max: 350000 },
			catastrophic: { min: 350000, max: 1000000 }
		},
		'work-injury': {
			minor: { min: 5000, max: 15000 },
			moderate: { min: 15000, max: 50000 },
			severe: { min: 50000, max: 150000 },
			catastrophic: { min: 150000, max: 500000 }
		},
		'medical-malpractice': {
			minor: { min: 50000, max: 150000 },
			moderate: { min: 150000, max: 400000 },
			severe: { min: 400000, max: 1000000 },
			catastrophic: { min: 1000000, max: 3000000 }
		},
		'product-liability': {
			minor: { min: 15000, max: 50000 },
			moderate: { min: 50000, max: 250000 },
			severe: { min: 250000, max: 1000000 },
			catastrophic: { min: 1000000, max: 10000000 }
		},
		'animal-attack': {
			minor: { min: 15000, max: 30000 },
			moderate: { min: 30000, max: 75000 },
			severe: { min: 75000, max: 150000 },
			catastrophic: { min: 150000, max: 500000 }
		}
	};

	const DEFAULT_RANGE = { min: 15000, max: 350000 };

	// Get settlement range based on injury type and severity
	function getSettlementRange(injuryType, severity) {
		const typeData = SETTLEMENT_RANGES[injuryType];
		if (!typeData) return DEFAULT_RANGE;
		return typeData[severity] || typeData.moderate || DEFAULT_RANGE;
	}

	function formatAmount(amount) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}


	// Calculate estimate based on slider position (0-100)
	function getEstimateFromSlider(min, max, position) {
		const range = max - min;
		return Math.round(min + (range * position / 100));
	}

	// Calculate 25th percentile
	function get25thPercentile(min, max) {
		const range = max - min;
		return Math.round(min + (range * 0.25));
	}

	// Calculate 75th percentile
	function get75thPercentile(min, max) {
		const range = max - min;
		return Math.round(min + (range * 0.75));
	}

	// Get color based on slider position (blue to orange via purple)
	function getAmountColor(position) {
		// Use three-point gradient: blue -> purple -> orange to avoid muddy middle
		const blue = { r: 37, g: 99, b: 235 };      // #2563EB
		const purple = { r: 168, g: 85, b: 247 };   // #A855F7 (vibrant purple)
		const orange = { r: 255, g: 123, b: 0 };    // #FF7B00

		let r, g, b;

		if (position <= 50) {
			// Interpolate between blue and purple (0-50%)
			const ratio = position / 50;
			r = Math.round(blue.r + (purple.r - blue.r) * ratio);
			g = Math.round(blue.g + (purple.g - blue.g) * ratio);
			b = Math.round(blue.b + (purple.b - blue.b) * ratio);
		} else {
			// Interpolate between purple and orange (50-100%)
			const ratio = (position - 50) / 50;
			r = Math.round(purple.r + (orange.r - purple.r) * ratio);
			g = Math.round(purple.g + (orange.g - purple.g) * ratio);
			b = Math.round(purple.b + (orange.b - purple.b) * ratio);
		}

		return `rgb(${r}, ${g}, ${b})`;
	}

	// Count up animation from 0 to target value
	function countUpTo(target) {
		// Wait 1 second, then show label
		setTimeout(() => {
			showLabel = true;

			// Wait another 1 second for suspense, then show amount and start count-up
			setTimeout(() => {
				showAmount = true;
				isCountingUp = true;

				const duration = 2500; // 2.5 seconds (slower)
				const steps = 60;
				const increment = target / steps;
				const stepDuration = duration / steps;
				let current = 0;

				const interval = setInterval(() => {
					current += increment;
					if (current >= target) {
						displayedAmount = target;
						clearInterval(interval);
						isCountingUp = false;
					} else {
						displayedAmount = Math.round(current);
					}
				}, stepDuration);

				// Sequential animations after count-up (adjusted for 2s total delay)
				setTimeout(() => {
					showSlider = true; // Show slider at 4.8s (2s delay + 2.8s)
				}, 2800);

				setTimeout(() => {
					showSubtext = true; // Show subtext at 5.2s (2s delay + 3.2s)
				}, 3200);

				setTimeout(() => {
					showButton = true; // Show button at 5.6s (2s delay + 3.6s)
				}, 3600);

				// Card bump happens at 5.5s (handled by CSS animation)
				// Shine happens at 6.5s (handled by CSS animation)

				// Show content below after all animations complete
				setTimeout(() => {
					showBelowContent = true;
				}, 7500); // After bump (1s) + shine (1.5s) + buffer (1s)
			}, 1000); // 1 second pause for suspense
		}, 1000); // 1 second before showing label
	}

	onMount(() => {
		// Subscribe to stores
		const unsubscribeSurvey = surveyResponses.subscribe(value => {
			responses = value;
		});
		const unsubscribeLocation = location.subscribe(value => {
			userLocation = value;
		});

		// Redirect if no survey data
		if (!responses.injuryType) {
			goto('/get-started');
		}

		return () => {
			unsubscribeSurvey();
			unsubscribeLocation();
		};
	});

	$: settlementRange = getSettlementRange(responses.injuryType, responses.severity);
	$: currentEstimate = getEstimateFromSlider(settlementRange.min, settlementRange.max, sliderValue);
	$: percentile25 = get25thPercentile(settlementRange.min, settlementRange.max);
	$: percentile75 = get75thPercentile(settlementRange.min, settlementRange.max);
	$: estimateColor = getAmountColor(sliderValue);

	// Start count-up animation when estimate is ready
	let hasStartedAnimation = false;
	$: if (currentEstimate > 0 && !hasStartedAnimation) {
		hasStartedAnimation = true;
		countUpTo(currentEstimate);
	}

	// Update displayed amount when slider moves
	$: if (currentEstimate > 0 && !isCountingUp && showAmount) {
		displayedAmount = currentEstimate;
	}
</script>

<section class="results-page">
	<!-- Header -->
	<header class="results-header">
		<div class="header-content">
			<a href="/">
				<img src="/claimsboost-logo.webp" alt="ClaimsBoost" class="logo" width="450" height="98" />
			</a>
		</div>
	</header>

	<div class="container">
		<!-- Settlement Range Display -->
		{#if settlementRange}
			<div class="estimate-range">
				<h2 class="estimate-title">Settlement estimate</h2>
				<div class="estimate-card">
					<p class="estimate-label" class:fade-in={showLabel} class:hidden={!showLabel}>You could be owed</p>

					<div class="estimate-amount" class:fade-in={showAmount} class:hidden={!showAmount} style="color: {estimateColor};">
						{formatAmount(displayedAmount)}
					</div>

					<div class="slider-container" class:fade-in={showSlider} class:hidden={!showSlider}>
						<input
							type="range"
							min="0"
							max="100"
							bind:value={sliderValue}
							class="slider-input"
							style="--slider-value: {sliderValue}%;"
						/>
						<div class="slider-labels">
							<span class="slider-label-left">{formatAmount(percentile25)}</span>
							<span class="slider-label-center">Average</span>
							<span class="slider-label-right">{formatAmount(percentile75)}</span>
						</div>
					</div>

					<p class="estimate-basis" class:fade-in={showSubtext} class:hidden={!showSubtext}>Your estimate is based on similar personal injury cases in {$location.state || 'your state'}.</p>

					<button class="consultation-button" class:fade-in={showButton} class:hidden={!showButton} onclick={() => goto('/injury-law-firms')}>
						Get Free Consultation
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M5 12h14M12 5l7 7-7 7"/>
						</svg>
					</button>
				</div>
			</div>
		{/if}

		{#if showBelowContent}
			<!-- Similar Settlements Section -->
			<div class="settlements-section below-content">
				<h2>Settlements similar to your case</h2>
				<p class="subtitle">These recent settlements match your injury type, location, and circumstances.</p>

				<div class="settlements-grid">
					{#each demoSettlements as settlement}
						<SettlementCard
							{settlement}
							matchingCriteria={settlement.matchingCriteria}
						/>
					{/each}
				</div>
			</div>

			<!-- CTA Section -->
			<div class="cta-section below-content">
			<h2>Prefer to browse on your own?</h2>
			<p>Search over 20,000 verified personal injury law firms across the country.</p>
			<button class="cta-button" onclick={() => goto('/injury-law-firms')}>
				Search law firms
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M5 12h14M12 5l7 7-7 7"/>
				</svg>
			</button>
		</div>
		{/if}
	</div>
</section>

<style>
	.results-page {
		min-height: 100vh;
		background: #ffffff;
	}

	.results-header {
		background: white;
		padding: 0 20px;
		border-bottom: 1px solid #e5e5e5;
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 70px;
	}

	.logo {
		max-height: 49px;
		width: auto;
		object-fit: contain;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 40px 20px;
	}

	.page-title {
		font-size: 32px;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 40px;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
	}

	.checkmark-circle {
		filter: drop-shadow(0 4px 12px rgba(16, 185, 129, 0.3));
		animation: scaleIn 0.5s ease-out;
		flex-shrink: 0;
	}

	@keyframes scaleIn {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.estimate-range {
		margin-bottom: 48px;
	}

	.estimate-title {
		font-size: 28px;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 24px;
		text-align: center;
	}

	.estimate-card {
		background: white;
		border-radius: 24px;
		padding: 48px 32px;
		position: relative;
		text-align: center;
		border: 3px solid transparent;
		background-image:
			linear-gradient(white, white),
			linear-gradient(135deg, #2563EB 0%, #A855F7 50%, #FF7B00 100%);
		background-origin: border-box;
		background-clip: padding-box, border-box;
		box-shadow:
			0 4px 20px rgba(0, 0, 0, 0.08),
			0 0 40px rgba(37, 99, 235, 0.3),
			0 0 60px rgba(255, 123, 0, 0.2);
		overflow: hidden;
		animation: cardLift 1s ease-in-out 5.5s;
	}

	.estimate-card::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -100%;
		width: 100%;
		height: 200%;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.3),
			rgba(255, 255, 255, 0.5),
			rgba(255, 255, 255, 0.3),
			transparent
		);
		transform: skewX(-25deg);
		animation: shine 1.5s ease-in-out 6.5s;
		pointer-events: none;
	}

	@keyframes shine {
		0% {
			left: -100%;
		}
		100% {
			left: 200%;
		}
	}

	@keyframes cardLift {
		0% {
			transform: translateY(0);
			box-shadow:
				0 4px 20px rgba(0, 0, 0, 0.08),
				0 0 40px rgba(37, 99, 235, 0.3),
				0 0 60px rgba(255, 123, 0, 0.2);
		}
		50% {
			transform: translateY(-8px);
			box-shadow:
				0 12px 30px rgba(0, 0, 0, 0.12),
				0 0 50px rgba(37, 99, 235, 0.4),
				0 0 80px rgba(255, 123, 0, 0.3);
		}
		100% {
			transform: translateY(0);
			box-shadow:
				0 4px 20px rgba(0, 0, 0, 0.08),
				0 0 40px rgba(37, 99, 235, 0.3),
				0 0 60px rgba(255, 123, 0, 0.2);
		}
	}

	.estimate-label {
		font-size: 18px;
		font-weight: 500;
		color: #1a1a1a;
		margin-bottom: 16px;
	}

	.estimate-amount {
		font-size: 48px;
		font-weight: 700;
		margin-bottom: 32px;
		line-height: 1.2;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		flex-wrap: wrap;
		transition: color 0.3s ease;
	}

	.slider-container {
		margin: 32px 0;
		padding: 0 16px;
	}

	.slider-input {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 8px;
		background: linear-gradient(90deg, #2563EB 0%, #A855F7 50%, #FF7B00 100%);
		border-radius: 4px;
		outline: none;
		margin-bottom: 12px;
		cursor: pointer;
	}

	.slider-input::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 24px;
		height: 24px;
		background: white;
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		transition: transform 0.2s ease;
	}

	.slider-input::-webkit-slider-thumb:hover {
		transform: scale(1.1);
	}

	.slider-input::-webkit-slider-thumb:active {
		transform: scale(0.95);
	}

	.slider-input::-moz-range-thumb {
		width: 24px;
		height: 24px;
		background: white;
		border: none;
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		transition: transform 0.2s ease;
	}

	.slider-input::-moz-range-thumb:hover {
		transform: scale(1.1);
	}

	.slider-input::-moz-range-thumb:active {
		transform: scale(0.95);
	}

	.slider-labels {
		display: flex;
		justify-content: space-between;
		font-size: 14px;
		color: #666;
	}

	.slider-label-center {
		font-weight: 600;
		color: #1a1a1a;
	}

	.estimate-basis {
		font-size: 15px;
		color: #666;
		line-height: 1.6;
		margin-top: 32px;
		padding-top: 24px;
		border-top: 1px solid #E5E7EB;
	}

	.consultation-button {
		margin-top: 24px;
		padding: 16px 32px;
		background: linear-gradient(135deg, #2563EB 0%, #A855F7 50%, #FF7B00 100%);
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
		box-shadow:
			0 4px 15px rgba(37, 99, 235, 0.4),
			0 4px 15px rgba(168, 85, 247, 0.3),
			0 4px 15px rgba(255, 123, 0, 0.4),
			0 2px 4px rgba(0, 0, 0, 0.1);
		position: relative;
		overflow: hidden;
	}

	.consultation-button::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -100%;
		width: 100%;
		height: 200%;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.4),
			rgba(255, 255, 255, 0.7),
			rgba(255, 255, 255, 0.4),
			transparent
		);
		transform: skewX(-25deg);
		animation: buttonShine 1.5s ease-in-out 6.5s;
		pointer-events: none;
	}

	@keyframes buttonShine {
		0% {
			left: -100%;
		}
		100% {
			left: 200%;
		}
	}

	.consultation-button:hover {
		transform: translateY(-2px);
		box-shadow:
			0 6px 25px rgba(37, 99, 235, 0.5),
			0 6px 25px rgba(168, 85, 247, 0.4),
			0 6px 25px rgba(255, 123, 0, 0.5),
			0 3px 6px rgba(0, 0, 0, 0.15);
	}

	.hidden {
		opacity: 0;
		pointer-events: none;
	}

	.fade-in {
		animation: fadeIn 0.8s ease-out forwards;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.below-content {
		animation: fadeInUp 1.2s ease-out forwards;
		opacity: 0;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.settlements-section {
		margin-bottom: 48px;
	}

	.settlements-section h2 {
		font-size: 28px;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 12px;
	}

	.subtitle {
		color: #666;
		font-size: 16px;
		margin-bottom: 32px;
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

	@media (min-width: 1024px) {
		.settlements-grid {
			grid-template-columns: repeat(3, 1fr);
		}

		.estimate-card {
			max-width: 70%;
			margin: 0 auto;
		}
	}

	.cta-section {
		text-align: center;
		padding: 48px 32px;
		background: transparent;
	}

	.cta-section h2 {
		font-size: 28px;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 16px;
	}

	.cta-section p {
		font-size: 18px;
		color: #666;
		margin-bottom: 24px;
	}

	.cta-button {
		padding: 16px 32px;
		background: linear-gradient(135deg, #FF6800 0%, #FFA500 100%);
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
		box-shadow: 0 4px 15px rgba(255, 104, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.cta-button:hover {
		background: linear-gradient(135deg, #FF8000 0%, #FFB733 100%);
		box-shadow: 0 6px 25px rgba(255, 104, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
	}
</style>
