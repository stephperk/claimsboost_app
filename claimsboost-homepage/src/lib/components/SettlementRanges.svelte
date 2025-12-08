<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import lottie from 'lottie-web';
	import { location } from '$lib/stores/locationStore.js';

	let lottieContainers = {};
	let lottieAnimations = {};

	const ranges = [
		{
			type: 'Car accidents',
			practiceArea: 'Vehicle Accidents',
			icon: '🚗',
			isLottie: true,
			lottiePath: '/wired-outline-868-car-crash-hover-pinch.json',
			min: 25000,
			max: 500000,
			count: 542
		},
		{
			type: 'Slip & fall',
			practiceArea: 'Premises Liability',
			icon: '⚠️',
			isLottie: true,
			lottiePath: '/wired-outline-1140-error-hover-enlarge.json',
			min: 20000,
			max: 300000,
			count: 245
		},
		{
			type: 'Workplace injury',
			practiceArea: 'Workplace Injuries',
			icon: '👷',
			isLottie: true,
			lottiePath: '/wired-outline-408-worker-helmet-hover-pinch.json',
			min: 30000,
			max: 600000,
			count: 89
		},
		{
			type: 'Medical malpractice',
			practiceArea: 'Malpractice',
			icon: '🏥',
			isLottie: true,
			lottiePath: '/wired-outline-671-male-doctor-care-hover-pinch.json',
			min: 100000,
			max: 2000000,
			count: 67
		},
		{
			type: 'Dog bites',
			practiceArea: 'Premises Liability',
			icon: '🐕',
			isLottie: true,
			lottiePath: '/wired-outline-1161-angry-dog-hover-pinch.json',
			min: 15000,
			max: 200000,
			count: 134
		},
		{
			type: 'Motorcycle accidents',
			practiceArea: 'Vehicle Accidents',
			icon: '🏍️',
			isLottie: true,
			lottiePath: '/wired-outline-843-bike-hover-pinch.json',
			min: 50000,
			max: 750000,
			count: 89
		}
	];

	// Practice area color mapping
	const practiceAreaColors = {
		'Vehicle Accidents': '#3B82F6',        // Blue
		'Defective Products': '#F59E0B',       // Orange
		'Malpractice': '#10B981',              // Green
		'Workplace Injuries': '#EF4444',       // Red
		'Premises Liability': '#8B5CF6',       // Purple
		'Wrongful Death': '#6B7280',           // Gray
		'default': '#6B7280'
	};

	function getPracticeAreaColor(practiceArea) {
		return practiceAreaColors[practiceArea] || practiceAreaColors['default'];
	}

	function formatRange(min, max) {
		const formatNumber = (num) => {
			if (num >= 1000000) {
				return `$${num / 1000000}M`;
			} else if (num >= 1000) {
				return `$${num / 1000}K`;
			}
			return `$${num}`;
		};
		return `${formatNumber(min)} - ${formatNumber(max)}`;
	}

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
		for (let i = 0; i < ranges.length; i++) {
			const range = ranges[i];
			if (range.isLottie && lottieContainers[i]) {
				const response = await fetch(range.lottiePath);
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

<section class="settlement-ranges">
	<div class="container">
		<h2>
			{#if $location.hasLocation}
				Popular categories near <span class="location-highlight">{$location.city}, {$location.state}</span>
			{:else}
				Popular categories
			{/if}
		</h2>
		<p class="subtitle">Explore typical settlement amounts by injury type based on local case data.</p>

		<div class="ranges-grid">
			{#each ranges as range, i}
				<div
					class="range-card"
					role="article"
					onmouseenter={range.isLottie ? () => handleHover(i) : null}
					onmouseleave={range.isLottie ? () => handleLeave(i) : null}
				>
					{#if range.isLottie}
						<div class="range-icon lottie-icon" bind:this={lottieContainers[i]}></div>
					{:else}
						<div class="range-icon">{range.icon}</div>
					{/if}
					<div class="range-content">
						<div class="practice-area-label" style="color: {getPracticeAreaColor(range.practiceArea)}">
							{range.practiceArea.toUpperCase()}
						</div>
						<h3>{range.type}</h3>
						<div class="range-amount">{formatRange(range.min, range.max)}</div>
						<div class="range-count">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="3" y="13" width="4" height="8"/>
								<rect x="10" y="9" width="4" height="12"/>
								<rect x="17" y="5" width="4" height="16"/>
							</svg>
							Based on {range.count} settlements
						</div>
					</div>
				</div>
			{/each}
		</div>

		<div class="cta-section">
			<p>Can't find your injury type? Get a personalized estimate for any injury.</p>
			<button class="cta-button" onclick={() => goto('/get-started')}>
				Get my free estimate
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M5 12h14M12 5l7 7-7 7"/>
				</svg>
			</button>
		</div>
	</div>
</section>

<style>
	.settlement-ranges {
		padding: 60px 20px;
		background: #ffffff;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	h2 {
		font-size: 30px;
		font-weight: 700;
		margin-bottom: 12px;
		text-align: left;
		color: #1a1a1a;
	}

	.subtitle {
		text-align: left;
		color: #666;
		font-size: 16px;
		margin-bottom: 40px;
	}

	.location-highlight {
		background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.ranges-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
		margin-bottom: 32px;
	}

	.range-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
		transition: transform 0.2s, box-shadow 0.2s;
		cursor: pointer;
		display: flex;
		gap: 20px;
		align-items: flex-start;
	}

	.range-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
	}

	.range-icon {
		font-size: 32px;
		flex-shrink: 0;
	}

	.lottie-icon {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.range-content {
		flex: 1;
	}

	.practice-area-label {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 1px;
		margin-bottom: 8px;
	}

	.range-card h3 {
		font-size: 20px;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0 0 8px;
	}

	.range-amount {
		font-size: 28px;
		font-weight: 700;
		background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 12px;
	}

	.range-count {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 14px;
		color: #999;
		font-weight: 400;
	}

	.range-count svg {
		flex-shrink: 0;
		stroke: #999;
	}

	.cta-section {
		text-align: center;
		padding: 32px 0;
		background: transparent;
	}

	.cta-section p {
		font-size: 18px;
		color: #1a1a1a;
		margin-bottom: 20px;
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
		line-height: 1.5;
		font-family: inherit;
	}

	.cta-button:hover {
		background: linear-gradient(135deg, #FF8000 0%, #FFB733 100%);
		box-shadow: 0 6px 25px rgba(255, 104, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15);
	}

	.cta-button svg {
		transition: transform 0.2s;
	}

	.cta-button:hover svg {
		transform: translateX(4px);
	}

	@media (min-width: 640px) {
		.ranges-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 768px) {
		h2 {
			font-size: 30px;
			text-align: left;
		}

		.ranges-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.settlement-ranges {
			padding: 80px 20px;
		}

		h2 {
			font-size: 30px;
			text-align: left;
		}

		.ranges-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 24px;
		}
	}
</style>