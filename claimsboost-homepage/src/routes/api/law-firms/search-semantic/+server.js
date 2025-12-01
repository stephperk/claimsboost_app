import { json } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabaseServer';
import { embeddingClient } from '$lib/embeddingClient';

/**
 * GET /api/law-firms/search-semantic
 *
 * Enhanced search endpoint with semantic similarity support.
 * Combines distance, quality, and semantic relevance for optimal results.
 *
 * Query Parameters:
 * - lat (required): User's latitude
 * - lng (required): User's longitude
 * - radius (optional): Search radius in miles (default: 50)
 * - practice_area_query (optional): User's text query for semantic search (e.g., "car accident", "dog bite")
 * - practice_areas (optional): Comma-separated list of practice areas (passed to DB function)
 * - min_rating (optional): Minimum rating filter (applied client-side)
 * - sort_by (optional): 'relevance' | 'rating' | 'distance' (default: 'relevance')
 * - limit (optional): Maximum results to return (default: 50)
 *
 * Response:
 * - firms: Array of law firm objects with semantic scores
 * - total_count: Total number of matching firms
 * - radius_used: The radius that was used
 * - location: The search coordinates
 * - filters_applied: Summary of applied filters
 * - semantic_search_enabled: Whether semantic search was used
 */
export async function GET({ url }) {
	const lat = parseFloat(url.searchParams.get('lat'));
	const lng = parseFloat(url.searchParams.get('lng'));
	const radius = parseInt(url.searchParams.get('radius') || '50');
	const sortBy = url.searchParams.get('sort_by') || 'relevance';
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const minRating = parseFloat(url.searchParams.get('min_rating') || '0');
	const practiceAreaQuery = url.searchParams.get('practice_area_query') || '';
	const practiceAreasParam = url.searchParams.get('practice_areas');
	const practiceAreas = practiceAreasParam ? practiceAreasParam.split(',').map(s => s.trim()) : [];

	// Feature flag for semantic search
	const SEMANTIC_SEARCH_ENABLED = true; // Can be controlled via env variable

	// Validate required coordinates
	if (isNaN(lat) || isNaN(lng)) {
		return json({ error: 'Invalid coordinates' }, { status: 400 });
	}

	try {
		// Step 1: Get nearby firms using existing PostGIS query
		const practiceAreaFilter = practiceAreas.length > 0 ? practiceAreas.join(',') : null;

		const { data: nearbyFirms, error: searchError } = await supabaseServer.rpc('search_law_firms_nearby_fast', {
			user_lat: lat,
			user_lng: lng,
			radius_miles: radius,
			practice_area_filter: practiceAreaFilter,
			limit_results: 200 // Get extra results for filtering
		});

		if (searchError) {
			console.error('Supabase RPC error:', searchError);
			throw searchError;
		}

		let results = nearbyFirms || [];

		// Step 2: If we have a practice area query, enhance with semantic search
		let semanticScores = {};
		let semanticSearchUsed = false;

		if (SEMANTIC_SEARCH_ENABLED && practiceAreaQuery && practiceAreaQuery.trim()) {
			try {
				console.log(`🔍 Performing semantic search for: "${practiceAreaQuery}"`);

				// Get embedding for the query
				const embeddingResponse = await embeddingClient.embed(practiceAreaQuery);

				if (embeddingResponse && embeddingResponse.embedding) {
					// Get firm IDs from nearby results
					const firmIds = results.map(f => f.place_id).filter(id => id);

					if (firmIds.length > 0) {
						console.log(`📊 Calling similarity function with ${firmIds.length} firm IDs`);
						console.log(`📊 First 3 firm IDs: ${firmIds.slice(0, 3).join(', ')}`);
						console.log(`📊 Embedding dimensions: ${embeddingResponse.embedding.length}`);

						// Call Supabase function - pass embedding as array (no JSON.stringify!)
						const { data: allSimilarities, error: simError } = await supabaseServer.rpc('get_firm_all_practice_area_similarities', {
							query_embedding: embeddingResponse.embedding,
							firm_ids: firmIds,
							embedding_model_name: 'BAAI/bge-small-en-v1.5'
						});

						console.log(`📊 RPC returned ${allSimilarities?.length || 0} results, error: ${JSON.stringify(simError)}`);

						if (!simError && allSimilarities) {
							// Build nested map: firmId -> { practiceArea -> similarity }
							const bestMatches = {};

							allSimilarities.forEach(sim => {
								// Track all scores per firm
								if (!semanticScores[sim.law_firm_id]) {
									semanticScores[sim.law_firm_id] = {};
								}
								semanticScores[sim.law_firm_id][sim.practice_area] = sim.similarity;

								// Also track best match for hybrid scoring
								if (!bestMatches[sim.law_firm_id] || sim.similarity > bestMatches[sim.law_firm_id].similarity) {
									bestMatches[sim.law_firm_id] = {
										similarity: sim.similarity,
										best_match: sim.practice_area
									};
								}
							});

							// Store best matches for backwards compatibility with scoring logic
							Object.keys(bestMatches).forEach(firmId => {
								semanticScores[firmId]._best = bestMatches[firmId];
							});

							semanticSearchUsed = true;
							console.log(`✅ Found semantic matches for ${Object.keys(semanticScores).length} firms`);
						} else {
							console.error('Similarity search error:', simError);
						}
					}
				}
			} catch (semanticError) {
				console.error('Semantic search failed, using basic search:', semanticError);
				// Continue without semantic scores - graceful fallback
			}
		}

		// Step 3: Apply rating filter (client-side)
		if (minRating > 0) {
			results = results.filter(firm => (firm.rating || 0) >= minRating);
		}

		// Step 4: Calculate hybrid scores and enhance results
		results = results.map(firm => {
			const firmId = firm.place_id;
			const distanceScore = 1 - Math.min(firm.distance_miles / radius, 1); // Normalize to 0-1
			const qualityScore = (firm.quality_score || 0) / 3; // Normalize to 0-1 (quality is 0-3)
			const ratingScore = (firm.rating || 0) / 5; // Normalize to 0-1

			// Extract best match and all scores
			const firmScores = semanticScores[firmId];
			const bestMatch = firmScores?._best;
			const semanticScore = bestMatch?.similarity || 0;

			// Get practice area scores (excluding the _best metadata)
			let practiceAreaScores = {};
			if (firmScores) {
				practiceAreaScores = Object.keys(firmScores)
					.filter(key => key !== '_best')
					.reduce((acc, key) => {
						acc[key] = firmScores[key];
						return acc;
					}, {});
			}

			// Hybrid scoring weights
			let finalScore;
			if (semanticSearchUsed && semanticScore > 0) {
				// When semantic search is active, give it more weight
				finalScore = (
					0.50 * semanticScore +      // 50% semantic relevance
					0.25 * distanceScore +       // 25% distance
					0.25 * qualityScore          // 25% quality
				);
			} else {
				// Firms without embeddings get low score (show at bottom)
				if (semanticSearchUsed && !firmScores) {
					finalScore = (
						0.10 +                       // Base score of 0.1 for firms without embeddings
						0.25 * distanceScore +       // 25% distance
						0.25 * qualityScore          // 25% quality
					);
				} else {
					// Fall back to distance and quality based scoring
					finalScore = (
						0.50 * distanceScore +       // 50% distance
						0.50 * qualityScore          // 50% quality
					);
				}
			}

			return {
				...firm,
				semantic_score: semanticScore,
				best_matching_practice_area: bestMatch?.best_match,
				practice_area_scores: practiceAreaScores,  // NEW: All scores for reordering
				distance_score: distanceScore,
				quality_score_normalized: qualityScore,
				final_score: finalScore,
				scoring_method: semanticSearchUsed && semanticScore > 0 ? 'hybrid' : 'basic'
			};
		});

		// Step 5: Apply sorting
		switch (sortBy) {
			case 'rating':
				results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
				break;
			case 'distance':
				results.sort((a, b) => a.distance_miles - b.distance_miles);
				break;
			case 'relevance':
			default:
				// Sort by hybrid score
				results.sort((a, b) => b.final_score - a.final_score);
				break;
		}

		// Step 6: Apply limit
		const totalCount = results.length;
		const limitedResults = results.slice(0, limit);

		// Step 7: Log some stats for debugging
		if (semanticSearchUsed) {
			const topSemanticScores = limitedResults
				.slice(0, 5)
				.map(f => `${f.firm_name}: ${(f.semantic_score * 100).toFixed(1)}%`)
				.join(', ');
			console.log(`Top semantic matches: ${topSemanticScores}`);
		}

		return json({
			firms: limitedResults,
			total_count: totalCount,
			radius_used: radius,
			location: { lat, lng },
			filters_applied: {
				practice_area_query: practiceAreaQuery,
				practice_areas: practiceAreas,
				min_rating: minRating,
				sort_by: sortBy
			},
			semantic_search_enabled: semanticSearchUsed,
			query_embedding_generated: semanticSearchUsed
		});
	} catch (error) {
		console.error('Search error:', error);
		return json(
			{ error: error.message || 'Failed to search law firms' },
			{ status: 500 }
		);
	}
}