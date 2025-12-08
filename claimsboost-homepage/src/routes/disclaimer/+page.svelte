<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>Disclaimer | ClaimsBoost</title>
	<meta name="description" content="ClaimsBoost.com Legal Disclaimer - Important information about our services and limitations." />
</svelte:head>

<Header />

<main class="legal-page">
	<div class="container">
		<h1>Legal Disclaimer</h1>
		<p class="last-updated">Last Updated: December 2025</p>

		<section>
			<h2>ClaimsBoost.com Is Not a Law Firm</h2>
			<p><strong>ClaimsBoost.com is a technology platform, not a law firm.</strong> We do not provide legal services, legal advice, or legal representation. We do not employ attorneys to represent users of our platform.</p>
			<p>Our role is limited to:</p>
			<ul>
				<li>Providing informational content about personal injury matters</li>
				<li>Offering tools to help you understand potential settlement ranges</li>
				<li>Connecting you with independent attorneys in our network</li>
			</ul>
		</section>

		<section>
			<h2>No Legal Advice</h2>
			<p>The information provided on this website is for general informational purposes only and should not be construed as legal advice. <strong>Nothing on this website should be taken as legal advice for any individual case or situation.</strong></p>
			<p>The information on this site is not intended to create, and receipt or viewing of this information does not constitute, an attorney-client relationship. You should not act or rely on any information on this website without seeking the advice of a licensed attorney in your jurisdiction.</p>
		</section>

		<section>
			<h2>Settlement Estimates Are Not Guarantees</h2>
			<p><strong>Settlement estimates provided on this website are for informational purposes only.</strong> These estimates are approximations based on historical settlement data and publicly available information. They are not:</p>
			<ul>
				<li>Guarantees of any specific outcome</li>
				<li>Predictions of what you will receive</li>
				<li>Promises or warranties of any kind</li>
				<li>Legal advice about the value of your case</li>
			</ul>
			<p>Every case is unique. Actual settlement amounts depend on many factors specific to your situation, including the severity of your injuries, available evidence, insurance coverage, jurisdiction, and many other variables. Only a qualified attorney can evaluate the specific facts of your case and provide guidance on its potential value.</p>
		</section>

		<section>
			<h2>No Attorney-Client Relationship</h2>
			<p><strong>Using this website does not create an attorney-client relationship between you and ClaimsBoost.com.</strong></p>
			<p>An attorney-client relationship is formed only when you sign a formal retainer agreement directly with an attorney. Until that time:</p>
			<ul>
				<li>You should not disclose confidential information expecting it to be protected by attorney-client privilege</li>
				<li>You should not rely on any information from this site as legal advice</li>
				<li>You should not assume that any attorney has agreed to represent you</li>
			</ul>
		</section>

		<section>
			<h2>Third-Party Attorneys</h2>
			<p>The attorneys in our network are independent legal practitioners. ClaimsBoost.com:</p>
			<ul>
				<li><strong>Does not employ</strong> these attorneys</li>
				<li><strong>Does not supervise</strong> their legal work</li>
				<li><strong>Does not guarantee</strong> the quality of their services</li>
				<li><strong>Does not endorse</strong> any particular attorney</li>
				<li><strong>Is not responsible</strong> for any actions or omissions by these attorneys</li>
			</ul>
			<p>You are solely responsible for evaluating and selecting an attorney. We encourage you to conduct your own due diligence, including reviewing an attorney's qualifications, experience, disciplinary history, and client reviews before retaining their services.</p>
		</section>

		<section>
			<h2>Accuracy of Information</h2>
			<p>While we make reasonable efforts to provide accurate and up-to-date information, ClaimsBoost.com makes no warranties or representations regarding:</p>
			<ul>
				<li>The accuracy, completeness, or reliability of any content on this website</li>
				<li>The suitability of any information for your specific situation</li>
				<li>The availability or quality of attorneys in our network</li>
				<li>The outcomes of any legal matters</li>
			</ul>
			<p>Laws and regulations vary by jurisdiction and change over time. Information that is accurate today may not be accurate tomorrow. Always verify important information with a qualified attorney.</p>
		</section>

		<section>
			<h2>External Links</h2>
			<p>This website may contain links to third-party websites. These links are provided for your convenience and information only. ClaimsBoost.com:</p>
			<ul>
				<li>Does not control the content of these external sites</li>
				<li>Does not endorse or guarantee any information on external sites</li>
				<li>Is not responsible for the privacy practices of external sites</li>
				<li>Is not liable for any damages arising from your use of external sites</li>
			</ul>
			<p>We encourage you to review the terms of service and privacy policies of any third-party websites you visit.</p>
		</section>

		<section>
			<h2>Limitation of Liability</h2>
			<p>To the fullest extent permitted by law, ClaimsBoost.com and its officers, directors, employees, agents, and affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of this website or reliance on any information provided herein.</p>
		</section>

		<section>
			<h2>Contact Us</h2>
			<p>If you have questions about this disclaimer, please contact us at:</p>
			<p>
				<strong>ClaimsBoost</strong><br />
				Email: <a href="mailto:legal@claimsboost.com">legal@claimsboost.com</a>
			</p>
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
