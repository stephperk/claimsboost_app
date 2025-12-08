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

	// Map database keys to display labels
	const categoryDisplayLabels = {
		'vehicle_accidents': 'Vehicle Accidents',
		'malpractice': 'Malpractice',
		'defective_product': 'Defective Products',
		'workplace_injury': 'Workplace Injuries',
		'premises_liability': 'Premises Liability',
		'abuse_and_assault': 'Abuse & Assault',
		'insurance_bad_faith': 'Insurance Bad Faith',
		'mass_tort': 'Mass Torts',
		'disaster_claims': 'Disaster Claims',
		'wrongful_death': 'Wrongful Death'
	};

	// Practice area color mapping
	const practiceAreaColors = {
		'Vehicle Accidents': '#3B82F6',        // Blue
		'Defective Products': '#F59E0B',       // Orange
		'Malpractice': '#10B981',              // Green
		'Workplace Injuries': '#EF4444',       // Red
		'Premises Liability': '#8B5CF6',       // Purple
		'Abuse & Assault': '#DC2626',          // Red
		'Insurance Bad Faith': '#0891B2',      // Cyan
		'Mass Torts': '#7C3AED',               // Violet
		'Disaster Claims': '#EA580C',          // Orange-Red
		'Wrongful Death': '#6B7280',           // Gray
		'default': '#6B7280'
	};

	function getCategoryDisplayLabel(practiceArea) {
		// If it's already a display label, return it
		if (Object.values(categoryDisplayLabels).includes(practiceArea)) {
			return practiceArea;
		}
		// Otherwise map from database key
		return categoryDisplayLabels[practiceArea] || practiceArea;
	}

	function getPracticeAreaColor(practiceArea) {
		const displayLabel = getCategoryDisplayLabel(practiceArea);
		return practiceAreaColors[displayLabel] || practiceAreaColors['default'];
	}
</script>

{#if isProfilePage}
<div class="settlement-card-wrapper">
	<div class="settlement-card">
		<div class="settlement-header">
			<div class="practice-area-label" style="color: {getPracticeAreaColor(settlement.practiceArea)}">
				{getCategoryDisplayLabel(settlement.practiceArea).toUpperCase()}
			</div>
			<span class="amount">{formatAmount(settlement.amount)}</span>
		</div>

		<h3 class="settlement-title">{settlement.type}</h3>

	<div class="info-section">
		<div class="section-header">
			<img src="/stars-gradient-black.svg" alt="Summary" class="section-icon" />
			<span class="section-title">SUMMARY</span>
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
		<a href="{settlement.websiteUrl || '#'}" target="_blank" rel="noopener noreferrer" class="view-profile-button">
			Visit website
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M5 12h14M12 5l7 7-7 7"/>
			</svg>
		</a>
	</div>
	</div>
</div>
{:else}
<a href={settlement.firmUrl} class="settlement-card-wrapper">
	<div class="settlement-card">
		<div class="settlement-header">
			<div class="practice-area-label" style="color: {getPracticeAreaColor(settlement.practiceArea)}">
				{getCategoryDisplayLabel(settlement.practiceArea).toUpperCase()}
			</div>
			<span class="amount">{formatAmount(settlement.amount)}</span>
		</div>

		<h3 class="settlement-title">{settlement.type}</h3>

	<div class="info-section">
		<div class="section-header">
			<img src="/stars-gradient-black.svg" alt="Summary" class="section-icon" />
			<span class="section-title">SUMMARY</span>
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
		<span class="view-profile-button">
			View profile
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M5 12h14M12 5l7 7-7 7"/>
			</svg>
		</span>
	</div>
	</div>
</a>
{/if}

<style>
	.settlement-card-wrapper {
		position: relative;
		transition: transform 0.2s;
		text-decoration: none;
		color: inherit;
		display: block;
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
		font-size: 20px;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0 0 12px 0;
		line-height: 1.3;
		min-height: calc(1.3em * 2); /* Fixed height for 2 lines */
		display: flex;
		align-items: center; /* Vertically centers single-line text */
		overflow: hidden;
	}

	.amount {
		font-size: 26px;
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
		color: #666666;
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
		background: #f9fafb;
		padding: 10px 16px;
		margin: auto -20px -20px -20px;
		border-radius: 0 0 16px 16px;
		border-top: 1px solid #e5e7eb;
	}

	.footer-text {
		font-size: 13px;
		color: #666;
		font-weight: 400;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
		flex: 1;
		margin-right: 12px;
	}

	.view-profile-button {
		flex-shrink: 0;
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
		transition: transform 0.2s;
	}

	.settlement-footer:hover .view-profile-button svg,
	.settlement-card-wrapper:hover .view-profile-button svg {
		transform: translateX(4px);
	}
</style>
