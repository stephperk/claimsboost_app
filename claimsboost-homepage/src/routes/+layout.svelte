<script>
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>claimsboost.com - Get help submitting your personal injury claim</title>
	<meta name="description" content="Find top-rated personal injury lawyers near you. claimsboost.com helps you connect with experienced attorneys and get help submitting your injury claim." />
	<meta name="viewport" content="width=device-width, initial-scale=1" />

	<!-- Open Graph / Social Media -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="claimsboost.com" />
	<meta property="og:title" content="claimsboost.com - Get help submitting your personal injury claim" />
	<meta property="og:description" content="Find top-rated personal injury lawyers near you. claimsboost.com helps you connect with experienced attorneys and get help submitting your injury claim." />
	<meta property="og:image" content="https://claimsboost.com/claimsboost-logo.png" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="claimsboost.com - Get help submitting your personal injury claim" />
	<meta name="twitter:description" content="Find top-rated personal injury lawyers near you." />

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
