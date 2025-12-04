<script>
	import '../app.css';
	import { page } from '$app/stores';

	let { children } = $props();

	// Build canonical URL from current path
	let canonicalUrl = $derived(`https://claimsboost.com${$page.url.pathname}`);
</script>

<svelte:head>
	<title>ClaimsBoost - Find Personal Injury Lawyers Near You</title>
	<meta name="description" content="Find top-rated personal injury lawyers near you. ClaimsBoost helps you connect with experienced attorneys and get help submitting your injury claim." />
	<meta name="viewport" content="width=device-width, initial-scale=1" />

	<!-- Canonical URL -->
	<link rel="canonical" href={canonicalUrl} />

	<!-- Open Graph / Social Media -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="ClaimsBoost" />
	<meta property="og:title" content="ClaimsBoost - Find Personal Injury Lawyers Near You" />
	<meta property="og:description" content="Find top-rated personal injury lawyers near you. ClaimsBoost helps you connect with experienced attorneys and get help submitting your injury claim." />
	<meta property="og:image" content="https://claimsboost.com/og-image.png" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="ClaimsBoost - Find Personal Injury Lawyers Near You" />
	<meta name="twitter:description" content="Find top-rated personal injury lawyers near you." />
	<meta name="twitter:image" content="https://claimsboost.com/og-image.png" />

	<!-- Structured Data for Google -->
	{@html `<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "WebSite",
		"name": "claimsboost.com",
		"url": "https://claimsboost.com",
		"description": "Find top-rated personal injury lawyers near you",
		"potentialAction": {
			"@type": "SearchAction",
			"target": "https://claimsboost.com/injury-law-firms?location={search_term_string}",
			"query-input": "required name=search_term_string"
		}
	}
	</script>`}

	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
	<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
</svelte:head>

{@render children?.()}
