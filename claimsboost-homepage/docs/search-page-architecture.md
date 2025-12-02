# Search Page Architecture & QA Guide

## Overview

The search page (`/injury-law-firms`) allows users to search for personal injury law firms by location. It features a complex state management system to handle location data from multiple sources (user geolocation, manual input, URL parameters, and header navigation).

## Key Files

- **Page Component**: `src/routes/injury-law-firms/+page.svelte`
- **Search Bar**: `src/lib/components/SearchBarV2.svelte`
- **Location Autocomplete**: `src/lib/components/LocationAutocomplete.svelte`
- **Location Store**: `src/lib/stores/searchLocationStore.js`
- **User Location Store**: `src/lib/stores/locationStore.js`
- **Geocoding Utility**: `src/lib/utils/geocoding.js`

## State Management

### Critical State Variables in `+page.svelte`

| Variable | Type | Purpose |
|----------|------|---------|
| `locationValue` | string | The text displayed in the location input field |
| `hasManuallyCleared` | boolean | Prevents auto-repopulation after user clears the field |
| `isUserEditing` | boolean | True when user is focused on location input |
| `isClearing` | boolean | Guard flag during clear operations to prevent race conditions |
| `isSearching` | boolean | Guard flag during search to prevent URL sync interference |
| `initialLoadComplete` | boolean | Prevents effects from running before initial page load |

### Location Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Location Data Sources                         │
├─────────────────────────────────────────────────────────────────┤
│  1. User Geolocation ($location store)                          │
│  2. Manual Input (typed in LocationAutocomplete)                │
│  3. URL Parameters (?location=City,State)                       │
│  4. Header Navigation (searchLocation store)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              searchLocationStore ($searchLocation)               │
│  - city, state, zipCode                                         │
│  - latitude, longitude                                          │
│  - formatted address                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    locationValue (local state)                   │
│  - Displayed in the input field                                 │
│  - Synced via $effect() with guards                             │
└─────────────────────────────────────────────────────────────────┘
```

### Key $effect() Behaviors

#### Effect 1: Initial Load (lines 34-46)
- Sets `locationValue` from store on first page load
- Guards: `!initialLoadComplete && !isUserEditing && !hasManuallyCleared`

#### Effect 2: Store Sync (lines 49-57)
- Syncs `locationValue` when `searchLocation` store changes (e.g., header navigation)
- Guards: `initialLoadComplete && !isUserEditing && !hasManuallyCleared && !isClearing`

#### Effect 3: URL Parameter Sync (lines 89-169)
- Handles URL `?location=` parameter changes
- Guards: `!isSearching`, checks `hasManuallyCleared` multiple times during async operations

## Component Hierarchy

```
+page.svelte
└── SearchBarV2.svelte
    └── LocationAutocomplete.svelte
        └── <input> (controlled, one-way binding)
```

### Event Flow (Location Input)

```
User types in input
        │
        ▼
LocationAutocomplete.handleInput()
  - Sets local `value`
  - If empty: dispatch('clear')
  - dispatch('input', { value })
        │
        ▼
SearchBarV2 receives events
  - on:clear → dispatch('clear') to parent
  - on:input → dispatch('locationInput') to parent
        │
        ▼
+page.svelte receives events
  - on:clear → handleLocationClear()
  - on:locationInput → sets isUserEditing, hasManuallyCleared if empty
```

## Common Bugs & Solutions

### Bug 1: Double-Clear Required (FIXED)

**Symptom**: User had to press backspace twice to clear the location field after performing a search.

**Root Cause**: The `<input>` in LocationAutocomplete used `bind:value={value}` which created a two-way binding. When the user pressed backspace:
1. The input value was cleared
2. `handleInput` dispatched the clear event
3. But Svelte's two-way binding synced the old value back from the parent before the clear logic fully propagated

**Solution**: Changed `bind:value={value}` to `value={value}` (one-way binding) in LocationAutocomplete.svelte. This makes the input a controlled component where value changes only happen through our `handleInput` function.

**Key Code** (LocationAutocomplete.svelte):
```svelte
<!-- BEFORE (buggy) -->
<input bind:value={value} on:input={handleInput} />

<!-- AFTER (fixed) -->
<input value={value} on:input={handleInput} />
```

### Bug 2: Location Repopulates After Clear

**Symptom**: After clearing the location field, it would repopulate with the previous location.

**Root Cause**: The `$effect()` that syncs `locationValue` with `$searchLocation` store was running before `hasManuallyCleared` was set.

**Solution**:
1. Set `isClearing = true` FIRST before any state changes
2. Clear the `searchLocation` store BEFORE clearing `locationValue`
3. Use `setTimeout(..., 0)` instead of `queueMicrotask` to ensure all effects have run

**Key Code** (+page.svelte):
```javascript
function handleLocationClear() {
    isClearing = true;  // Guard FIRST
    hasManuallyCleared = true;
    isUserEditing = false;
    searchLocation.clearSearchLocation();  // Clear store FIRST
    locationValue = '';  // Then clear local value
    setTimeout(() => { isClearing = false; }, 0);  // Release guard after effects
}
```

### Bug 3: URL Parameters Override User Input

**Symptom**: When navigating with URL parameters, user's manual input could be overwritten.

**Solution**: Multiple `hasManuallyCleared` checks throughout the async URL processing, with `queueMicrotask` to let clear events propagate first.

## Testing Checklist

### Location Input Tests

- [ ] **Clear via X button**: Click X button should clear field and not repopulate
- [ ] **Clear via keyboard**: Select all (Cmd+A) + Backspace should clear in ONE action
- [ ] **Clear after search**: After performing a search, clearing should work immediately
- [ ] **Type new location**: After clearing, typing a new location should work
- [ ] **Autocomplete selection**: Selecting from dropdown should populate correctly

### Search Flow Tests

- [ ] **Search with zipcode**: Enter 5-digit ZIP, click Search, should geocode and search
- [ ] **Search with city/state**: Enter "City, State", should geocode and search
- [ ] **Search with autocomplete**: Select from dropdown, click Search
- [ ] **Empty location error**: Clear location, click Search, should show error

### Navigation Tests

- [ ] **Header navigation**: Clicking location in header should update search page
- [ ] **URL parameter**: Loading `/injury-law-firms?location=City,State` should search that location
- [ ] **Back button**: Browser back should restore previous search state

### Edge Cases

- [ ] **Rapid typing**: Type quickly, should debounce and not cause race conditions
- [ ] **Focus/blur cycles**: Clicking in and out of input should not cause repopulation
- [ ] **Multiple searches**: Search, change location, search again should work correctly

## Debugging Tips

### Add Console Logs

To debug location state issues, add these logs:

```javascript
$effect(() => {
    console.log('Location state:', {
        locationValue,
        hasManuallyCleared,
        isUserEditing,
        isClearing,
        searchLocation: $searchLocation
    });
});
```

### Check Event Order

In LocationAutocomplete, log the event flow:

```javascript
function handleInput(event) {
    console.log('handleInput:', event.target.value);
    // ... rest of function
}
```

### Verify Store State

Check the searchLocation store in browser console:
```javascript
// In browser console
$searchLocation  // (if using Svelte devtools)
```

## Architecture Decisions

### Why One-Way Binding?

The location input uses one-way `value={value}` instead of `bind:value` because:
1. Multiple sources can update the location (user input, store sync, URL params)
2. Two-way binding creates race conditions when these sources conflict
3. One-way binding gives us explicit control over when and how the value changes

### Why Multiple Guard Flags?

Different operations need different guards:
- `isUserEditing`: Prevents store sync while user is typing
- `hasManuallyCleared`: Prevents any auto-population after user clears
- `isClearing`: Short-lived guard during clear operation to prevent effects
- `isSearching`: Prevents URL sync during active search

### Why setTimeout vs queueMicrotask?

`setTimeout(..., 0)` is used for `isClearing` because:
- It ensures the flag is reset AFTER all synchronous effects have run
- `queueMicrotask` runs before the next render, which may be too early
- The delay ensures proper sequencing of state updates

## Performance Considerations

- Debounce autocomplete requests (150ms in `fetchSuggestions`)
- Minimum skeleton display time (500ms) for better UX
- Limit card animations for large result sets (>20 items)
- Use `will-change` CSS property sparingly for animations
