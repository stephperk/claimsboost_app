import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5176,
		hmr: {
			clientPort: 443
		},
		allowedHosts: [
			'unsoluble-franklin-nonpossibly.ngrok-free.dev',
			'.ngrok-free.dev'
		]
	}
});
