<script>
	let openItems = $state({});

	const faqs = [
		{
			id: 1,
			question: 'How much does it cost to get an estimate?',
			answer: 'Absolutely nothing! Our case estimate tool is completely free to use and comes with no obligations. We believe everyone deserves to know their rights and potential compensation.'
		},
		{
			id: 2,
			question: 'How accurate are the settlement estimates?',
			answer: 'Our estimates are based on thousands of real settlement cases with similar circumstances to yours. While every case is unique, our AI analyzes factors like injury type, severity, location, and liability to provide a realistic range based on actual historical outcomes.'
		},
		{
			id: 3,
			question: 'How long does the process take?',
			answer: 'You can get an initial estimate in just 2 minutes. If you choose to connect with a lawyer, most offer same-day consultations. The full legal process varies by case complexity.'
		},
		{
			id: 4,
			question: 'What type of law firms are on claimsboost.com?',
			answer: 'We feature top-rated personal injury law firms that specialize in cases like yours. All firms are vetted for their track record, client reviews, and professional standing. From boutique practices to established firms, each one has proven experience winning settlements for their clients.'
		}
	];

	// SEO: FAQPage structured data for rich snippets
	const faqSchema = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		"mainEntity": faqs.map(faq => ({
			"@type": "Question",
			"name": faq.question,
			"acceptedAnswer": {
				"@type": "Answer",
				"text": faq.answer
			}
		}))
	};

	function toggleItem(id) {
		openItems[id] = !openItems[id];
	}
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`}
</svelte:head>

<section class="faq">
	<div class="container">
		<h2>Frequently Asked Questions</h2>
		<p class="subtitle">Have questions? We have answers. Find more information below.</p>

		<div class="faq-list">
			{#each faqs as faq}
				<div class="faq-item" class:active={openItems[faq.id]}>
					<button
						class="faq-question"
						onclick={() => toggleItem(faq.id)}
						aria-expanded={openItems[faq.id] || false}
					>
						<span>{faq.question}</span>
						<svg
							class="faq-icon"
							class:rotated={openItems[faq.id]}
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M6 9l6 6 6-6"/>
						</svg>
					</button>
					{#if openItems[faq.id]}
						<div class="faq-answer">
							<p>{faq.answer}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.faq {
		padding: 60px 20px;
		background: #f9f9f9;
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
	}

	h2 {
		font-size: 32px;
		font-weight: 700;
		margin-bottom: 12px;
		text-align: center;
		color: #1a1a1a;
	}

	.subtitle {
		text-align: center;
		color: #666;
		font-size: 16px;
		margin-bottom: 40px;
	}

	.faq-list {
		border-top: 1px solid #e5e5e5;
	}

	.faq-item {
		border-bottom: 1px solid #e5e5e5;
		transition: background 0.2s;
	}

	.faq-item.active {
		background: #f8f9fa;
	}

	.faq-question {
		width: 100%;
		padding: 20px;
		background: none;
		border: none;
		text-align: left;
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 16px;
		font-weight: 500;
		color: #1a1a1a;
		transition: color 0.2s;
	}

	.faq-question:hover {
		color: #FF7B00;
	}

	.faq-icon {
		flex-shrink: 0;
		transition: transform 0.3s ease;
		color: #666;
	}

	.faq-icon.rotated {
		transform: rotate(180deg);
	}

	.faq-answer {
		padding: 0 20px 20px;
		animation: slideDown 0.3s ease;
	}

	.faq-answer p {
		color: #666;
		line-height: 1.6;
		margin: 0;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (min-width: 768px) {
		h2 {
			font-size: 36px;
		}

		.faq-question {
			font-size: 18px;
			padding: 24px;
		}

		.faq-answer {
			padding: 0 24px 24px;
		}
	}

	@media (min-width: 1024px) {
		.faq {
			padding: 80px 20px;
		}

		h2 {
			font-size: 40px;
		}
	}
</style>