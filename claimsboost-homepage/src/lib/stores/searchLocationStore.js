import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'claimsboost_search_location';

// Initialize with sessionStorage if available
function getInitialValue() {
	if (browser) {
		try {
			const stored = sessionStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				// Add hasLocation flag based on whether we have coordinates
				return {
					...parsed,
					hasLocation: Boolean(parsed.latitude && parsed.longitude),
					loading: false
				};
			}
		} catch (error) {
			console.error('Failed to load search location from sessionStorage:', error);
		}
	}
	return {
		city: null,
		state: null,
		latitude: null,
		longitude: null,
		zipCode: null,
		hasLocation: false,
		loading: false
	};
}

function createSearchLocationStore() {
	const { subscribe, set, update } = writable(getInitialValue());

	return {
		subscribe,
		set: (value) => {
			// Ensure hasLocation is always set based on coordinates
			const enhancedValue = {
				...value,
				hasLocation: Boolean(value.latitude && value.longitude),
				loading: value.loading ?? false
			};
			if (browser) {
				try {
					sessionStorage.setItem(STORAGE_KEY, JSON.stringify(enhancedValue));
				} catch (error) {
					console.error('Failed to save search location to sessionStorage:', error);
				}
			}
			set(enhancedValue);
		},
		update: (fn) => {
			update((current) => {
				const newValue = fn(current);
				// Ensure hasLocation is always set based on coordinates
				const enhancedValue = {
					...newValue,
					hasLocation: Boolean(newValue.latitude && newValue.longitude),
					loading: newValue.loading ?? false
				};
				if (browser) {
					try {
						sessionStorage.setItem(STORAGE_KEY, JSON.stringify(enhancedValue));
					} catch (error) {
						console.error('Failed to save search location to sessionStorage:', error);
					}
				}
				return enhancedValue;
			});
		},
		setSearchLocation: (location) => {
			const value = {
				city: location.city || null,
				state: location.state || null,
				latitude: location.latitude || null,
				longitude: location.longitude || null,
				zipCode: location.zipCode || null,
				hasLocation: Boolean(location.latitude && location.longitude),
				loading: false
			};
			if (browser) {
				try {
					sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
				} catch (error) {
					console.error('Failed to save search location to sessionStorage:', error);
				}
			}
			set(value);
		},
		clearSearchLocation: () => {
			const emptyValue = {
				city: null,
				state: null,
				latitude: null,
				longitude: null,
				zipCode: null,
				hasLocation: false,
				loading: false
			};
			if (browser) {
				try {
					sessionStorage.removeItem(STORAGE_KEY);
				} catch (error) {
					console.error('Failed to clear search location from sessionStorage:', error);
				}
			}
			set(emptyValue);
		},
		// Helper to check if location is ready to use
		isReady: (current) => {
			return current.hasLocation && !current.loading;
		}
	};
}

export const searchLocation = createSearchLocationStore();
