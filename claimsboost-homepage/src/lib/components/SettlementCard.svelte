<script>
	export let settlement;
	export let matchingCriteria = [];
	export let isProfilePage = false;

	function formatAmount(amount) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

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
</script>

<div class="settlement-card-wrapper">
	<div class="settlement-card">
		<div class="settlement-header">
			<div class="practice-area-label" style="color: {getPracticeAreaColor(settlement.practiceArea)}">
				{settlement.practiceArea.toUpperCase()}
			</div>
			<span class="amount">{formatAmount(settlement.amount)}</span>
		</div>

		<h3 class="settlement-title">{settlement.type}</h3>

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

	<div class="settlement-footer">
		<span class="footer-text">via {settlement.lawFirm}</span>
		{#if isProfilePage}
			<a href="{settlement.websiteUrl || '#'}" target="_blank" rel="noopener noreferrer" class="view-profile-button">
				Visit website
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M5 12h14M12 5l7 7-7 7"/>
				</svg>
			</a>
		{:else}
			<a href={settlement.firmUrl} class="view-profile-button">
				View profile
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M5 12h14M12 5l7 7-7 7"/>
				</svg>
			</a>
		{/if}
	</div>
	</div>
</div>

<style>
	.settlement-card-wrapper {
		position: relative;
		transition: transform 0.2s;
	}

	.settlement-card-wrapper:hover {
		transform: translateY(-2px);
	}

	.settlement-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 16px;
		padding: 20px;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
		transition: box-shadow 0.2s;
		cursor: pointer;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.settlement-card-wrapper:hover .settlement-card {
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
	}

	.practice-area-label {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 1px;
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
		margin-bottom: 12px;
		gap: 16px;
	}

	.settlement-title {
		font-size: 18px;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0 0 20px 0;
		line-height: 1.3;
	}

	.amount {
		font-size: 28px;
		font-weight: 700;
		background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		line-height: 1;
		flex-shrink: 0;
	}

	.info-section {
		margin-bottom: 28px;
		flex: 1;
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
	}

	.settlement-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: auto;
		padding-top: 12px;
		border-top: 1px solid #e5e7eb;
		background: #f9fafb;
		padding: 12px 16px;
		margin: auto -20px -20px -20px;
		border-radius: 0 0 16px 16px;
	}

	.footer-text {
		font-size: 13px;
		color: #6b7280;
		font-weight: 400;
	}

	.view-profile-button {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		color: #1a1a1a;
		text-decoration: none;
		font-weight: 600;
		font-size: 15px;
		transition: color 0.2s;
	}

	.settlement-footer:hover .view-profile-button,
	.settlement-card-wrapper:hover .view-profile-button {
		color: #FF6800;
	}

	.view-profile-button svg {
		width: 16px;
		height: 16px;
	}
</style>
