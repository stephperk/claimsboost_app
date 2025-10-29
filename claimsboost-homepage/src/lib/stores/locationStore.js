import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'claimsboost_user_location';

// Initial state
const initialState = {
	city: null,
	state: null,
	latitude: null,
	longitude: null,
	hasLocation: false,
	loading: true,
	error: null,
	source: null // 'auto' for MaxMind/cookie detection
};

// Try to load from sessionStorage first
function getInitialValue() {
	if (browser) {
		try {
			const stored = sessionStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				// Only use if it's not stale (less than 24 hours old)
				if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
					return { ...parsed.data, loading: false };
				}
			}
		} catch (error) {
			console.error('Failed to load user location from sessionStorage:', error);
		}
	}
	return initialState;
}

// Create the store with sessionStorage backup
function createLocationStore() {
	const { subscribe, set, update } = writable(getInitialValue());

	return {
		subscribe,
		set: (value) => {
			// Save to sessionStorage for backup
			if (browser && value.hasLocation) {
				try {
					sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
						data: value,
						timestamp: Date.now()
					}));
				} catch (error) {
					console.error('Failed to save user location to sessionStorage:', error);
				}
			}
			set(value);
		},
		update
	};
}

export const location = createLocationStore();

// Fetch location from API
export async function fetchLocation() {
	location.update(state => ({ ...state, loading: true, error: null }));

	try {
		const response = await fetch('/api/geolocation');

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		location.set({
			city: data.city || null,
			state: data.state || null,
			latitude: data.latitude || null,
			longitude: data.longitude || null,
			hasLocation: data.hasLocation || false,
			loading: false,
			error: null,
			source: 'auto' // From MaxMind API
		});

		return data;
	} catch (error) {
		console.error('[Location Store] Error fetching location:', error);

		location.set({
			city: null,
			state: null,
			latitude: null,
			longitude: null,
			hasLocation: false,
			loading: false,
			error: error.message
		});

		return { hasLocation: false };
	}
}

// Reset location (useful for testing or user override)
export function resetLocation() {
	location.set(initialState);
}
