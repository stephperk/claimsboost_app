import { json } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabaseServer';

/**
 * GET /api/settlements/recent
 *
 * Simple endpoint to fetch recent settlements for homepage display.
 * Returns 6 random settlements with law firm information.
 *
 * Query Parameters:
 * - limit (optional): Number of settlements to return (default: 6)
 *
 * Response:
 * - settlements: Array of settlement objects
 * - count: Number of settlements returned
 */
export async function GET({ url }) {
  const limit = parseInt(url.searchParams.get('limit') || '6');

  try {
    console.log(`Fetching ${limit} recent settlements...`);

    const { data, error } = await supabaseServer.rpc('get_recent_settlements', {
      limit_results: limit
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} settlements`);

    return json({
      settlements: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Settlement fetch error:', error);
    return json(
      { error: error.message || 'Failed to fetch settlements' },
      { status: 500 }
    );
  }
}