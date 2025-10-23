<script>
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>ClaimsBoost - Get Paid for Your Pain | Free Settlement Estimate</title>
	<meta name="description" content="Injured in an accident? Connect with top-rated personal injury lawyers and get a free settlement estimate. ClaimsBoost helps you get the compensation you deserve." />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
	<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
</svelte:head>

{@render children?.()}
