import { supabaseServer } from '$lib/supabaseServer.js';
import { cityNameToUrl } from '$lib/utils/stateMapping.js';

const BASE_URL = 'https://claimsboost.com';

export async function GET() {
	// Static pages with their priorities and change frequencies
	const staticPages = [
		{ url: '/', priority: '1.0', changefreq: 'daily' },
		{ url: '/injury-law-firms', priority: '0.9', changefreq: 'daily' },
		{ url: '/injury-law-firms/locations', priority: '0.8', changefreq: 'weekly' },
		{ url: '/injury-law-firms/practice-areas', priority: '0.8', changefreq: 'weekly' },
		{ url: '/about', priority: '0.6', changefreq: 'monthly' },
		{ url: '/get-started', priority: '0.7', changefreq: 'monthly' }
	];

	// Fetch all verified law firms with slugs
	const { data: firms, error } = await supabaseServer
		.from('verified_law_firms')
		.select('slug, city, state, updated_at')
		.not('slug', 'is', null)
		.eq('is_personal_injury_firm', true);

	if (error) {
		console.error('Sitemap: Error fetching firms:', error);
		return new Response('Error generating sitemap', { status: 500 });
	}

	// Generate firm URLs
	const firmUrls = (firms || []).map((firm) => ({
		url: `/injury-law-firms/${firm.state.toLowerCase()}/${cityNameToUrl(firm.city)}/${firm.slug}`,
		lastmod: firm.updated_at ? new Date(firm.updated_at).toISOString().split('T')[0] : null,
		priority: '0.7',
		changefreq: 'weekly'
	}));

	// Build XML
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
	.map(
		(page) => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
	)
	.join('\n')}
${firmUrls
	.map(
		(page) => `  <url>
    <loc>${BASE_URL}${page.url}</loc>${page.lastmod ? `\n    <lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600' // Cache for 1 hour
		}
	});
}
