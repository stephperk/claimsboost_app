<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>Accessibility Statement | ClaimsBoost</title>
	<meta name="description" content="ClaimsBoost.com Accessibility Statement - Our commitment to making our website accessible to all users." />
</svelte:head>

<Header />

<main class="legal-page">
	<div class="container">
		<h1>Accessibility Statement</h1>
		<p class="last-updated">Last Updated: December 2025</p>

		<section>
			<h2>Our Commitment</h2>
			<p>ClaimsBoost.com is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to ensure we provide equal access to all users.</p>
		</section>

		<section>
			<h2>Accessibility Standards</h2>
			<p>We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. These guidelines explain how to make web content more accessible for people with disabilities and more user-friendly for everyone.</p>
			<p>The guidelines have three levels of accessibility (A, AA, and AAA). We have chosen Level AA as our target for the ClaimsBoost.com website.</p>
		</section>

		<section>
			<h2>Accessibility Features</h2>
			<p>We have implemented the following accessibility features on our website:</p>

			<h3>Navigation</h3>
			<ul>
				<li>Keyboard navigation support throughout the site</li>
				<li>Skip navigation links to bypass repetitive content</li>
				<li>Consistent navigation structure across pages</li>
				<li>Clear focus indicators for interactive elements</li>
			</ul>

			<h3>Content</h3>
			<ul>
				<li>Alternative text for images</li>
				<li>Descriptive link text</li>
				<li>Proper heading hierarchy</li>
				<li>Readable fonts and adequate text sizing</li>
			</ul>

			<h3>Visual Design</h3>
			<ul>
				<li>Sufficient color contrast between text and backgrounds</li>
				<li>Content that doesn't rely solely on color to convey meaning</li>
				<li>Resizable text without loss of functionality</li>
				<li>Responsive design that works on various screen sizes</li>
			</ul>

			<h3>Forms</h3>
			<ul>
				<li>Properly labeled form fields</li>
				<li>Clear error messages and instructions</li>
				<li>Logical tab order</li>
			</ul>
		</section>

		<section>
			<h2>Assistive Technologies</h2>
			<p>Our website is designed to be compatible with the following assistive technologies:</p>
			<ul>
				<li>Screen readers (such as JAWS, NVDA, VoiceOver)</li>
				<li>Screen magnification software</li>
				<li>Speech recognition software</li>
				<li>Keyboard-only navigation</li>
			</ul>
		</section>

		<section>
			<h2>Known Limitations</h2>
			<p>While we strive to ensure that all pages and content on ClaimsBoost.com are accessible, some content may not yet be fully accessible. We are actively working to address these limitations.</p>
			<p>If you encounter any accessibility barriers, please let us know so we can address them promptly.</p>
		</section>

		<section>
			<h2>Ongoing Efforts</h2>
			<p>We are committed to maintaining and improving the accessibility of our website. Our efforts include:</p>
			<ul>
				<li>Regular accessibility audits and testing</li>
				<li>Training our team on accessibility best practices</li>
				<li>Incorporating accessibility into our design and development processes</li>
				<li>Addressing user feedback and accessibility issues promptly</li>
			</ul>
		</section>

		<section>
			<h2>Feedback and Contact</h2>
			<p>We welcome your feedback on the accessibility of ClaimsBoost.com. If you encounter any accessibility barriers or have suggestions for improvement, please contact us:</p>
			<p>
				<strong>Email:</strong> <a href="mailto:accessibility@claimsboost.com">accessibility@claimsboost.com</a>
			</p>
			<p>When contacting us, please include:</p>
			<ul>
				<li>The URL (web address) of the page where you encountered the issue</li>
				<li>A description of the accessibility barrier you experienced</li>
				<li>The assistive technology you were using (if applicable)</li>
				<li>Your contact information so we can follow up with you</li>
			</ul>
			<p>We will make every effort to respond to your feedback within 5 business days.</p>
		</section>

		<section>
			<h2>Third-Party Content</h2>
			<p>Our website may include content from third-party sources. While we strive to work with partners who share our commitment to accessibility, we cannot guarantee the accessibility of third-party content.</p>
		</section>
	</div>
</main>

<Footer />

<style>
	.legal-page {
		padding: 60px 20px;
		background: #fff;
		min-height: 100vh;
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
	}

	h1 {
		font-size: 36px;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 8px;
	}

	.last-updated {
		color: #666;
		font-size: 14px;
		margin-bottom: 40px;
	}

	section {
		margin-bottom: 32px;
	}

	h2 {
		font-size: 22px;
		font-weight: 600;
		color: #1a1a1a;
		margin-bottom: 16px;
		margin-top: 40px;
	}

	h3 {
		font-size: 18px;
		font-weight: 600;
		color: #333;
		margin-bottom: 12px;
		margin-top: 24px;
	}

	p {
		color: #444;
		line-height: 1.7;
		margin-bottom: 16px;
	}

	ul {
		color: #444;
		line-height: 1.7;
		margin-bottom: 16px;
		padding-left: 24px;
	}

	li {
		margin-bottom: 8px;
	}

	a {
		color: #2563EB;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}

	strong {
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.legal-page {
			padding: 40px 16px;
		}

		h1 {
			font-size: 28px;
		}

		h2 {
			font-size: 20px;
		}
	}
</style>
