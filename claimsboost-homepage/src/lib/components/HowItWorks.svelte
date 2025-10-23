<section class="how-it-works">
	<div class="container">
		<div class="steps">
			<div class="step-card">
				<div class="step-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
						<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
					</svg>
				</div>
				<div class="step-content">
					<h3>Tell us about your injury</h3>
					<p>Share details about what happened</p>
				</div>
			</div>
			<div class="step-card">
				<div class="step-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
						<circle cx="9" cy="7" r="4"/>
						<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
						<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
					</svg>
				</div>
				<div class="step-content">
					<h3>Connect with top law firms</h3>
					<p>Get matched with experienced attorneys</p>
				</div>
			</div>
			<div class="step-card">
				<div class="step-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
						<polyline points="22 4 12 14.01 9 11.01"/>
					</svg>
				</div>
				<div class="step-content">
					<h3>Get the compensation you deserve</h3>
					<p>Receive your settlement</p>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.how-it-works {
		background: #f8f9fa;
		padding: 40px 20px;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	.steps {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
	}

	.step-card {
		background: white;
		border-radius: 16px;
		padding: 24px;
		display: flex;
		align-items: flex-start;
		gap: 16px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.step-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	}

	.step-icon {
		background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		color: white;
		width: 60px;
		height: 60px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.step-icon svg {
		width: 24px !important;
		height: 24px !important;
		transform: scale(0.6);
	}

	.step-content {
		flex: 1;
	}

	.step-content h3 {
		font-size: 18px;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0 0 4px 0;
	}

	.step-content p {
		font-size: 14px;
		color: #666;
		margin: 0;
	}

	@media (min-width: 768px) {
		.steps {
			grid-template-columns: repeat(3, 1fr);
			gap: 20px;
		}

		.step-card {
			flex-direction: column;
			text-align: center;
			align-items: center;
		}
	}
</style>
