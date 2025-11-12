/**
 * Embedding API Client for semantic similarity search
 * Connects to the ClaimsBoost embedding API deployed on Fly.io
 */

const EMBEDDING_API_URL = import.meta.env.VITE_EMBEDDING_API_URL || 'https://claimsboost-embedding-api.fly.dev';
const DEFAULT_TIMEOUT = 5000; // 5 seconds

export class EmbeddingClient {
	constructor(baseUrl = EMBEDDING_API_URL) {
		this.baseUrl = baseUrl;
		this.timeout = DEFAULT_TIMEOUT;
	}

	/**
	 * Generate embedding for a single text
	 * @param {string} text - Text to embed
	 * @returns {Promise<{embedding: number[], model: string, dimensions: number} | null>}
	 */
	async embed(text) {
		if (!text || typeof text !== 'string') {
			console.error('Invalid text for embedding:', text);
			return null;
		}

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), this.timeout);

			const response = await fetch(`${this.baseUrl}/api/v1/embed`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ text }),
				signal: controller.signal
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				console.error(`Embedding API error: ${response.status}`);
				return null;
			}

			return await response.json();
		} catch (error) {
			if (error.name === 'AbortError') {
				console.error('Embedding API timeout');
			} else {
				console.error('Embedding API failed:', error);
			}
			return null;
		}
	}

	/**
	 * Generate embeddings for multiple texts
	 * @param {string[]} texts - Array of texts to embed
	 * @returns {Promise<{embeddings: number[][], model: string, dimensions: number} | null>}
	 */
	async embedBatch(texts) {
		if (!Array.isArray(texts) || texts.length === 0) {
			console.error('Invalid texts for batch embedding');
			return null;
		}

		// Filter out empty strings
		const validTexts = texts.filter(t => t && typeof t === 'string');
		if (validTexts.length === 0) {
			return null;
		}

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), this.timeout * 2); // Longer timeout for batch

			const response = await fetch(`${this.baseUrl}/api/v1/embed-batch`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ texts: validTexts }),
				signal: controller.signal
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				console.error(`Embedding API batch error: ${response.status}`);
				return null;
			}

			return await response.json();
		} catch (error) {
			if (error.name === 'AbortError') {
				console.error('Embedding API batch timeout');
			} else {
				console.error('Embedding API batch failed:', error);
			}
			return null;
		}
	}

	/**
	 * Check if the embedding API is healthy
	 * @returns {Promise<boolean>}
	 */
	async isHealthy() {
		try {
			const response = await fetch(`${this.baseUrl}/health`, {
				method: 'GET',
				signal: AbortSignal.timeout(3000)
			});

			if (!response.ok) {
				return false;
			}

			const data = await response.json();
			return data.status === 'healthy' && data.model_loaded === true;
		} catch {
			return false;
		}
	}
}

// Create a singleton instance
export const embeddingClient = new EmbeddingClient();