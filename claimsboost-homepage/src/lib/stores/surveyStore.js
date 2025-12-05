import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'claimsboost_survey_responses';

// Initialize from sessionStorage if available
function createSurveyStore() {
	let initialValue = {
		injuryType: '',
		timeframe: '',
		medicalTreatment: '',
		fault: '',
		severity: '',
		firstName: '',
		lastName: '',
		email: '',
		phone: ''
	};

	// Load from sessionStorage if in browser
	if (browser) {
		const stored = sessionStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				initialValue = JSON.parse(stored);
			} catch (e) {
				console.error('Failed to parse stored survey data:', e);
			}
		}
	}

	const { subscribe, set, update } = writable(initialValue);

	return {
		subscribe,
		set: (value) => {
			if (browser) {
				sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
			}
			set(value);
		},
		update: (fn) => {
			update((current) => {
				const newValue = fn(current);
				if (browser) {
					sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newValue));
				}
				return newValue;
			});
		},
		clear: () => {
			if (browser) {
				sessionStorage.removeItem(STORAGE_KEY);
			}
			set({
				injuryType: '',
				timeframe: '',
				medicalTreatment: '',
				fault: '',
				severity: '',
				firstName: '',
				lastName: '',
				email: '',
				phone: ''
			});
		}
	};
}

export const surveyResponses = createSurveyStore();
