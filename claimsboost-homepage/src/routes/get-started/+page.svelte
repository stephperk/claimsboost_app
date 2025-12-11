<script>
	import { goto, pushState, replaceState } from '$app/navigation';
	import { onMount } from 'svelte';
	import lottie from 'lottie-web';
	import { surveyResponses } from '$lib/stores/surveyStore.js';

	let currentStep = $state(1);
	let responses = $state({
		injuryType: '',
		timeframe: '',
		medicalTreatment: '',
		fault: '',
		severity: '',
		firstName: '',
		lastName: '',
		email: '',
		phone: ''
	});

	const totalSteps = 7;

	// Loading screen state
	let loadingStep = $state(0);
	let loadingSteps = $state([
		{ label: 'Searching for similar cases', completed: false },
		{ label: 'Analyzing settlement outcomes', completed: false },
		{ label: 'Generating settlement estimate', completed: false }
	]);

	const injuryTypes = [
		{ id: 'vehicle-accident', label: 'In a motor vehicle accident', icon: '/wired-outline-868-car-crash-hover-pinch.json' },
		{ id: 'slip-fall', label: "On someone else's property", icon: '/wired-outline-481-shop-hover-pinch.json' },
		{ id: 'work-injury', label: 'At work or a job site', icon: '/wired-outline-408-worker-helmet-hover-pinch.json' },
		{ id: 'medical-malpractice', label: 'During medical care or surgery', icon: '/wired-outline-671-male-doctor-care-hover-pinch.json' },
		{ id: 'product-liability', label: 'From an unsafe product or device', icon: '/wired-outline-1140-error-hover-enlarge.json' },
		{ id: 'animal-attack', label: 'From a dog or other animal bite', icon: '/wired-outline-1161-angry-dog-hover-pinch.json' }
	];

	// Store Lottie animation instances
	let lottieAnimations = {};

	// Load Lottie animations for step 1
	function loadStep1Animations() {
		// Clean up existing animations first
		Object.values(lottieAnimations).forEach(anim => anim?.destroy());
		lottieAnimations = {};

		// Load new animations
		injuryTypes.forEach(type => {
			if (type.icon) {
				const container = document.getElementById(`lottie-${type.id}`);
				if (container) {
					lottieAnimations[type.id] = lottie.loadAnimation({
						container: container,
						renderer: 'svg',
						loop: false,
						autoplay: false,
						path: type.icon
					});
				}
			}
		});
	}

	// Load animations on mount and when returning to step 1
	onMount(() => {
		if (currentStep === 1) {
			loadStep1Animations();
		}

		return () => {
			// Cleanup animations on unmount
			Object.values(lottieAnimations).forEach(anim => anim?.destroy());
		};
	});

	// Reload animations when returning to step 1
	$effect(() => {
		if (currentStep === 1) {
			// Use setTimeout to ensure DOM is ready
			setTimeout(() => {
				loadStep1Animations();
			}, 0);
		}
	});

	// Auto-progress through loading screen
	let loadingLottieAnimation;
	let progressInterval;

	$effect(() => {
		if (currentStep === 6) {
			// Reset loading state
			loadingStep = 0;
			loadingSteps = [
				{ label: 'Searching for similar cases', completed: false },
				{ label: 'Analyzing settlement outcomes', completed: false },
				{ label: 'Generating settlement estimate', completed: false }
			];

			// Load the loading icon animation
			setTimeout(() => {
				const container = document.getElementById('loading-lottie-icon');
				if (container) {
					loadingLottieAnimation = lottie.loadAnimation({
						container: container,
						renderer: 'svg',
						loop: true,
						autoplay: true,
						path: '/wired-outline-12-layers-hover-squeeze.json'
					});
				}
			}, 0);

			// Progress through loading steps
			progressInterval = setInterval(() => {
				if (loadingStep < 3) {
					// Create new array with updated completed status to trigger reactivity
					loadingSteps = [
						{ label: 'Searching for similar cases', completed: loadingStep >= 0 },
						{ label: 'Analyzing settlement outcomes', completed: loadingStep >= 1 },
						{ label: 'Generating settlement estimate', completed: loadingStep >= 2 }
					];
					loadingStep++;
				} else {
					clearInterval(progressInterval);
					// Move to final step after short delay
					setTimeout(() => {
						currentStep = 7;
						// Clean up loading animation
						if (loadingLottieAnimation) {
							loadingLottieAnimation.destroy();
							loadingLottieAnimation = null;
						}
					}, 800);
				}
			}, 1500); // 1.5 seconds per step

			return () => {
				if (progressInterval) clearInterval(progressInterval);
				if (loadingLottieAnimation) {
					loadingLottieAnimation.destroy();
					loadingLottieAnimation = null;
				}
			};
		}
	});

	// Play animation on hover or click
	function playAnimation(typeId) {
		const anim = lottieAnimations[typeId];
		if (anim) {
			anim.goToAndPlay(0, true); // Reset to start and play
		}
	}

	// Stop animation on mouse leave
	function stopAnimation(typeId) {
		const anim = lottieAnimations[typeId];
		if (anim) {
			anim.goToAndStop(0, true); // Reset to start and stop
		}
	}

	const timeframeOptions = [
		{ id: 'last-30-days', label: 'Within the last 30 days' },
		{ id: '1-3-months', label: '1–3 months ago' },
		{ id: '3-6-months', label: '3–6 months ago' },
		{ id: '6-12-months', label: '6–12 months ago' },
		{ id: 'over-year', label: 'Over a year ago' },
		{ id: 'not-sure', label: 'Not sure' }
	];

	const medicalTreatmentOptions = [
		{ id: 'er-hospital', label: 'Yes, I went to the ER or hospital' },
		{ id: 'doctor-chiropractor', label: 'Yes, I saw a doctor or chiropractor' },
		{ id: 'plan-to', label: 'Not yet, but I plan to' },
		{ id: 'no', label: "No, I haven't" }
	];

	const faultOptions = [
		{ id: 'yes', label: 'Yes' },
		{ id: 'no', label: 'No' },
		{ id: 'not-sure', label: 'Not sure' }
	];

	const severityOptions = [
		{ id: 'minor', label: "Minor - I'm recovering quickly" },
		{ id: 'moderate', label: 'Moderate - I needed ongoing treatment' },
		{ id: 'severe', label: 'Severe - I required surgery or extended care' },
		{ id: 'catastrophic', label: 'Life-changing - Permanent injury or loss' }
	];

	function goBack() {
		if (currentStep > 1) {
			currentStep--;
		} else {
			goto('/');
		}
	}

	function nextStep() {
		if (canProceed()) {
			if (currentStep < totalSteps) {
				currentStep++;
				// Push state to history for browser back button support
				pushState('', { step: currentStep });
			} else {
				handleSubmit();
			}
		}
	}

	function canProceed() {
		switch (currentStep) {
			case 1:
				return responses.injuryType !== '';
			case 2:
				return responses.timeframe !== '';
			case 3:
				return responses.medicalTreatment !== '';
			case 4:
				return responses.fault !== '';
			case 5:
				return responses.severity !== '';
			case 6:
				return false; // Loading screen - no manual proceed
			case 7:
				return (
					responses.firstName.trim() !== '' &&
					responses.lastName.trim() !== '' &&
					responses.email.trim() !== '' &&
					responses.phone.trim() !== ''
				);
			default:
				return false;
		}
	}

	function handleSubmit() {
		console.log('Survey responses:', responses);
		// Save responses to store
		surveyResponses.set(responses);
		goto('/thank-you');
	}

	function selectOption(field, value) {
		responses[field] = value;

		// Auto-progress to next question after brief delay (not for multi-select)
		setTimeout(() => {
			nextStep();
		}, 400);
	}

	function handleKeyDown(event) {
		if (event.key === 'Enter' && canProceed()) {
			event.preventDefault();
			nextStep();
		}
	}

	$effect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	$effect(() => {
		// Set initial history state
		replaceState('', { step: currentStep });

		// Handle browser back button
		function handlePopState(event) {
			if (event.state && event.state.step) {
				currentStep = event.state.step;
			} else if (currentStep > 1) {
				currentStep--;
			} else {
				// If on first step, let the browser navigate away
				window.history.back();
			}
		}

		window.addEventListener('popstate', handlePopState);
		return () => {
			window.removeEventListener('popstate', handlePopState);
		};
	});

	$effect(() => {
		// Scroll to top when step changes
		window.scrollTo({ top: 0, behavior: 'smooth' });

		// Auto-focus first name input on step 7
		if (currentStep === 7) {
			setTimeout(() => {
				document.getElementById('firstName')?.focus();
			}, 100);
		}
	});
</script>

<section class="survey">
	<!-- Header -->
	<header class="survey-header">
		<div class="header-content">
			<a href="/">
				<img src="/claimsboost-logo.webp" alt="ClaimsBoost" class="logo" width="450" height="98" />
			</a>
		</div>
	</header>

	<!-- Progress Bar -->
	<div class="progress-bar-container">
		<div class="progress-bar" style="width: {(currentStep / totalSteps) * 100}%"></div>
	</div>

	<div class="survey-container">
		<div class="survey-card">
			<!-- Step 1: Injury Type -->
			{#if currentStep === 1}
				<div class="step-content">
					<h1 class="step-title">How were you injured?</h1>

					<div class="options-list">
						{#each injuryTypes as type}
							<button
								class="option-button {responses.injuryType === type.id ? 'selected' : ''}"
								onclick={() => {
									selectOption('injuryType', type.id);
									if (type.icon) playAnimation(type.id);
								}}
								onmouseenter={() => type.icon && playAnimation(type.id)}
								onmouseleave={() => type.icon && stopAnimation(type.id)}
							>
								{#if type.icon}
									<div id="lottie-{type.id}" class="option-icon"></div>
								{/if}
								<span class="option-label">{type.label}</span>
								{#if responses.injuryType === type.id}
									<svg class="checkmark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
										<polyline points="20 6 9 17 4 12"/>
									</svg>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Step 2: Timeframe -->
			{#if currentStep === 2}
				<div class="step-content">
					<h1 class="step-title">When did the injury occur?</h1>

					<div class="options-list">
						{#each timeframeOptions as option}
							<button
								class="option-button {responses.timeframe === option.id ? 'selected' : ''}"
								onclick={() => selectOption('timeframe', option.id)}
							>
								<span class="option-label">{option.label}</span>
								{#if responses.timeframe === option.id}
									<svg class="checkmark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
										<polyline points="20 6 9 17 4 12"/>
									</svg>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Step 3: Medical Treatment -->
			{#if currentStep === 3}
				<div class="step-content">
					<h1 class="step-title">Did you receive medical care?</h1>

					<div class="options-list">
						{#each medicalTreatmentOptions as option}
							<button
								class="option-button {responses.medicalTreatment === option.id ? 'selected' : ''}"
								onclick={() => selectOption('medicalTreatment', option.id)}
							>
								<span class="option-label">{option.label}</span>
								{#if responses.medicalTreatment === option.id}
									<svg class="checkmark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
										<polyline points="20 6 9 17 4 12"/>
									</svg>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Step 4: Fault/Liability -->
			{#if currentStep === 4}
				<div class="step-content">
					<h1 class="step-title">Do you believe someone else was at fault for your injury?</h1>

					<div class="options-list">
						{#each faultOptions as option}
							<button
								class="option-button {responses.fault === option.id ? 'selected' : ''}"
								onclick={() => selectOption('fault', option.id)}
							>
								<span class="option-label">{option.label}</span>
								{#if responses.fault === option.id}
									<svg class="checkmark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
										<polyline points="20 6 9 17 4 12"/>
									</svg>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Step 5: Injury Severity -->
			{#if currentStep === 5}
				<div class="step-content">
					<h1 class="step-title">How would you describe the severity of your injuries?</h1>

					<div class="options-list">
						{#each severityOptions as option}
							<button
								class="option-button {responses.severity === option.id ? 'selected' : ''}"
								onclick={() => selectOption('severity', option.id)}
							>
								<span class="option-label">{option.label}</span>
								{#if responses.severity === option.id}
									<svg class="checkmark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
										<polyline points="20 6 9 17 4 12"/>
									</svg>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Step 6: Loading Screen -->
			{#if currentStep === 6}
				<div class="step-content loading-screen">
					<h1 class="loading-title">Calculating your settlement estimate</h1>

					<!-- Animated circle with lottie icon -->
					<div class="loading-circle-container">
						<div class="loading-circle">
							<div id="loading-lottie-icon" class="loading-lottie-icon"></div>
						</div>
						<svg class="progress-ring" width="145" height="145">
							<circle cx="72" cy="72" r="61" fill="none" stroke="#DBEAFE" stroke-width="6"/>
							<circle class="progress-ring-circle" cx="72" cy="72" r="61" fill="none" stroke="#2563EB" stroke-width="6"/>
						</svg>
					</div>

					<!-- Pulsing dots -->
					<div class="loading-dots">
						<div class="dot"></div>
						<div class="dot"></div>
						<div class="dot"></div>
					</div>

					<!-- Progress steps -->
					<div class="progress-steps">
						{#each loadingSteps as step, index (index)}
							<div class="progress-step">
								<div class="step-indicator">
									{#if step.completed}
										<div class="step-circle completed">
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
												<polyline points="20 6 9 17 4 12"/>
											</svg>
										</div>
									{:else if index === loadingStep}
										<div class="step-circle active">
											<div class="pulse"></div>
										</div>
									{:else}
										<div class="step-circle inactive"></div>
									{/if}
									{#if index < loadingSteps.length - 1}
										<div class="step-line"></div>
									{/if}
								</div>
								<div class="step-text">
									<div class="step-label">Step {index + 1}</div>
									<div class="progress-step-title">{step.label}</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Step 7: Contact Information -->
			{#if currentStep === 7}
				<div class="step-content final-step">
					<div class="title-with-checkmark">
						<h1 class="step-title final-title">Your estimate is ready</h1>
						<svg class="checkmark-circle" width="32" height="32" viewBox="0 0 48 48" fill="none">
							<circle cx="24" cy="24" r="24" fill="#10B981"/>
							<polyline points="14 24 20 30 34 16" stroke="white" stroke-width="3" fill="none"/>
						</svg>
					</div>

					<p class="step-subtitle">We need your contact info to share your estimate.</p>

					<div class="form-fields">
						<div class="form-row">
							<div class="form-group">
								<label for="firstName">First name</label>
								<input
									id="firstName"
									type="text"
									bind:value={responses.firstName}
									placeholder="John"
									class="form-input"
								/>
							</div>
							<div class="form-group">
								<label for="lastName">Last name</label>
								<input
									id="lastName"
									type="text"
									bind:value={responses.lastName}
									placeholder="Smith"
									class="form-input"
								/>
							</div>
						</div>

						<div class="form-group">
							<label for="email">Email address</label>
							<input
								id="email"
								type="email"
								inputmode="email"
								bind:value={responses.email}
								placeholder="john.smith@example.com"
								class="form-input"
							/>
						</div>

						<div class="form-group">
							<label for="phone">Phone number</label>
							<input
								id="phone"
								type="tel"
								inputmode="numeric"
								bind:value={responses.phone}
								placeholder="(555) 123-4567"
								class="form-input"
							/>
						</div>
					</div>

					<div class="consent-text">
						<p>
							By clicking "View my estimate", I agree that ClaimsBoost and law firms in ClaimsBoost's network may call and text me about my request for information about my legal rights. Calls may be recorded for quality and training purposes, and may be made by autodialer and/or prerecorded voice. Consent is not required to use ClaimsBoost's services. Msg & data rates may apply.
						</p>
						<p class="consent-links">
							<a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a> apply.
						</p>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Next Button -->
	{#if currentStep !== 6}
		<div class="button-container">
			<button
				class="next-button {currentStep === 7 ? 'submit-button' : ''}"
				onclick={nextStep}
				disabled={!canProceed()}
			>
				{currentStep === 7 ? 'View my estimate' : 'Next'}
			</button>
		</div>
	{/if}

	<!-- Footer -->
	<footer class="survey-footer">
		<div class="footer-content">
			<p class="copyright">© 2025 ClaimsBoost, Inc. All rights reserved.</p>
			<p class="disclaimer">ClaimsBoost connects injury victims with qualified personal injury attorneys.</p>
			<div class="footer-links">
				<a href="/privacy">Privacy Policy</a>
				<a href="/terms">Terms of Service</a>
				<a href="/disclaimer">Disclaimer</a>
				<a href="/accessibility">Accessibility</a>
			</div>
		</div>
		<br><br><br><br><br>
	</footer>
</section>

<style>
	.survey {
		min-height: 100vh;
		background: #ffffff;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	.survey-header {
		background: white;
		padding: 0 20px;
		border-bottom: 1px solid #e5e5e5;
	}

	.header-content {
		max-width: 1000px;
		margin: 0 auto;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 70px;
	}

	.survey-header a {
		display: inline-block;
	}

	.logo {
		max-height: 49px;
		width: auto;
		object-fit: contain;
	}

	.progress-bar-container {
		width: 100%;
		height: 8px;
		background: #e5e5e5;
		position: relative;
	}

	.progress-bar {
		height: 100%;
		background: linear-gradient(90deg, #60A5FA 0%, #2563EB 100%);
		transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow:
			0 2px 10px rgba(96, 165, 250, 0.3),
			0 0 20px rgba(96, 165, 250, 0.25),
			0 0 30px rgba(37, 99, 235, 0.15);
		position: relative;
	}

	.progress-bar::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: inherit;
		filter: blur(3px);
		opacity: 0.2;
		z-index: -1;
	}

	.survey-container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 0;
		width: 100%;
		flex: 1;
	}

	.survey-card {
		background: white;
		padding: 40px 20px;
		min-height: calc(100vh - 120px);
		display: flex;
		flex-direction: column;
	}

	.step-content {
		flex: 1;
		max-width: 612px;
		margin: 0 auto;
		width: 100%;
	}

	.step-title {
		font-size: 28px;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 32px;
		line-height: 1.3;
	}

	.step-subtitle {
		font-size: 16px;
		color: #666;
		margin-top: -16px;
		margin-bottom: 24px;
		font-weight: 400;
	}

	@media (min-width: 769px) {
		.step-subtitle {
			margin-top: 0;
		}
	}

	.options-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-bottom: 40px;
	}

	.option-button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 18px 20px;
		background: white;
		border: none;
		border-radius: 16px;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
		text-align: left;
		font-size: 16px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
	}

	.option-icon {
		width: 24px;
		height: 24px;
		margin-right: 10px;
		flex-shrink: 0;
	}

	.option-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0,0,0,0.22);
	}

	.option-button:focus {
		outline: none;
	}

	.option-button.selected {
		background: #eff6ff;
		box-shadow: 0 0 0 2px #2563EB, 0 2px 8px rgba(0,0,0,0.18);
		animation: bounce 0.4s ease-out;
	}

	@keyframes bounce {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
		100% {
			transform: scale(1);
		}
	}

	.option-label {
		flex: 1;
		font-weight: 500;
		color: #1a1a1a;
	}

	.checkmark {
		flex-shrink: 0;
		color: #2563EB;
	}

	.final-step {
		text-align: center;
	}

	.title-with-checkmark {
		display: flex;
		align-items: flex-start;
		justify-content: center;
		gap: 12px;
		margin-bottom: 16px;
	}

	.checkmark-circle {
		filter: drop-shadow(0 4px 12px rgba(16, 185, 129, 0.3));
		animation: scaleIn 0.5s ease-out;
		flex-shrink: 0;
		margin-top: 0px;
	}

	@media (min-width: 769px) {
		.checkmark-circle {
			margin-top: 8px;
		}
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

	.final-title {
		margin-bottom: 0;
	}

	.form-fields {
		display: flex;
		flex-direction: column;
		gap: 20px;
		margin-bottom: 24px;
		text-align: left;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	@media (max-width: 380px) {
		.form-row {
			grid-template-columns: 1fr;
		}
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-group label {
		font-size: 14px;
		font-weight: 500;
		color: #4b5563;
	}

	.form-input {
		padding: 14px 16px;
		border: 2px solid #d1d5db;
		border-radius: 8px;
		font-size: 16px;
		transition: all 0.2s;
		font-family: inherit;
		background: white;
		width: 100%;
		box-sizing: border-box;
	}

	.form-input:focus {
		outline: none;
		border-color: #2563EB;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
	}

	.consent-text {
		margin-top: 24px;
		padding: 20px;
		background: #f9fafb;
		border-radius: 12px;
		font-size: 13px;
		color: #6b7280;
		line-height: 1.6;
		text-align: left;
	}

	.consent-text p {
		margin: 0 0 12px 0;
	}

	.consent-text p:last-child {
		margin-bottom: 0;
	}

	.consent-links {
		font-size: 13px;
	}

	.consent-links a {
		color: #FF7B00;
		text-decoration: underline;
		font-weight: 500;
	}

	.consent-links a:hover {
		color: #D85A00;
	}

	.button-container {
		max-width: 612px;
		margin: 0 auto;
		width: 100%;
		display: flex;
		justify-content: flex-end;
	}

	.next-button {
		padding: 16px 32px;
		background: linear-gradient(135deg, #FF6800 0%, #FFA500 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		min-width: 180px;
		box-shadow: 0 4px 15px rgba(255, 104, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.next-button:hover:not(:disabled) {
		background: linear-gradient(135deg, #FF8000 0%, #FFB733 100%);
		box-shadow: 0 6px 25px rgba(255, 104, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
	}

	.next-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.submit-button {
		min-width: 240px;
		font-size: 17px;
		padding: 18px 36px;
	}

	@media (max-width: 768px) {
		.submit-button {
			min-width: 0;
		}
	}

	@media (max-width: 768px) {
		.survey-card {
			padding: 32px 20px 100px;
		}

		.step-title {
			font-size: 24px;
			margin-bottom: 24px;
		}

		.button-container {
			position: fixed !important;
			bottom: 0 !important;
			left: 0 !important;
			right: 0 !important;
			max-width: 100% !important;
			margin: 0 !important;
			padding: 16px 20px !important;
			background: white !important;
			border-top: 1px solid #e5e5e5 !important;
			box-shadow: 0 -2px 10px rgba(0,0,0,0.1) !important;
			z-index: 10 !important;
		}

		.next-button {
			width: 100% !important;
			min-width: 0 !important;
		}
	}

	@media (min-width: 769px) {
		.survey-card {
			padding: 60px 40px;
		}

		.step-title {
			font-size: 32px;
		}

		.button-container {
			position: relative;
			bottom: 40px;
		}
	}

	.survey-footer {
		background: #f8f9fa;
		padding: 32px 20px;
		margin-top: auto;
		border-top: 1px solid #e5e5e5;
	}

	.footer-content {
		max-width: 1000px;
		margin: 0 auto;
		text-align: center;
	}

	.copyright {
		font-size: 13px;
		color: #666;
		margin-bottom: 8px;
	}

	.disclaimer {
		font-size: 12px;
		color: #666;
		margin-bottom: 16px;
	}

	.footer-links {
		display: flex;
		justify-content: center;
		gap: 20px;
		flex-wrap: wrap;
	}

	.footer-links a {
		font-size: 12px;
		color: #666;
		text-decoration: underline;
		transition: color 0.2s;
	}

	.footer-links a:hover {
		color: #1a1a1a;
	}
	/* Loading Screen Styles */
	.loading-screen {
		text-align: center;
		max-width: 600px;
		margin: 0 auto;
	}

	.loading-title {
		font-size: 24px;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 24px;
	}

	.loading-circle-container {
		position: relative;
		width: 145px;
		height: 145px;
		margin: 0 auto 20px;
	}

	.loading-circle {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 87px;
		height: 87px;
		background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2;
		animation: pulse-circle 2s ease-in-out infinite;
	}

	@keyframes pulse-circle {
		0%, 100% {
			transform: translate(-50%, -50%) scale(1);
		}
		50% {
			transform: translate(-50%, -50%) scale(1.05);
		}
	}

	.loading-lottie-icon {
		width: 43px;
		height: 43px;
		filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
	}

	.progress-ring {
		position: absolute;
		top: 0;
		left: 0;
		transform: rotate(-90deg);
	}

	.progress-ring-circle {
		stroke-dasharray: 383;
		stroke-dashoffset: 383;
		animation: progress-animation 5s ease-out forwards;
		stroke-linecap: round;
	}

	@keyframes progress-animation {
		to {
			stroke-dashoffset: 0;
		}
	}

	.loading-dots {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin-bottom: 32px;
	}

	.dot {
		width: 10px;
		height: 10px;
		background: #2563EB;
		border-radius: 50%;
		animation: dot-pulse 1.4s ease-in-out infinite;
	}

	.dot:nth-child(1) {
		animation-delay: 0s;
	}

	.dot:nth-child(2) {
		animation-delay: 0.2s;
	}

	.dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes dot-pulse {
		0%, 80%, 100% {
			opacity: 0.3;
			transform: scale(0.8);
		}
		40% {
			opacity: 1;
			transform: scale(1.2);
		}
	}

	.progress-steps {
		text-align: left;
		margin-bottom: 32px;
		padding: 0 20px;
	}

	.progress-step {
		display: flex;
		gap: 16px;
		margin-bottom: 20px;
		position: relative;
	}

	.progress-step:last-child {
		margin-bottom: 0;
	}

	.step-indicator {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
	}

	.step-circle {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		position: relative;
	}

	.step-circle.completed {
		background: #10B981;
		animation: check-bounce 0.5s ease-out;
	}

	@keyframes check-bounce {
		0% {
			transform: scale(0);
		}
		50% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
		}
	}

	.step-circle.active {
		background: #2563EB;
		animation: pulse-active 1.5s ease-in-out infinite;
	}

	@keyframes pulse-active {
		0%, 100% {
			box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
		}
		50% {
			box-shadow: 0 0 0 10px rgba(37, 99, 235, 0);
		}
	}

	.step-circle.inactive {
		background: #E5E7EB;
	}

	.pulse {
		width: 16px;
		height: 16px;
		background: white;
		border-radius: 50%;
		animation: pulse-inner 1.5s ease-in-out infinite;
	}

	@keyframes pulse-inner {
		0%, 100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(0.7);
			opacity: 0.7;
		}
	}

	.step-line {
		width: 2px;
		height: 40px;
		background: #E5E7EB;
		margin: 4px auto 0;
	}

	.step-text {
		flex: 1;
		padding-top: 4px;
	}

	.step-label {
		font-size: 13px;
		color: #999;
		margin-bottom: 4px;
	}

	.progress-step-title {
		font-size: 15px;
		color: #1a1a1a;
		font-weight: 500;
	}

</style>
