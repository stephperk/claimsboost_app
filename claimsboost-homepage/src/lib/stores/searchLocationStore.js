import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'claimsboost_search_location';

// Initialize with sessionStorage if available
function getInitialValue() {
	if (browser) {
		try {
			const stored = sessionStorage.getItem(STORAGE_KEY);
			if (stored) {
				return JSON.parse(stored);
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
		zipCode: null
	};
}

function createSearchLocationStore() {
	const { subscribe, set, update } = writable(getInitialValue());

	return {
		subscribe,
		set: (value) => {
			if (browser) {
				try {
					sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
				} catch (error) {
					console.error('Failed to save search location to sessionStorage:', error);
				}
			}
			set(value);
		},
		update: (fn) => {
			update((current) => {
				const newValue = fn(current);
				if (browser) {
					try {
						sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newValue));
					} catch (error) {
						console.error('Failed to save search location to sessionStorage:', error);
					}
				}
				return newValue;
			});
		},
		setSearchLocation: (location) => {
			const value = {
				city: location.city || null,
				state: location.state || null,
				latitude: location.latitude || null,
				longitude: location.longitude || null,
				zipCode: location.zipCode || null
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
				zipCode: null
			};
			if (browser) {
				try {
					sessionStorage.removeItem(STORAGE_KEY);
				} catch (error) {
					console.error('Failed to clear search location from sessionStorage:', error);
				}
			}
			set(emptyValue);
		}
	};
}

export const searchLocation = createSearchLocationStore();
