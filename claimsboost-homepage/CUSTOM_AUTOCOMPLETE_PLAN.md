# Implementation Plan: Custom Google Places Autocomplete UI

## Overview
Replace the current `gmp-place-autocomplete` widget with a custom autocomplete UI using Google Places API's `AutocompleteSuggestion.fetchAutocompleteSuggestions()` method. This gives full control over styling while maintaining Google Maps attribution compliance.

## Changes Required

### File to Modify
- `src/lib/components/LocationAutocomplete.svelte`

### Implementation Steps

1. **Update Imports & Library Loading**
   - Import `AutocompleteSuggestion`, `AutocompleteSessionToken`, and `Place` from Places library
   - Keep existing Google Maps API loader with slight modifications

2. **Replace Widget with Custom Input**
   - Remove `PlaceAutocompleteElement` initialization
   - Create standard HTML input element
   - Add event handlers for input, keydown, focus, blur

3. **Add State Management**
   - Input value tracking
   - Suggestions array
   - Dropdown open/closed state
   - Selected index for keyboard navigation
   - Loading and error states
   - Session token management

4. **Implement Autocomplete Logic**
   - Debounced fetch function (150ms delay)
   - Session token creation and lifecycle
   - API request with US localities restriction
   - Location bias using user location prop
   - Error handling with user-friendly messages

5. **Build Custom Dropdown UI**
   - Suggestions list with styled items
   - Main text (city name) and secondary text (state, country)
   - Hover and keyboard selection states
   - Click handlers for selection

6. **Add Keyboard Navigation**
   - Arrow Up/Down: Navigate suggestions
   - Enter: Select highlighted suggestion
   - Escape: Close dropdown

7. **Implement Place Details Fetching**
   - Convert selected suggestion to Place object
   - Fetch required fields (displayName, formattedAddress, addressComponents, location)
   - Parse address components (city, state, zipCode)
   - Dispatch 'select' event with location data
   - Reset session token after selection

8. **Add Required Google Attribution**
   - Display "Google Maps" text attribution below input
   - Style with Roboto font, 12-14px, gray color (#5E5E5E)
   - Ensure always visible and legible

9. **Add Polish & UX Enhancements**
   - Loading spinner during API calls
   - Clear button when input has value
   - Click-outside-to-close functionality
   - Minimum 3 characters before triggering search
   - Smooth transitions and animations

10. **Maintain Compatibility**
    - Keep same props interface (value, placeholder, userLocation)
    - Keep same events (select, clear)
    - Keep same location data structure
    - No breaking changes for parent component

## Benefits
- ✅ Full control over UI styling
- ✅ Removes Google branding from dropdown (legally compliant)
- ✅ Better performance with debouncing
- ✅ Cost optimization with session tokens
- ✅ Improved accessibility
- ✅ Consistent with your design system

## Compliance
- Display "Google Maps" attribution text (meets ToS Section 9.4)
- Session token usage for optimal billing
- Proper field mask to request only needed data

## Testing Required
- Test autocomplete on mobile and desktop viewports
- Verify keyboard navigation works
- Test with various city names
- Verify location data is dispatched correctly
- Confirm attribution is visible and compliant

## Detailed Implementation Reference

### Complete Example Code Structure

```javascript
// Key components of the implementation:

// 1. Load Places library
const { Place, AutocompleteSessionToken, AutocompleteSuggestion } =
  await google.maps.importLibrary("places");

// 2. Create session token
let sessionToken = new AutocompleteSessionToken();

// 3. Fetch suggestions (with debouncing)
const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
  input: userInput,
  includedPrimaryTypes: ['locality'],
  includedRegionCodes: ['us'],
  sessionToken,
  locationBias: {
    circle: {
      center: { latitude: userLat, longitude: userLng },
      radius: 50000
    }
  }
});

// 4. Handle selection
const place = suggestion.placePrediction.toPlace();
await place.fetchFields({
  fields: ['displayName', 'formattedAddress', 'addressComponents', 'location']
});

// 5. Reset session after selection
sessionToken = null;
```

## Resources
- [Google Places Autocomplete Documentation](https://developers.google.com/maps/documentation/javascript/place-autocomplete)
- [AutocompleteSuggestion Reference](https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompleteSuggestion)
- [Attribution Requirements](https://developers.google.com/maps/documentation/places/web-service/policies#logo_requirements)
- [Session Tokens Guide](https://developers.google.com/maps/documentation/places/web-service/session-tokens)
