<footer>
	<div class="container">
		<div class="footer-content">
			<div class="footer-section">
				<div class="footer-logo">
					<img src="/claimsboost_logo_no_bg_white.png" alt="ClaimsBoost" class="footer-logo-img" />
				</div>
				<div class="footer-links">
					<a href="/about">About Us</a>
					<a href="/careers">Careers</a>
					<a href="/press">Press</a>
				</div>
			</div>

			<div class="footer-section">
				<h4>For Users</h4>
				<div class="footer-links">
					<a href="/how-it-works">How It Works</a>
					<a href="/find-lawyer">Find a Lawyer</a>
					<a href="/legal-guides">Legal Guides</a>
					<a href="/faq">FAQ</a>
				</div>
			</div>

			<div class="footer-section">
				<h4>For Lawyers</h4>
				<div class="footer-links">
					<a href="/join-network">Join Our Network</a>
					<a href="/lawyer-login">Lawyer Login</a>
					<a href="/advertising">Advertising</a>
				</div>
			</div>

			<div class="footer-section">
				<h4>Follow Us</h4>
				<div class="social-links">
					<a href="https://facebook.com" aria-label="Facebook">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
						</svg>
					</a>
					<a href="https://twitter.com" aria-label="Twitter">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
						</svg>
					</a>
				</div>
			</div>
		</div>

		<div class="footer-bottom">
			<div class="legal-links">
				<a href="/privacy">Privacy Policy</a>
				<a href="/terms">Terms of Service</a>
				<a href="/accessibility">Accessibility</a>
			</div>
			<p class="copyright">© 2024 ClaimsBoost. All rights reserved.</p>
		</div>
	</div>
</footer>

<style>
	footer {
		background: #1a1a1a;
		color: white;
		padding: 60px 20px 20px;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	.footer-content {
		display: grid;
		grid-template-columns: 1fr;
		gap: 40px;
		margin-bottom: 40px;
	}

	.footer-section h4 {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 16px;
	}

	.footer-logo {
		margin-bottom: 16px;
	}

	.footer-logo-img {
		height: auto;
		width: 220px;
		object-fit: contain;
	}

	.footer-links {
		display: flex;
		flex-direction: column;
		gap: 12px;
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
		gap: 16px;
	}

	.social-links a {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: #333;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		transition: background 0.2s;
	}

	.social-links a:hover {
		background: #FF7B00;
	}

	.footer-bottom {
		padding-top: 32px;
		border-top: 1px solid #333;
		text-align: center;
	}

	.legal-links {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 24px;
		margin-bottom: 16px;
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

	@media (min-width: 640px) {
		.footer-content {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 768px) {
		.footer-content {
			grid-template-columns: repeat(4, 1fr);
		}

		.footer-bottom {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		.legal-links {
			justify-content: flex-start;
			margin-bottom: 0;
		}
	}

	@media (min-width: 1024px) {
		footer {
			padding: 80px 20px 20px;
		}
	}
</style>