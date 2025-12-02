<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { goto } from '$app/navigation';
	import { searchLocation } from '$lib/stores/searchLocationStore.js';
	import { location } from '$lib/stores/locationStore.js';

	// Receive data from server load function
	let { data } = $props();

	function navigateToSubCategory(categoryName, subCategoryName) {
		const params = new URLSearchParams();
		params.set('practice_area', `${categoryName} - ${subCategoryName}`);

		// Include user's location if available
		if ($searchLocation.hasLocation) {
			params.set('location', `${$searchLocation.city}, ${$searchLocation.state}`);
		} else if ($location.hasLocation) {
			searchLocation.setSearchLocation({
				city: $location.city,
				state: $location.state,
				latitude: $location.latitude,
				longitude: $location.longitude,
				zipCode: null,
				formatted: `${$location.city}, ${$location.state}`
			});
			params.set('location', `${$location.city}, ${$location.state}`);
		}

		goto(`/injury-law-firms?${params.toString()}`);
	}
</script>

<svelte:head>
	<title>Find Injury Law Firms by Practice Area - ClaimsBoost</title>
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
				<h1>Find Injury Law Firms by Practice Area</h1>
				<p class="page-description">
					Browse personal injury attorneys by their area of expertise. Click on
					any practice area to find qualified law firms near you.
				</p>
			</div>

			{#if data.practiceAreasByCategory && data.practiceAreasByCategory.length > 0}
				<!-- Quick Category Navigation -->
				<div class="category-navigation">
					<h2 class="nav-header">Jump to Category:</h2>
					<div class="category-pills">
						{#each data.practiceAreasByCategory as category}
							<a href="#{category.categorySlug}" class="category-pill">
								{category.categoryName}
							</a>
						{/each}
					</div>
				</div>

				<div class="categories-container">
					{#each data.practiceAreasByCategory as category}
						<section class="category-section" id={category.categorySlug}>
							<h2 class="category-header">{category.categoryName}</h2>
							<div class="subcategories-grid">
								{#each category.subCategories as subCategory}
									<button
										type="button"
										class="subcategory-card"
										onclick={() => navigateToSubCategory(category.categoryName, subCategory.name)}
									>
										<div class="subcategory-name">{subCategory.name}</div>
									</button>
								{/each}
							</div>
						</section>
					{/each}
				</div>
			{:else}
				<div class="loading-message">
					<p>Loading practice areas...</p>
				</div>
			{/if}
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
		scroll-margin-top: 100px;
	}

	.category-header {
		font-size: 28px;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 24px;
		padding-bottom: 16px;
		border-bottom: 3px solid #FF7B00;
	}

	.subcategories-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 12px;
	}

	.subcategory-card {
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

	.subcategory-card:hover {
		border-color: #FF7B00;
		background: white;
		box-shadow: 0 4px 12px rgba(255, 123, 0, 0.15);
		transform: translateY(-2px);
	}

	.subcategory-card:active {
		transform: translateY(0);
	}

	.subcategory-name {
		font-size: 16px;
		font-weight: 600;
		color: #1a1a1a;
	}

	.loading-message {
		text-align: center;
		padding: 60px 20px;
		font-size: 18px;
		color: #666;
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

		.subcategories-grid {
			grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
			gap: 10px;
		}

		.subcategory-card {
			padding: 14px;
		}

		.subcategory-name {
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

		.subcategories-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 8px;
		}

		.subcategory-card {
			padding: 12px;
		}

		.subcategory-name {
			font-size: 14px;
		}
	}
</style>
