import { supabaseServer } from '$lib/supabaseServer';

/**
 * Server-side load function for practice areas page.
 * Fetches unique category/subcategory combinations from taxonomy_practice_areas.
 */
export async function load() {
	try {
		const { data, error } = await supabaseServer
			.from('taxonomy_practice_areas')
			.select('primary_category, sub_category')
			.order('primary_category')
			.order('sub_category');

		if (error) {
			console.error('Error fetching practice areas:', error);
			return {
				practiceAreasByCategory: []
			};
		}

		// Format names for display (e.g., "vehicle_accidents" -> "Vehicle Accidents")
		function formatName(name) {
			return name
				.split('_')
				.map(word => word.charAt(0).toUpperCase() + word.slice(1))
				.join(' ');
		}

		// Create URL-friendly slug
		function getSlug(name) {
			return name.replace(/_/g, '-');
		}

		// Group subcategories by primary_category (using Set to deduplicate)
		const categoriesMap = {};

		if (data) {
			data.forEach(item => {
				if (!categoriesMap[item.primary_category]) {
					categoriesMap[item.primary_category] = {
						categorySlug: getSlug(item.primary_category),
						categoryName: formatName(item.primary_category),
						subCategories: new Set()
					};
				}

				categoriesMap[item.primary_category].subCategories.add(item.sub_category);
			});
		}

		// Convert Sets to arrays of objects and sort
		const categoriesArray = Object.values(categoriesMap)
			.map(category => {
				// Filter out "general" and sort remaining subcategories
				const filteredSubs = Array.from(category.subCategories)
					.filter(sub => sub !== 'general')
					.sort()
					.map(sub => ({
						slug: getSlug(sub),
						name: formatName(sub)
					}));

				// Add category name as the first subcategory
				const subCategories = [
					{
						slug: category.categorySlug,
						name: category.categoryName
					},
					...filteredSubs
				];

				return {
					categorySlug: category.categorySlug,
					categoryName: category.categoryName,
					subCategories
				};
			})
			.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

		return {
			practiceAreasByCategory: categoriesArray
		};
	} catch (err) {
		console.error('Error in load function:', err);
		return {
			practiceAreasByCategory: []
		};
	}
}
