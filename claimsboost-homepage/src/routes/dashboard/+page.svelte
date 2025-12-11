<script>
	import { supabase } from '$lib/supabaseClient.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let user = $state(null);
	let loading = $state(true);

	onMount(async () => {
		const { data: { session } } = await supabase.auth.getSession();

		if (!session) {
			goto('/login');
			return;
		}

		user = session.user;
		loading = false;

		// Listen for auth changes
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
			if (event === 'SIGNED_OUT' || !session) {
				goto('/login');
			}
		});

		return () => subscription.unsubscribe();
	});

	async function signOut() {
		await supabase.auth.signOut();
		goto('/');
	}
</script>

<svelte:head>
	<title>Dashboard | ClaimsBoost</title>
</svelte:head>

<div class="dashboard-page">
	<header class="dashboard-header">
		<a href="/" class="logo">Claims<span>Boost</span></a>
		<button class="sign-out-btn" onclick={signOut}>Sign Out</button>
	</header>

	<main class="dashboard-main">
		{#if loading}
			<div class="loading">
				<div class="spinner"></div>
			</div>
		{:else}
			<div class="dashboard-card">
				<h1>Welcome to your dashboard</h1>
				<p class="subtitle">You're signed in as:</p>
				<p class="user-info">
					{#if user?.phone}
						{user.phone}
					{:else if user?.email}
						{user.email}
					{/if}
				</p>
			</div>
		{/if}
	</main>
</div>

<style>
	.dashboard-page {
		min-height: 100vh;
		background: #f9fafb;
	}

	.dashboard-header {
		background: #ffffff;
		border-bottom: 1px solid #e5e5e5;
		padding: 0 20px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 70px;
		max-width: 1200px;
		margin: 0 auto;
	}

	.logo {
		font-size: 24px;
		font-weight: 700;
		color: #1a1a1a;
		text-decoration: none;
	}

	.logo span {
		background: linear-gradient(135deg, #FF6800 0%, #FFA500 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.sign-out-btn {
		padding: 10px 20px;
		background: white;
		color: #1a1a1a;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.2s;
	}

	.sign-out-btn:hover {
		background: #f9fafb;
		border-color: #1a1a1a;
	}

	.dashboard-main {
		padding: 60px 20px;
	}

	.loading {
		display: flex;
		justify-content: center;
		padding: 60px;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid #e5e5e5;
		border-radius: 50%;
		border-top-color: #1a1a1a;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.dashboard-card {
		background: white;
		border-radius: 16px;
		padding: 40px;
		max-width: 600px;
		margin: 0 auto;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	.dashboard-card h1 {
		font-size: 28px;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 12px;
	}

	.subtitle {
		font-size: 16px;
		color: #666;
		margin-bottom: 8px;
	}

	.user-info {
		font-size: 18px;
		font-weight: 600;
		color: #1a1a1a;
	}
</style>
