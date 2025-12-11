<script>
	import { goto } from '$app/navigation';
	import SearchBarV2 from './SearchBarV2.svelte';

	let searchQuery = $state('');

	const suggestions = [
		'Rear-ended on highway',
		'Slipped at grocery store',
		'Back injury at work',
		'Dispute with insurance',
		'Botched surgery',
		'Injured by a defective product'
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
					Wronged or Injured?<br>
					Start your <span class="highlight-free">free</span> claim
				</h1>
				<p class="subheadline">Start your claim today with a <strong>free settlement estimate</strong>.</p>

				<div class="search-form">
					<SearchBarV2
						bind:practiceAreaValue={searchQuery}
						practiceAreaPlaceholder="Describe injury or wrongdoing"
						buttonText="Get Free Estimate"
						showLocationField={false}
						on:search={handleSearch}
					/>
				</div>

				<div class="suggestions">
					<span class="suggestions-label">Suggestions:</span>
					<div class="suggestion-tags">
						{#each suggestions as suggestion, i}
							<button
								class="suggestion-tag"
								style="animation-delay: {i * 0.15}s"
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
						<img src="/hero-person.webp" alt="Happy client" class="hero-person-image" width="800" height="533" fetchpriority="high" />
					</div>
					<div class="chat-bubbles">
						<div class="chat-bubble bubble-1">
							<div class="expert-avatar-large">
								<img src="/avatar-expert-1.webp" alt="Expert" width="48" height="48" />
							</div>
							<div class="bubble-text">
								<span>Let's review your case</span>
							</div>
						</div>
						<div class="chat-bubble bubble-2">
							<div class="bubble-text-right">
								<span>No fee unless you win</span>
							</div>
							<div class="expert-avatar-large">
								<img src="/avatar-expert-2.webp" alt="Expert" width="48" height="48" />
							</div>
						</div>
						<div class="chat-bubble bubble-4">
							<div class="bubble-text-right">
								<span>Your estimated settlement is...</span>
							</div>
							<div class="expert-avatar-large">
								<img src="/avatar-expert-2.webp" alt="Expert" width="48" height="48" />
							</div>
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
		margin-bottom: 32px;
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
		margin-bottom: 40px;
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
		opacity: 0;
		transform: scale(0.8);
		animation: bubblePop 0.4s ease-out forwards;
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

	.expert-avatar-large {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		overflow: hidden;
		flex-shrink: 0;
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
		background: #e5e7eb;
	}

	.expert-avatar-large img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.bubble-text {
		background: #007AFF;
		color: white;
		border-radius: 20px;
		padding: 8px 12px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
		font-size: 13px;
		font-weight: 600;
	}

	.bubble-text-right {
		background: #007AFF;
		color: white;
		border-radius: 20px;
		padding: 8px 12px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
		font-size: 13px;
		font-weight: 600;
	}

	.bubble-1 {
		top: 135px;
		left: -110px;
		animation-delay: 0s;
		display: flex;
		align-items: flex-end;
		gap: 4px;
		background: none;
		box-shadow: none;
		padding: 0;
	}

	.bubble-2 {
		top: 45px;
		right: -80px;
		animation-delay: 0.5s;
		display: flex;
		align-items: flex-end;
		gap: 4px;
		background: none;
		box-shadow: none;
		padding: 0;
	}

	.bubble-4 {
		bottom: 50px;
		right: -90px;
		animation-delay: 1.5s;
		display: flex;
		align-items: flex-end;
		gap: 4px;
		background: none;
		box-shadow: none;
		padding: 0;
	}

	@keyframes float {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	@keyframes bubblePop {
		0% {
			opacity: 0;
			transform: scale(0.8);
		}
		100% {
			opacity: 1;
			transform: scale(1);
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