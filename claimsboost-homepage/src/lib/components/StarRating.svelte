<script>
	/**
	 * StarRating component that displays a proportional star rating
	 * @prop {number} rating - The rating value (0-5, can be decimal)
	 * @prop {number} maxStars - Maximum number of stars (default: 5)
	 * @prop {number} size - Size of the stars in pixels (default: 20)
	 * @prop {string} color - Color of filled stars (default: #FFA500)
	 * @prop {string} emptyColor - Color of empty stars (default: #d0d0d0)
	 * @prop {boolean} showValue - Whether to show the numeric value (default: false)
	 * @prop {string} className - Additional CSS classes
	 */
	export let rating = 0;
	export let maxStars = 5;
	export let size = 20;
	export let color = '#FFA500';
	export let emptyColor = '#d0d0d0';
	export let showValue = false;
	export let className = '';

	// Ensure rating is within bounds
	$: boundedRating = Math.max(0, Math.min(rating, maxStars));

	// Calculate star fill percentages
	$: stars = Array.from({ length: maxStars }, (_, i) => {
		const starNumber = i + 1;
		if (boundedRating >= starNumber) {
			// Full star
			return 100;
		} else if (boundedRating > starNumber - 1) {
			// Partial star - calculate exact percentage
			return (boundedRating - (starNumber - 1)) * 100;
		} else {
			// Empty star
			return 0;
		}
	});

	// Create unique ID for gradient definitions (to avoid conflicts)
	const gradientId = `star-gradient-${Math.random().toString(36).substr(2, 9)}`;
</script>

<div
	class="star-rating {className}"
	role="img"
	aria-label="{boundedRating} out of {maxStars} stars"
>
	<div class="stars-container">
		{#each stars as fillPercent, index}
			<svg
				width={size}
				height={size}
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				class="star"
			>
				<defs>
					<linearGradient id="{gradientId}-{index}">
						<stop offset="0%" stop-color={color} />
						<stop offset="{fillPercent}%" stop-color={color} />
						<stop offset="{fillPercent}%" stop-color={emptyColor} />
						<stop offset="100%" stop-color={emptyColor} />
					</linearGradient>
				</defs>
				<!-- Star path (from Font Awesome star shape) -->
				<path
					d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
					fill="url(#{gradientId}-{index})"
				/>
			</svg>
		{/each}
	</div>
	{#if showValue}
		<span class="rating-value">{boundedRating.toFixed(1)}</span>
	{/if}
</div>

<style>
	.star-rating {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		line-height: 1;
	}

	.stars-container {
		display: inline-flex;
		gap: 0;
	}

	.star {
		display: block;
	}

	.star:not(:first-child) {
		margin-left: -2px;
	}

	.rating-value {
		font-size: 14px;
		color: #FFA500;
		margin-left: 4px;
		font-weight: 500;
		line-height: 1;
	}
</style>