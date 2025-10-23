<script>
	import { onMount } from 'svelte';
	import lottie from 'lottie-web';

	let lottieContainers = {};
	let lottieAnimations = {};

	const ranges = [
		{
			type: 'Car accidents',
			icon: '🚗',
			isLottie: true,
			lottiePath: '/wired-outline-868-car-crash-hover-pinch.json',
			min: 15000,
			max: 350000,
			count: 542
		},
		{
			type: 'Slip & fall',
			icon: '⚠️',
			isLottie: true,
			lottiePath: '/wired-outline-1140-error-hover-enlarge.json',
			min: 15000,
			max: 350000,
			count: 245
		},
		{
			type: 'Workplace injury',
			icon: '👷',
			isLottie: true,
			lottiePath: '/wired-outline-408-worker-helmet-hover-pinch.json',
			min: 15000,
			max: 350000,
			count: 89
		},
		{
			type: 'Medical malpractice',
			icon: '🏥',
			isLottie: true,
			lottiePath: '/wired-outline-671-male-doctor-care-hover-pinch.json',
			min: 15000,
			max: 350000,
			count: 67
		},
		{
			type: 'Dog bites',
			icon: '🐕',
			isLottie: true,
			lottiePath: '/wired-outline-1161-angry-dog-hover-pinch.json',
			min: 15000,
			max: 350000,
			count: 134
		},
		{
			type: 'Motorcycle accidents',
			icon: '🏍️',
			isLottie: true,
			lottiePath: '/wired-outline-843-bike-hover-pinch.json',
			min: 15000,
			max: 350000,
			count: 89
		}
	];

	function formatRange(min, max) {
		const formatNumber = (num) => {
			if (num >= 1000) {
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
		<h2>Settlement ranges in <span class="location-highlight">Raleigh, NC</span></h2>
		<p class="subtitle">Explore typical settlement amounts by injury type based on local case data.</p>

		<div class="ranges-grid">
			{#each ranges as range, i}
				<div
					class="range-card"
					onmouseenter={range.isLottie ? () => handleHover(i) : null}
					onmouseleave={range.isLottie ? () => handleLeave(i) : null}
				>
					{#if range.isLottie}
						<div class="range-icon lottie-icon" bind:this={lottieContainers[i]}></div>
					{:else}
						<div class="range-icon">{range.icon}</div>
					{/if}
					<h3>{range.type}</h3>
					<div class="range-amount">{formatRange(range.min, range.max)}</div>
					<div class="range-count">Based on {range.count} settlements</div>
					<div class="range-location">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
							<circle cx="12" cy="10" r="3"/>
						</svg>
						<span>{range.count} settlements in your area</span>
					</div>
				</div>
			{/each}
		</div>

		<div class="cta-section">
			<p>Can't find your injury type? Get a personalized estimate for any injury.</p>
			<button class="cta-button">
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
		padding: 32px 20px;
		background: white;
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
		border: 2px solid #e0e0e0;
		border-radius: 12px;
		padding: 20px;
		text-align: center;
		box-shadow: 0 2px 8px rgba(0,0,0,0.08);
		transition: transform 0.2s, box-shadow 0.2s;
		cursor: pointer;
	}

	.range-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0,0,0,0.12), 0 0 20px rgba(255, 255, 255, 0.8);
	}

	.range-icon {
		font-size: 32px;
		margin-bottom: 8px;
	}

	.lottie-icon {
		width: 60px;
		height: 60px;
		margin: 0 auto 8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.range-card h3 {
		font-size: 18px;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0 0 8px;
	}

	.range-amount {
		font-size: 24px;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 6px;
	}

	.range-count {
		font-size: 13px;
		color: #999;
		margin-bottom: 8px;
	}

	.range-location {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		font-size: 13px;
		color: #666;
	}

	.cta-section {
		text-align: center;
		padding: 32px 0;
		background: transparent;
	}

	.cta-section p {
		font-size: 18px;
		color: #666;
		margin-bottom: 20px;
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