<script>
	export let settlement;
	export let matchingCriteria = [];

	function formatAmount(amount) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}
</script>

<div class="settlement-card">
	<div class="settlement-header">
		<h3>{settlement.type}</h3>
		<span class="amount">{formatAmount(settlement.amount)}</span>
	</div>

	<div class="info-section">
		<div class="section-header">
			<img src="/stars-gradient-black.svg" alt="AI" class="section-icon" />
			<span class="section-title">AI OVERVIEW</span>
		</div>
		<p class="section-content">{settlement.description}</p>
	</div>

	{#if matchingCriteria.length > 0}
		<div class="badges">
			{#each matchingCriteria as criterion}
				<span class="badge">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
						<polyline points="22 4 12 14.01 9 11.01"/>
					</svg>
					{criterion}
				</span>
			{/each}
		</div>
	{/if}
</div>

<style>
	.settlement-card {
		background: white;
		border: none;
		border-radius: 16px;
		padding: 20px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
		transition: transform 0.2s, box-shadow 0.2s;
		cursor: pointer;
	}

	.settlement-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0,0,0,0.22);
	}

	.badges {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 12px;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: #16A34A;
		font-size: 13px;
		font-weight: 500;
	}

	.badge svg {
		flex-shrink: 0;
		stroke: #16A34A;
	}

	.settlement-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.settlement-header h3 {
		font-size: 18px;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0;
		line-height: 1.2;
	}

	.amount {
		font-size: 24px;
		font-weight: 700;
		background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		line-height: 1.2;
	}

	.info-section {
		margin-bottom: 20px;
		padding-top: 0;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 12px;
	}

	.section-icon {
		width: 20px;
		height: 20px;
		flex-shrink: 0;
		object-fit: contain;
	}

	.section-title {
		font-size: 12px;
		font-weight: 600;
		color: #999;
		text-transform: uppercase;
	}

	.section-content {
		color: #1a1a1a;
		font-size: 14px;
		font-weight: 500;
		line-height: 1.5;
		margin: 0;
		padding-left: 28px;
	}
</style>
