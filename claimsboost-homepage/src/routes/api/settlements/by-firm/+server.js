import { json } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabaseServer';

/**
 * GET /api/settlements/by-firm
 *
 * Fetch settlements for a specific law firm.
 * Returns settlements associated with the given firm slug.
 *
 * Query Parameters:
 * - firm_slug (required): The URL slug of the law firm
 * - limit (optional): Number of settlements to return (default: 6)
 *
 * Response:
 * - settlements: Array of settlement objects
 * - count: Number of settlements returned
 */
export async function GET({ url }) {
  const firmSlug = url.searchParams.get('firm_slug');
  const limit = parseInt(url.searchParams.get('limit') || '6');

  if (!firmSlug) {
    return json(
      { error: 'firm_slug parameter is required' },
      { status: 400 }
    );
  }

  try {
    console.log(`Fetching settlements for firm: ${firmSlug}`);

    // Query the settlement_search_view directly for this firm's settlements
    const { data, error } = await supabaseServer
      .from('settlement_search_view')
      .select('*')
      .eq('firm_slug', firmSlug)
      .not('display_summary', 'is', null)
      .gte('amount', 50000)
      .lte('amount', 5000000)
      .order('amount', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} settlements for firm ${firmSlug}`);

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