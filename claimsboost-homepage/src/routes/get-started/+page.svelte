<script>
	import { goto } from '$app/navigation';

	let currentStep = $state(1);
	let responses = $state({
		injuryType: '',
		timeframe: '',
		medicalTreatment: '',
		fault: '',
		injuries: [],
		phone: ''
	});

	const totalSteps = 6;

	const injuryTypes = [
		{ id: 'vehicle-accident', label: 'In a car, motorcycle, or truck accident' },
		{ id: 'slip-fall', label: "On someone else's property (slip, trip, fall, etc.)" },
		{ id: 'work-injury', label: 'At work or a job site' },
		{ id: 'medical-malpractice', label: 'During medical care or surgery' },
		{ id: 'product-liability', label: 'From a product or device that failed or was unsafe' },
		{ id: 'animal-attack', label: 'From an animal or dog bite' }
	];

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

	const injurySymptoms = [
		{ id: 'neck-back-pain', label: 'Neck or back pain' },
		{ id: 'soft-tissue', label: 'Sprain, strain, or soft tissue injury' },
		{ id: 'broken-bone', label: 'Broken bone or fracture' },
		{ id: 'head-injury', label: 'Head injury or concussion' },
		{ id: 'cuts-bruises', label: 'Cuts, bruises, or burns' },
		{ id: 'severe-injury', label: 'Severe or permanent injury' },
		{ id: 'fatal-injury', label: 'Fatal injury to a loved one' }
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
				window.history.pushState({ step: currentStep }, '', '');
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
				return responses.injuries.length > 0;
			case 6:
				return responses.phone !== '';
			default:
				return false;
		}
	}

	function handleSubmit() {
		console.log('Survey responses:', responses);
		goto('/thank-you');
	}

	function selectOption(field, value) {
		responses[field] = value;

		// Auto-progress to next question after brief delay (not for multi-select)
		setTimeout(() => {
			nextStep();
		}, 400);
	}

	function toggleInjury(injuryId) {
		if (responses.injuries.includes(injuryId)) {
			responses.injuries = responses.injuries.filter(id => id !== injuryId);
		} else {
			responses.injuries = [...responses.injuries, injuryId];
		}
	}

	function handleKeyDown(event) {
		if (event.key === 'Enter' && canProceed()) {
			event.preventDefault();
			nextStep();
		} else if (event.key === 'ArrowLeft' && currentStep > 1) {
			event.preventDefault();
			goBack();
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
		window.history.replaceState({ step: currentStep }, '', '');

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

		// Auto-focus phone input on step 6
		if (currentStep === 6) {
			setTimeout(() => {
				document.getElementById('phone')?.focus();
			}, 100);
		}
	});
</script>

<section class="survey">
	<!-- Header -->
	<header class="survey-header">
		<div class="header-content">
			<a href="/">
				<img src="/claimsboost-logo.png" alt="ClaimsBoost" class="logo" />
			</a>
			<a href="tel:8888660849" class="phone-button">
				<svg class="phone-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
				</svg>
				<span class="phone-number">(888) 866-0849</span>
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
								onclick={() => selectOption('injuryType', type.id)}
							>
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
					<h1 class="step-title">Did you get medical care for your injuries?</h1>

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

			<!-- Step 5: Injury Symptoms -->
			{#if currentStep === 5}
				<div class="step-content">
					<h1 class="step-title">What injuries or symptoms are you dealing with?</h1>
					<p class="step-subtitle">Select all that apply</p>

					<div class="options-list">
						{#each injurySymptoms as symptom}
							<button
								class="option-button multi-select-button {responses.injuries.includes(symptom.id) ? 'selected' : ''}"
								onclick={() => toggleInjury(symptom.id)}
							>
								<div class="checkbox {responses.injuries.includes(symptom.id) ? 'checked' : ''}">
									{#if responses.injuries.includes(symptom.id)}
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
											<polyline points="20 6 9 17 4 12"/>
										</svg>
									{/if}
								</div>
								<span class="option-label">{symptom.label}</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Step 6: Contact Information -->
			{#if currentStep === 6}
				<div class="step-content">
					<h1 class="step-title">You may qualify for compensation. A licensed attorney will review your case. What's the best way to reach you?</h1>

					<div class="form-fields">
						<div class="form-group">
							<label for="phone">📞 Phone number</label>
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
				</div>
			{/if}
		</div>
	</div>

	<!-- Next Button -->
	<div class="button-container">
		<button
			class="next-button"
			onclick={nextStep}
			disabled={!canProceed()}
		>
			Next
		</button>
	</div>

	<!-- Footer -->
	<footer class="survey-footer">
		<div class="footer-content">
			<p class="copyright">© 2013-2025 ClaimsBoost, Inc. All rights reserved.</p>
			<p class="disclaimer">ClaimsBoost connects injury victims with qualified personal injury attorneys.</p>
			<div class="footer-links">
				<a href="/privacy">Privacy Policy</a>
				<a href="/terms">Terms of Service</a>
				<a href="/privacy-choices">Your privacy choices</a>
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
		padding: 16px 20px;
		border-bottom: 1px solid #e5e5e5;
	}

	.header-content {
		max-width: 1000px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.survey-header a {
		display: inline-block;
	}

	.logo {
		max-height: 49px;
		width: auto;
		object-fit: contain;
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
	}

	.phone-button:hover {
		background: linear-gradient(135deg, #7BB8FF 0%, #3B82F6 100%);
		box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4), 0 3px 6px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
	}

	.phone-icon {
		transform: translateY(1px);
	}

	.phone-number {
		font-weight: 500;
		display: none;
	}

	@media (min-width: 640px) {
		.phone-number {
			display: inline;
		}
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
		margin-top: -24px;
		margin-bottom: 24px;
		font-weight: 400;
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

	.multi-select-button {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.checkbox {
		width: 20px;
		height: 20px;
		border: 2px solid #d1d5db;
		border-radius: 4px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		background: white;
	}

	.checkbox.checked {
		background: #2563EB;
		border-color: #2563EB;
	}

	.checkbox.checked svg {
		color: white;
	}

	.multi-select-button .option-label {
		text-align: left;
	}

	.form-fields {
		display: flex;
		flex-direction: column;
		gap: 24px;
		margin-bottom: 40px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-group label {
		font-size: 14px;
		font-weight: 600;
		color: #1a1a1a;
	}

	.form-input {
		padding: 14px 16px;
		border: 2px solid #d1d5db;
		border-radius: 8px;
		font-size: 16px;
		transition: border-color 0.2s;
		font-family: inherit;
		background: white;
	}

	.form-input:focus {
		outline: none;
		border-color: #2563EB;
	}

	.error-message {
		font-size: 13px;
		color: #dc2626;
		margin-top: -4px;
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
		background: linear-gradient(135deg, #FF7B00 0%, #D85A00 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		min-width: 180px;
		box-shadow: 0 4px 15px rgba(255, 123, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.next-button:hover:not(:disabled) {
		background: linear-gradient(135deg, #FF9500 0%, #E06500 100%);
		box-shadow: 0 6px 25px rgba(255, 123, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
	}

	.next-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
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
</style>
