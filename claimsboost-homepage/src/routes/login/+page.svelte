<script>
	import { supabase } from '$lib/supabaseClient.js';
	import { goto } from '$app/navigation';

	// State
	let step = $state('entry'); // 'entry' | 'otp'
	let method = $state('phone'); // 'phone' | 'email'
	let phone = $state('');
	let email = $state('');
	let otp = $state(['', '', '', '', '', '']);
	let loading = $state(false);
	let error = $state('');
	let success = $state('');
	let countdown = $state(0);
	let countdownInterval = $state(null);

	// Format phone as user types
	function formatPhone(value) {
		const digits = value.replace(/\D/g, '');
		if (digits.length <= 3) return digits;
		if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
		return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
	}

	function handlePhoneInput(e) {
		const formatted = formatPhone(e.target.value);
		phone = formatted;
	}

	// Send OTP
	async function sendOtp() {
		error = '';
		success = '';
		loading = true;

		try {
			if (method === 'phone') {
				// Convert formatted phone to E.164 format
				const digits = phone.replace(/\D/g, '');
				if (digits.length !== 10) {
					error = 'Please enter a valid 10-digit phone number';
					loading = false;
					return;
				}
				const e164 = `+1${digits}`;

				const { error: otpError } = await supabase.auth.signInWithOtp({
					phone: e164
				});

				if (otpError) throw otpError;
			} else {
				if (!email || !email.includes('@')) {
					error = 'Please enter a valid email address';
					loading = false;
					return;
				}

				const { error: otpError } = await supabase.auth.signInWithOtp({
					email: email
				});

				if (otpError) throw otpError;
			}

			success = method === 'phone'
				? `Code sent to ${phone}`
				: `Code sent to ${email}`;
			step = 'otp';
			startCountdown();
		} catch (err) {
			error = err.message || 'Failed to send code. Please try again.';
		} finally {
			loading = false;
		}
	}

	// Start countdown timer
	function startCountdown() {
		countdown = 60;
		if (countdownInterval) clearInterval(countdownInterval);
		countdownInterval = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				clearInterval(countdownInterval);
				countdownInterval = null;
			}
		}, 1000);
	}

	// Handle OTP input
	function handleOtpInput(index, e) {
		const value = e.target.value;

		// Handle paste
		if (value.length > 1) {
			const digits = value.replace(/\D/g, '').slice(0, 6);
			otp = digits.split('').concat(Array(6 - digits.length).fill(''));
			// Focus last filled or next empty
			const nextIndex = Math.min(digits.length, 5);
			document.querySelectorAll('.otp-input')[nextIndex]?.focus();
			return;
		}

		// Single digit
		if (/^\d$/.test(value)) {
			otp[index] = value;
			otp = [...otp];
			// Auto-advance
			if (index < 5) {
				document.querySelectorAll('.otp-input')[index + 1]?.focus();
			}
		} else if (value === '') {
			otp[index] = '';
			otp = [...otp];
		}
	}

	function handleOtpKeydown(index, e) {
		if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
			document.querySelectorAll('.otp-input')[index - 1]?.focus();
		}
	}

	// Verify OTP
	async function verifyOtp() {
		const code = otp.join('');
		if (code.length !== 6) {
			error = 'Please enter the 6-digit code';
			return;
		}

		error = '';
		loading = true;

		try {
			const verifyData = method === 'phone'
				? { phone: `+1${phone.replace(/\D/g, '')}`, token: code, type: 'sms' }
				: { email: email, token: code, type: 'email' };

			const { error: verifyError } = await supabase.auth.verifyOtp(verifyData);

			if (verifyError) throw verifyError;

			// Success - redirect to dashboard
			goto('/dashboard');
		} catch (err) {
			error = 'Invalid code. Please try again.';
			// Clear OTP inputs
			otp = ['', '', '', '', '', ''];
			document.querySelectorAll('.otp-input')[0]?.focus();
		} finally {
			loading = false;
		}
	}

	// Resend OTP
	async function resendOtp() {
		if (countdown > 0) return;
		await sendOtp();
	}

	// Go back to entry
	function goBack() {
		step = 'entry';
		error = '';
		success = '';
		otp = ['', '', '', '', '', ''];
		if (countdownInterval) {
			clearInterval(countdownInterval);
			countdownInterval = null;
		}
	}

	// Switch method
	function switchMethod() {
		method = method === 'phone' ? 'email' : 'phone';
		error = '';
	}
</script>

<svelte:head>
	<title>Sign In | ClaimsBoost</title>
</svelte:head>

<div class="login-page">
	<header class="login-header">
		<div class="header-content">
			<a href="/">
				<img src="/claimsboost-logo.webp" alt="ClaimsBoost" class="logo" width="450" height="98" />
			</a>
		</div>
	</header>

	<main class="login-main">
		{#if step === 'entry'}
			<div class="login-card">
				<h1>Sign in</h1>
				<p class="subtitle">
					{#if method === 'phone'}
						Enter your phone number to continue
					{:else}
						Enter your email to continue
					{/if}
				</p>

				{#if error}
					<div class="status-message error">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="12" cy="12" r="10"/>
							<path d="M15 9l-6 6M9 9l6 6"/>
						</svg>
						{error}
					</div>
				{/if}

				<form onsubmit={(e) => { e.preventDefault(); sendOtp(); }}>
					<div class="form-group">
						<label class="form-label">
							{method === 'phone' ? 'Phone Number' : 'Email'}
						</label>
						{#if method === 'phone'}
							<input
								type="tel"
								class="form-input"
								placeholder="(555) 123-4567"
								value={phone}
								oninput={handlePhoneInput}
								disabled={loading}
								required
							/>
						{:else}
							<input
								type="email"
								class="form-input"
								placeholder="you@example.com"
								bind:value={email}
								disabled={loading}
								required
							/>
						{/if}
					</div>

					<button type="submit" class="btn-primary" disabled={loading}>
						{#if loading}
							<span class="spinner"></span>
							Sending code...
						{:else}
							Continue
						{/if}
					</button>
				</form>

				<div class="helper-text">
					<button type="button" class="text-link" onclick={switchMethod}>
						Use {method === 'phone' ? 'email' : 'phone'} instead
					</button>
				</div>
			</div>
		{:else}
			<div class="login-card">
				<button type="button" class="back-link" onclick={goBack}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M19 12H5M12 19l-7-7 7-7"/>
					</svg>
					Back
				</button>

				<h1>{method === 'phone' ? 'Check your phone' : 'Check your email'}</h1>
				<p class="subtitle">
					We sent a 6-digit code to {method === 'phone' ? phone : email}
				</p>

				{#if success}
					<div class="status-message success">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="20 6 9 17 4 12"/>
						</svg>
						{success}
					</div>
				{/if}

				{#if error}
					<div class="status-message error">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="12" cy="12" r="10"/>
							<path d="M15 9l-6 6M9 9l6 6"/>
						</svg>
						{error}
					</div>
				{/if}

				<form onsubmit={(e) => { e.preventDefault(); verifyOtp(); }}>
					<div class="form-group">
						<label class="form-label">Verification Code</label>
						<div class="otp-inputs">
							{#each otp as digit, i}
								<input
									type="text"
									inputmode="numeric"
									maxlength="6"
									class="otp-input"
									class:filled={digit !== ''}
									class:error={error && digit !== ''}
									value={digit}
									oninput={(e) => handleOtpInput(i, e)}
									onkeydown={(e) => handleOtpKeydown(i, e)}
									disabled={loading}
								/>
							{/each}
						</div>
					</div>

					<button type="submit" class="btn-primary" disabled={loading}>
						{#if loading}
							<span class="spinner"></span>
							Verifying...
						{:else}
							Verify & Sign In
						{/if}
					</button>
				</form>

				<div class="helper-text">
					Didn't receive a code?
					{#if countdown > 0}
						<span class="countdown">Resend in {countdown}s</span>
					{:else}
						<button type="button" class="text-link" onclick={resendOtp}>Resend</button>
					{/if}
				</div>
			</div>
		{/if}
	</main>
</div>

<style>
	.login-page {
		min-height: 100vh;
		background: #f9fafb;
	}

	.login-header {
		background: white;
		padding: 0 20px;
		border-bottom: 1px solid #e5e5e5;
	}

	.header-content {
		max-width: 1000px;
		margin: 0 auto;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 70px;
	}

	.login-header a {
		display: inline-block;
	}

	.logo {
		max-height: 49px;
		width: auto;
		object-fit: contain;
	}

	.login-main {
		padding: 60px 20px;
	}

	.login-card {
		background: white;
		border-radius: 16px;
		padding: 40px 24px;
		max-width: 400px;
		margin: 0 auto;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.login-card h1 {
		font-size: 26px;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 8px;
		line-height: 1.2;
	}

	.subtitle {
		font-size: 15px;
		color: #666;
		margin-bottom: 28px;
	}

	.form-group {
		margin-bottom: 24px;
	}

	.form-label {
		display: block;
		font-size: 14px;
		font-weight: 600;
		color: #1a1a1a;
		margin-bottom: 8px;
	}

	.form-input {
		width: 100%;
		padding: 14px 16px;
		border: 1px solid #e5e5e5;
		border-radius: 12px;
		font-size: 16px;
		font-family: inherit;
		color: #1a1a1a;
		background: white;
		transition: all 0.2s;
	}

	.form-input:focus {
		outline: none;
		border-color: #1a1a1a;
		background: #f9fafb;
	}

	.form-input::placeholder {
		color: #9ca3af;
	}

	.form-input:disabled {
		background: #f3f4f6;
		color: #6b7280;
		cursor: not-allowed;
	}

	.btn-primary {
		width: 100%;
		padding: 16px;
		background: #1a1a1a;
		color: white;
		border: none;
		border-radius: 12px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.btn-primary:hover:not(:disabled) {
		background: #333333;
	}

	.btn-primary:active:not(:disabled) {
		transform: translateY(1px);
	}

	.btn-primary:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	.helper-text {
		text-align: center;
		margin-top: 24px;
		font-size: 14px;
		color: #666;
	}

	.text-link {
		color: #1a1a1a;
		text-decoration: underline;
		font-weight: 500;
		background: none;
		border: none;
		cursor: pointer;
		font-size: inherit;
		font-family: inherit;
		padding: 0;
	}

	.text-link:hover {
		color: #666;
	}

	.countdown {
		color: #999;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: #666;
		font-size: 14px;
		font-weight: 500;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		margin-bottom: 20px;
		font-family: inherit;
	}

	.back-link:hover {
		color: #1a1a1a;
	}

	/* OTP Inputs */
	.otp-inputs {
		display: flex;
		gap: 8px;
		justify-content: center;
	}

	.otp-input {
		width: 40px;
		height: 48px;
		border: 1.5px solid #e5e5e5;
		border-radius: 8px;
		font-size: 18px;
		font-weight: 600;
		text-align: center;
		font-family: inherit;
		color: #1a1a1a;
		transition: all 0.2s;
	}

	.otp-input:focus {
		outline: none;
		border-color: #1a1a1a;
		background: #f9fafb;
	}

	.otp-input.filled {
		border-color: #1a1a1a;
		background: #f9fafb;
	}

	.otp-input.error {
		border-color: #ef4444;
		background: #fef2f2;
	}

	/* Status Messages */
	.status-message {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		margin-bottom: 24px;
	}

	.status-message svg {
		flex-shrink: 0;
	}

	.status-message.success {
		color: #16a34a;
	}

	.status-message.error {
		color: #dc2626;
	}

	/* Spinner */
	.spinner {
		display: inline-block;
		width: 18px;
		height: 18px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: white;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	@media (max-width: 480px) {
		.login-main {
			padding: 40px 16px;
		}

		.login-card {
			padding: 32px 20px;
		}

		.otp-input {
			width: 36px;
			height: 44px;
			font-size: 16px;
		}

		.otp-inputs {
			gap: 6px;
		}
	}
</style>
