<script>
	import { goto } from '$app/navigation';
	import SearchBarV2 from './SearchBarV2.svelte';

	let searchQuery = $state('');

	const suggestions = [
		'I was rear-ended',
		'Slipped at grocery store',
		'Back injury at work',
		'Bit by a dog',
		'Botched surgery',
		'Burned by a defective product'
	];

	function handleSearch() {
		goto('/get-started');
	}

	function setSuggestion(suggestion) {
		searchQuery = suggestion;
	}
</script>

<section class="hero">
	<div class="container">
		<div class="hero-content">
			<div class="hero-text">
				<h1>
					Injured in an accident?<br>
					Start your <span class="highlight-free">free</span> claim
				</h1>
				<p class="subheadline">Start your claim today with a <strong>free settlement estimate</strong>.</p>

				<div class="search-form">
					<SearchBarV2
						bind:practiceAreaValue={searchQuery}
						practiceAreaPlaceholder="I was rear-ended"
						buttonText="Get Free Estimate"
						showLocationField={false}
						on:search={handleSearch}
					/>
				</div>

				<div class="suggestions">
					<span class="suggestions-label">Suggestions:</span>
					<div class="suggestion-tags">
						{#each suggestions as suggestion}
							<button
								class="suggestion-tag"
								onclick={() => setSuggestion(suggestion)}
							>
								{suggestion}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<div class="hero-visual">
				<div class="main-image">
					<div class="consultant-image">
						<img src="/hero-person.png" alt="Happy client" class="hero-person-image" />
					</div>
					<div class="chat-bubbles">
						<div class="chat-bubble bubble-1">
							<div class="expert-avatar">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M3 21l1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>
								</svg>
							</div>
							<span>Don't settle for less</span>
						</div>
						<div class="chat-bubble bubble-2">
							<div class="expert-avatar">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
									<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
								</svg>
							</div>
							<span>You have a strong case...</span>
						</div>
						<div class="chat-bubble bubble-3">
							<div class="expert-avatar">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
									<polyline points="14 2 14 8 20 8"/>
									<line x1="16" y1="13" x2="8" y2="13"/>
									<line x1="16" y1="17" x2="8" y2="17"/>
									<polyline points="10 9 9 9 8 9"/>
								</svg>
							</div>
							<span>We'll handle it from here...</span>
						</div>
						<div class="chat-bubble bubble-4">
							<div class="expert-avatar">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M12 2L2 7l10 5 10-5-10-5z"/>
									<path d="M2 17l10 5 10-5"/>
									<path d="M2 12l10 5 10-5"/>
								</svg>
							</div>
							<span>I've submitted your claim</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.hero {
		padding: 60px 20px;
		background: #ffffff;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	.hero-content {
		display: grid;
		grid-template-columns: 1fr;
		gap: 40px;
		align-items: center;
	}

	.hero-text {
		text-align: center;
	}

	h1 {
		font-size: 30px;
		font-weight: 700;
		line-height: 1.2;
		color: #1a1a1a;
		margin-bottom: 16px;
	}

	.highlight-free {
		background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subheadline {
		font-size: 18px;
		color: #000000;
		margin-bottom: 32px;
	}

	.search-form {
		margin-bottom: 40px;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	.suggestions {
		display: flex;
		flex-direction: row;
		gap: 12px;
		align-items: flex-start;
		flex-wrap: wrap;
	}

	.suggestions-label {
		font-size: 14px;
		color: #666;
		padding: 8px 0;
		line-height: 1.5;
	}

	.suggestion-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: flex-start;
		flex: 1;
	}

	.suggestion-tag {
		padding: 8px 16px;
		background: #ffffff;
		border: 2px solid transparent;
		background-image: linear-gradient(white, white), linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		background-origin: border-box;
		background-clip: padding-box, border-box;
		border-radius: 20px;
		font-size: 14px;
		color: #666;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
	}

	.suggestion-tag:hover {
		background-image: linear-gradient(white, white), linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		color: #2563EB;
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
	}

	.hero-visual {
		display: none;
	}

	.main-image {
		position: relative;
		max-width: 400px;
		margin: 0 auto;
	}

	.consultant-image {
		width: 400px;
		height: 400px;
		border-radius: 50%;
		overflow: hidden;
		background: white;
		box-shadow: 0 10px 40px rgba(0,0,0,0.1), 0 0 80px rgba(255, 123, 0, 0.4), 0 0 120px rgba(255, 123, 0, 0.2);
	}

	.hero-person-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.chat-bubbles {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
	}

	.chat-bubble {
		position: absolute;
		background: white;
		border-radius: 20px;
		padding: 8px 12px;
		display: flex;
		align-items: center;
		gap: 8px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
		font-size: 13px;
		animation: float 3s ease-in-out infinite;
	}

	.expert-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.expert-avatar svg {
		width: 18px;
		height: 18px;
		color: white;
	}

	.bubble-1 {
		top: -10px;
		left: -60px;
		animation-delay: 0s;
	}

	.bubble-2 {
		top: 60px;
		right: -80px;
		animation-delay: 0.5s;
	}

	.bubble-3 {
		bottom: 80px;
		left: -80px;
		animation-delay: 1s;
	}

	.bubble-4 {
		bottom: 20px;
		right: -70px;
		animation-delay: 1.5s;
		max-width: 180px;
	}

	@keyframes float {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	@media (min-width: 768px) {
		.hero {
			padding: 80px 20px;
		}

		.hero-content {
			grid-template-columns: 1.5fr 1fr;
		}

		.hero-text {
			text-align: left;
		}

		h1 {
			font-size: 38px;
		}

		.search-form {
			margin-left: 0;
		}

		.suggestions {
			flex-direction: row;
			align-items: flex-start;
		}

		.suggestion-tags {
			justify-content: flex-start;
		}

		.hero-visual {
			display: block;
		}
	}

	@media (min-width: 1024px) {
		h1 {
			font-size: 44px;
		}

		.subheadline {
			font-size: 20px;
		}
	}
</style>