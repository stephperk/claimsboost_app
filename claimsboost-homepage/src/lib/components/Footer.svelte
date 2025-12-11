<footer>
	<div class="container">
		<div class="footer-content">
			<!-- Row 1: Logo and Connect With Us on same line -->
			<div class="footer-top-row">
				<img src="/claimsboost_logo_no_bg_white.webp" alt="ClaimsBoost" class="footer-logo-img" width="220" height="43" />
				<h4 class="connect-heading">Connect With Us</h4>
			</div>

			<!-- Row 2: Nav links and Social icons on same line -->
			<div class="footer-middle-row">
				<div class="footer-links">
					<a href="/about">About</a>
					<a href="/contact">Contact</a>
					<a href="/faq">FAQ</a>
				</div>
				<div class="social-links">
					<a href="https://facebook.com" aria-label="Facebook">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
						</svg>
					</a>
					<a href="https://x.com" aria-label="X (formerly Twitter)">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
						</svg>
					</a>
					<a href="https://linkedin.com" aria-label="LinkedIn">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
						</svg>
					</a>
				</div>
			</div>
		</div>

		<div class="footer-bottom">
			<div class="legal-links">
				<a href="/privacy">Privacy Policy</a>
				<a href="/terms">Terms of Service</a>
				<a href="/disclaimer">Disclaimer</a>
				<a href="/accessibility">Accessibility</a>
			</div>
			<p class="copyright">&copy; 2025 ClaimsBoost. All rights reserved.</p>
		</div>
	</div>
</footer>

<style>
	footer {
		background: #1a1a1a;
		color: white;
		padding: 60px 20px 32px;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	.footer-content {
		display: flex;
		flex-direction: column;
		gap: 20px;
		margin-bottom: 40px;
	}

	.footer-top-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.footer-logo-img {
		height: auto;
		width: 220px;
		object-fit: contain;
	}

	.connect-heading {
		font-size: 14px;
		font-weight: 600;
		margin: 0;
		color: white;
	}

	.footer-middle-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.footer-links {
		display: flex;
		gap: 24px;
	}

	.footer-links a {
		color: #999;
		text-decoration: none;
		font-size: 14px;
		transition: color 0.2s;
	}

	.footer-links a:hover {
		color: #FF7B00;
	}

	.social-links {
		display: flex;
		gap: 12px;
	}

	.social-links a {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: #333;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		transition: background 0.2s;
	}

	.social-links a svg {
		width: 18px;
		height: 18px;
	}

	.social-links a:hover {
		background: #FF7B00;
	}

	.footer-bottom {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding-top: 32px;
		border-top: 1px solid #333;
		text-align: center;
	}

	.legal-links {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 24px;
	}

	.legal-links a {
		color: #999;
		text-decoration: none;
		font-size: 14px;
		transition: color 0.2s;
	}

	.legal-links a:hover {
		color: #FF7B00;
	}

	.copyright {
		color: #666;
		font-size: 14px;
		margin: 0;
	}

	@media (min-width: 768px) {
		.footer-bottom {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			text-align: left;
		}

		.legal-links {
			justify-content: flex-start;
		}
	}

	@media (max-width: 767px) {
		.footer-content {
			gap: 24px;
		}

		.footer-top-row {
			flex-direction: column;
			align-items: center;
			gap: 20px;
			width: 100%;
		}

		.footer-middle-row {
			flex-direction: column-reverse;
			align-items: center;
			gap: 20px;
			width: 100%;
		}

		.footer-links {
			justify-content: center;
		}

		.connect-heading {
			margin-top: 0;
		}
	}
</style>
