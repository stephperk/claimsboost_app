<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { goto } from '$app/navigation';

	// Dummy data for practice area categories and subcategories
	const practiceAreasByCategory = [
		{
			categoryId: 'motor-vehicle',
			categoryName: 'Motor Vehicle Accidents',
			practiceAreas: [
				{ name: 'Auto Accidents', slug: 'auto-accidents' },
				{ name: 'Motorcycle Accidents', slug: 'motorcycle-accidents' },
				{ name: 'Truck Accidents', slug: 'truck-accidents' },
				{ name: 'Pedestrian Accidents', slug: 'pedestrian-accidents' },
				{ name: 'Bicycle Accidents', slug: 'bicycle-accidents' },
				{ name: 'Rideshare Accidents', slug: 'rideshare-accidents' },
				{ name: 'Bus Accidents', slug: 'bus-accidents' },
				{ name: 'Hit and Run', slug: 'hit-and-run' }
			]
		},
		{
			categoryId: 'workplace',
			categoryName: 'Workplace Injuries',
			practiceAreas: [
				{ name: 'Workers Compensation', slug: 'workers-compensation' },
				{ name: 'Construction Accidents', slug: 'construction-accidents' },
				{ name: 'Industrial Accidents', slug: 'industrial-accidents' },
				{ name: 'Occupational Diseases', slug: 'occupational-diseases' },
				{ name: 'Repetitive Stress Injuries', slug: 'repetitive-stress-injuries' }
			]
		},
		{
			categoryId: 'medical',
			categoryName: 'Medical Malpractice',
			practiceAreas: [
				{ name: 'Surgical Errors', slug: 'surgical-errors' },
				{ name: 'Misdiagnosis', slug: 'misdiagnosis' },
				{ name: 'Birth Injuries', slug: 'birth-injuries' },
				{ name: 'Medication Errors', slug: 'medication-errors' },
				{ name: 'Hospital Negligence', slug: 'hospital-negligence' },
				{ name: 'Nursing Home Abuse', slug: 'nursing-home-abuse' }
			]
		},
		{
			categoryId: 'premises',
			categoryName: 'Premises Liability',
			practiceAreas: [
				{ name: 'Slip and Fall', slug: 'slip-and-fall' },
				{ name: 'Dog Bites', slug: 'dog-bites' },
				{ name: 'Swimming Pool Accidents', slug: 'swimming-pool-accidents' },
				{ name: 'Inadequate Security', slug: 'inadequate-security' },
				{ name: 'Elevator Accidents', slug: 'elevator-accidents' }
			]
		},
		{
			categoryId: 'product',
			categoryName: 'Product Liability',
			practiceAreas: [
				{ name: 'Defective Products', slug: 'defective-products' },
				{ name: 'Dangerous Drugs', slug: 'dangerous-drugs' },
				{ name: 'Defective Medical Devices', slug: 'defective-medical-devices' },
				{ name: 'Auto Defects', slug: 'auto-defects' },
				{ name: 'Food Poisoning', slug: 'food-poisoning' }
			]
		},
		{
			categoryId: 'catastrophic',
			categoryName: 'Catastrophic Injuries',
			practiceAreas: [
				{ name: 'Wrongful Death', slug: 'wrongful-death' },
				{ name: 'Traumatic Brain Injury', slug: 'traumatic-brain-injury' },
				{ name: 'Spinal Cord Injury', slug: 'spinal-cord-injury' },
				{ name: 'Burn Injuries', slug: 'burn-injuries' },
				{ name: 'Amputation', slug: 'amputation' }
			]
		}
	];

	function navigateToPracticeArea(practiceArea) {
		goto(`/injury-law-firms?practice_area=${encodeURIComponent(practiceArea.name)}`);
	}
</script>

<svelte:head>
	<title>Find Injury Lawyers by Practice Area - ClaimsBoost</title>
	<meta
		name="description"
		content="Find personal injury lawyers by practice area. Browse attorneys specializing in auto accidents, medical malpractice, workplace injuries, and more."
	/>
</svelte:head>

<div class="page-wrapper">
	<Header />

	<main class="practice-areas-page">
		<div class="container">
			<div class="page-header">
				<h1>Find Injury Lawyers by Practice Area</h1>
				<p class="page-description">
					Browse personal injury attorneys by their area of expertise. Click on any practice area
					to find qualified lawyers who specialize in your type of case.
				</p>
			</div>

			<!-- Quick Category Navigation -->
			<div class="category-navigation">
				<h2 class="nav-header">Jump to Category:</h2>
				<div class="category-pills">
					{#each practiceAreasByCategory as category}
						<a href="#{category.categoryId}" class="category-pill">
							{category.categoryName}
						</a>
					{/each}
				</div>
			</div>

			<div class="categories-container">
				{#each practiceAreasByCategory as category}
					<section class="category-section" id={category.categoryId}>
						<h2 class="category-header">{category.categoryName}</h2>
						<div class="practice-areas-grid">
							{#each category.practiceAreas as practiceArea}
								<button
									type="button"
									class="practice-area-card"
									onclick={() => navigateToPracticeArea(practiceArea)}
								>
									<div class="practice-area-name">{practiceArea.name}</div>
								</button>
							{/each}
						</div>
					</section>
				{/each}
			</div>
		</div>
	</main>

	<Footer />
</div>

<style>
	/* Smooth scrolling for anchor links */
	:global(html) {
		scroll-behavior: smooth;
	}

	.page-wrapper {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.practice-areas-page {
		flex: 1;
		padding: 80px 20px 60px;
		background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	.page-header {
		text-align: center;
		margin-bottom: 48px;
	}

	.page-header h1 {
		font-size: 36px;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 16px;
	}

	.page-description {
		font-size: 18px;
		color: #666;
		line-height: 1.6;
		max-width: 700px;
		margin: 0 auto;
	}

	.category-navigation {
		background: white;
		border-radius: 16px;
		padding: 32px;
		margin-bottom: 48px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.nav-header {
		font-size: 20px;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 20px;
		text-align: center;
	}

	.category-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: center;
		align-items: center;
	}

	.category-pill {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 10px 16px;
		background: #f8f9fa;
		border: 2px solid transparent;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		color: #1a1a1a;
		text-decoration: none;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.category-pill:hover {
		background: white;
		border-color: #FF7B00;
		color: #FF7B00;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(255, 123, 0, 0.15);
	}

	.category-pill:active {
		transform: translateY(0);
	}

	.categories-container {
		display: flex;
		flex-direction: column;
		gap: 48px;
	}

	.category-section {
		background: white;
		border-radius: 16px;
		padding: 32px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		scroll-margin-top: 80px;
	}

	.category-header {
		font-size: 28px;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 24px;
		padding-bottom: 16px;
		border-bottom: 3px solid #FF7B00;
	}

	.practice-areas-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 12px;
	}

	.practice-area-card {
		background: #f8f9fa;
		border: 2px solid transparent;
		border-radius: 10px;
		padding: 16px;
		text-align: left;
		cursor: pointer;
		transition: all 0.3s ease;
		font-family: inherit;
		width: 100%;
	}

	.practice-area-card:hover {
		border-color: #FF7B00;
		background: white;
		box-shadow: 0 4px 12px rgba(255, 123, 0, 0.15);
		transform: translateY(-2px);
	}

	.practice-area-card:active {
		transform: translateY(0);
	}

	.practice-area-name {
		font-size: 16px;
		font-weight: 600;
		color: #1a1a1a;
	}

	/* Tablet */
	@media (max-width: 768px) {
		.practice-areas-page {
			padding: 60px 16px 40px;
		}

		.page-header h1 {
			font-size: 28px;
		}

		.page-description {
			font-size: 16px;
		}

		.category-navigation {
			padding: 24px;
			margin-bottom: 32px;
		}

		.nav-header {
			font-size: 18px;
			margin-bottom: 16px;
		}

		.category-pill {
			padding: 8px 14px;
			font-size: 13px;
		}

		.categories-container {
			gap: 32px;
		}

		.category-section {
			padding: 24px;
		}

		.category-header {
			font-size: 24px;
			margin-bottom: 20px;
			padding-bottom: 12px;
		}

		.practice-areas-grid {
			grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
			gap: 10px;
		}

		.practice-area-card {
			padding: 14px;
		}

		.practice-area-name {
			font-size: 15px;
		}
	}

	/* Mobile */
	@media (max-width: 480px) {
		.practice-areas-page {
			padding: 40px 12px 32px;
		}

		.page-header {
			margin-bottom: 32px;
		}

		.page-header h1 {
			font-size: 24px;
		}

		.page-description {
			font-size: 15px;
		}

		.category-navigation {
			padding: 20px;
			margin-bottom: 24px;
		}

		.nav-header {
			font-size: 16px;
			margin-bottom: 14px;
		}

		.category-pills {
			gap: 8px;
		}

		.category-pill {
			padding: 8px 12px;
			font-size: 12px;
		}

		.categories-container {
			gap: 24px;
		}

		.category-section {
			padding: 20px;
			border-radius: 12px;
		}

		.category-header {
			font-size: 20px;
			margin-bottom: 16px;
			padding-bottom: 10px;
		}

		.practice-areas-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 8px;
		}

		.practice-area-card {
			padding: 12px;
		}

		.practice-area-name {
			font-size: 14px;
		}
	}
</style>
