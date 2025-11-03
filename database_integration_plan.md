# Database Integration Plan: verified_law_firms → Frontend

## Overview

This document outlines the plan to connect the `verified_law_firms` database table to the ClaimsBoost SvelteKit frontend application.

### Current State

- **Frontend**: SvelteKit 2.x + Svelte 5 application
- **Location**: `~/Projects/claimsboost.com/claimsboost_app/claimsboost-homepage`
- **Database**: Supabase PostgreSQL (claimsboost_dev project)
- **Data**: 1,289 verified law firms with spatial indexes and optimized search functions
- **Status**: Search UI complete with mock data, no database connection exists

### Tech Stack

- **Framework**: SvelteKit 2.22.0 with Svelte 5.0
- **Database**: Supabase (PostgreSQL 17)
- **Client Library**: @supabase/supabase-js (to be installed)
- **Architecture**: Hybrid server/client rendering

---

## Database Assets Available

### Tables
- **`verified_law_firms`** - Main table with 1,289 law firms
  - Columns: name, domain, lat/lng, location_point, address fields, phone, website, rating, reviews, business hours, practice areas
  - Primary key: `google_place_id`
  - Row Level Security enabled (public read access)

- **`law_firm_search_view`** - Materialized view with pre-calculated quality scores
  - Optimized for fast queries with additional indexes

### Search Functions

1. **`search_law_firms_nearby(lat, lng, radius, practice_area, limit)`**
   - Standard proximity search with opening hours calculation
   - Returns: full firm details + is_open_now status
   - Performance: ~150-200ms

2. **`search_law_firms_nearby_fast(lat, lng, radius, practice_area, limit)`**
   - Uses materialized view with bounding box optimization
   - Returns: firm details + quality_score + rating_display
   - Performance: ~130-150ms

3. **`search_law_firms_nearby_ultra_fast(lat, lng, radius, min_rating, min_reviews, limit)`**
   - Fastest search without opening hours calculation
   - Uses lat/lng indexes with bounding box pre-filter
   - Returns: essential firm info + quality_score
   - Performance: ~60-80ms

### Helper Functions

- **`check_if_open(opening_hours, utc_offset)`** - Calculates if business is currently open
- **`refresh_verified_law_firms()`** - Syncs data from places/domain_extractions tables

---

## Phase 1: Environment & Dependencies Setup

### 1.1 Install Supabase Client

```bash
cd ~/Projects/claimsboost.com/claimsboost_app/claimsboost-homepage
npm install @supabase/supabase-js
```

### 1.2 Environment Configuration

Create `.env` file in project root:

```env
# Public keys (exposed to browser)
PUBLIC_SUPABASE_URL=https://eaqsybrymavpwmdhmlxk.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Private keys (server-side only)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

> **Note**: Get these keys from Supabase dashboard → Settings → API

### 1.3 Create Supabase Client Utilities

**File: `src/lib/supabaseClient.js`** (Client-side)
```javascript
import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)
```

**File: `src/lib/supabaseServer.js`** (Server-side)
```javascript
import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL } from '$env/static/public'
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private'

export const supabaseServer = createClient(
  PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

---

## Phase 2: Server-Side API Routes (SSR)

### 2.1 Create Search API Route

**File: `src/routes/api/law-firms/search/+server.js`**

```javascript
import { json } from '@sveltejs/kit'
import { supabaseServer } from '$lib/supabaseServer'

export async function GET({ url }) {
  const lat = parseFloat(url.searchParams.get('lat'))
  const lng = parseFloat(url.searchParams.get('lng'))
  const radius = parseInt(url.searchParams.get('radius') || '50')
  const practiceArea = url.searchParams.get('practice_area') || null
  const minRating = parseFloat(url.searchParams.get('min_rating')) || null
  const minReviews = parseInt(url.searchParams.get('min_reviews')) || null
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const sortBy = url.searchParams.get('sort') || 'relevance'

  // Validate required params
  if (isNaN(lat) || isNaN(lng)) {
    return json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  try {
    // Call the ultra-fast search function
    const { data, error } = await supabaseServer.rpc(
      'search_law_firms_nearby_ultra_fast',
      {
        user_lat: lat,
        user_lng: lng,
        radius_miles: radius,
        min_rating: minRating,
        min_reviews: minReviews,
        limit_results: limit
      }
    )

    if (error) throw error

    // Apply practice area filter if needed (client-side filter)
    let results = data
    if (practiceArea) {
      results = data.filter(firm =>
        firm.practice_areas && firm.practice_areas.includes(practiceArea)
      )
    }

    // Apply sorting
    if (sortBy === 'rating') {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    } else if (sortBy === 'distance') {
      results.sort((a, b) => a.distance_miles - b.distance_miles)
    }
    // Default 'relevance' is already sorted by quality_score in the function

    return json({
      firms: results,
      count: results.length
    })
  } catch (error) {
    console.error('Search error:', error)
    return json({ error: error.message }, { status: 500 })
  }
}
```

### 2.2 Create Page Load Function

**File: `src/routes/search/+page.server.js`**

```javascript
export async function load({ url, fetch }) {
  // Default to Raleigh, NC coordinates
  const defaultLat = 35.7796
  const defaultLng = -78.6382

  const lat = url.searchParams.get('lat') || defaultLat
  const lng = url.searchParams.get('lng') || defaultLng
  const radius = url.searchParams.get('radius') || '50'

  try {
    const response = await fetch(
      `/api/law-firms/search?lat=${lat}&lng=${lng}&radius=${radius}`
    )

    const data = await response.json()

    return {
      firms: data.firms || [],
      initialLocation: { lat: parseFloat(lat), lng: parseFloat(lng) },
      searchParams: { radius: parseInt(radius) }
    }
  } catch (error) {
    console.error('Failed to load firms:', error)
    return {
      firms: [],
      initialLocation: { lat: defaultLat, lng: defaultLng },
      searchParams: { radius: 50 },
      error: 'Failed to load law firms'
    }
  }
}
```

---

## Phase 3: Client-Side Dynamic Features

### 3.1 Geocoding Integration

Add geocoding to convert location strings (e.g., "Raleigh, NC") to coordinates:

**Option A: Google Maps Geocoding API**
```javascript
async function geocodeLocation(locationString) {
  const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationString)}&key=${apiKey}`

  const response = await fetch(url)
  const data = await response.json()

  if (data.results && data.results.length > 0) {
    const { lat, lng } = data.results[0].geometry.location
    return { lat, lng }
  }

  throw new Error('Location not found')
}
```

**Option B: Nominatim (Free, OpenStreetMap)**
```javascript
async function geocodeLocation(locationString) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationString)}&format=json&limit=1`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ClaimsBoost/1.0'
    }
  })
  const data = await response.json()

  if (data && data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    }
  }

  throw new Error('Location not found')
}
```

### 3.2 Update Search Page Component

**File: `src/routes/search/+page.svelte`** (Modifications)

Replace the mock data section with:

```javascript
<script>
  import { supabase } from '$lib/supabaseClient'

  // Data from server load function
  export let data

  // State
  let lawFirms = $state(data.firms || [])
  let isLoading = $state(false)
  let userCoords = $state(data.initialLocation)

  // ... (keep existing filter/sort state) ...

  // Debounced search function
  let searchTimeout
  async function performSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(async () => {
      isLoading = true

      try {
        const params = new URLSearchParams({
          lat: userCoords.lat,
          lng: userCoords.lng,
          radius: radius || 50,
          sort: sortBy
        })

        if (selectedRating > 0) {
          params.append('min_rating', selectedRating)
        }

        const response = await fetch(`/api/law-firms/search?${params}`)
        const result = await response.json()

        // Apply practice area filters client-side
        let filtered = result.firms
        if (selectedPracticeAreas.length > 0) {
          filtered = filtered.filter(firm =>
            firm.practice_areas &&
            selectedPracticeAreas.some(area => firm.practice_areas.includes(area))
          )
        }

        lawFirms = filtered
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        isLoading = false
      }
    }, 300) // 300ms debounce
  }

  // Handle location search
  async function handleSearch(e) {
    e.preventDefault()

    // Geocode the location string
    try {
      const coords = await geocodeLocation(location)
      userCoords = coords
      await performSearch()
    } catch (error) {
      console.error('Geocoding failed:', error)
      // Keep current location
    }
  }

  // Trigger search when filters change
  $effect(() => {
    if (selectedPracticeAreas || selectedRating || sortBy) {
      performSearch()
    }
  })
</script>

<!-- Add loading state to UI -->
{#if isLoading}
  <div class="loading-overlay">
    <div class="spinner"></div>
  </div>
{/if}

<!-- Update results grid to show count -->
<div class="results-header">
  <p class="subtitle">{lawFirms.length} law firms ready to help with your case</p>
</div>
```

---

## Phase 4: Feature Implementation

### 4.1 Location-Based Search

- ✅ User types city/state → geocode to coordinates
- ✅ Query database with lat/lng + radius (default 50 miles)
- ✅ Display distance in results (already in database response)
- ✅ Sort by proximity (default behavior of search functions)

### 4.2 Practice Area Filtering

The database has a `practice_areas` TEXT[] column. Implement multi-select filter:

```javascript
// In search API route or client-side
function filterByPracticeAreas(firms, selectedAreas) {
  if (!selectedAreas || selectedAreas.length === 0) {
    return firms
  }

  return firms.filter(firm => {
    if (!firm.practice_areas) return false
    return selectedAreas.some(area => firm.practice_areas.includes(area))
  })
}
```

**Note**: Currently practice_areas may be empty. Plan to populate with AI extraction separately.

### 4.3 Rating & Review Filters

- Use `min_rating` and `min_reviews` params in ultra_fast search function
- Filter UI already exists in search page
- Pass to API route as query params

### 4.4 "Open Now" Status

For "Open Now" badge, use the slower search function or calculate client-side:

```javascript
// Option 1: Use search_law_firms_nearby (includes is_open_now)
const { data } = await supabase.rpc('search_law_firms_nearby', {
  user_lat: lat,
  user_lng: lng,
  radius_miles: radius,
  practice_area_filter: practiceArea,
  limit_results: limit
})

// Option 2: Calculate client-side
function isOpenNow(openingHours, utcOffsetMinutes) {
  if (!openingHours || !openingHours.periods) return null

  const now = new Date()
  const localTime = new Date(now.getTime() + (utcOffsetMinutes * 60 * 1000))
  const day = localTime.getUTCDay()
  const time = localTime.getUTCHours() * 100 + localTime.getUTCMinutes()

  for (const period of openingHours.periods) {
    if (period.open.day === day) {
      const openTime = period.open.hour * 100 + (period.open.minute || 0)
      const closeTime = period.close.hour * 100 + (period.close.minute || 0)

      if (time >= openTime && time <= closeTime) {
        return true
      }
    }
  }

  return false
}
```

### 4.5 Sorting Options

Three sort modes (already in UI):

1. **Relevance** (default) - Uses `quality_score` from database
   - Pre-calculated in materialized view
   - Based on rating + review count thresholds

2. **Rating** - Sort by rating DESC
   ```javascript
   results.sort((a, b) => (b.rating || 0) - (a.rating || 0))
   ```

3. **Distance** - Sort by distance_miles ASC
   ```javascript
   results.sort((a, b) => a.distance_miles - b.distance_miles)
   ```

---

## Phase 5: Optimization & Polish

### 5.1 Performance Optimizations

- ✅ Use `search_law_firms_nearby_ultra_fast` for most queries (~60-80ms)
- ✅ Debounce search input (300ms)
- ✅ Server-side rendering for initial page load (SEO + speed)
- Consider caching geocoding results in localStorage
- Add pagination if result sets exceed 50 firms

### 5.2 Error Handling

```javascript
// Graceful fallback for geolocation
async function getUserLocation() {
  try {
    // Try IP-based geolocation (already implemented)
    const response = await fetch('https://ipapi.co/json/')
    const data = await response.json()
    return {
      lat: data.latitude,
      lng: data.longitude,
      city: data.city,
      state: data.region_code
    }
  } catch (error) {
    // Fallback to default location (Raleigh, NC)
    return {
      lat: 35.7796,
      lng: -78.6382,
      city: 'Raleigh',
      state: 'NC'
    }
  }
}
```

### 5.3 Loading States

Add to search page:

```html
<!-- Loading overlay -->
{#if isLoading}
  <div class="loading-overlay">
    <div class="spinner"></div>
  </div>
{/if}

<!-- Or skeleton loaders -->
{#if isLoading}
  {#each Array(6) as _, i}
    <div class="firm-card skeleton">
      <div class="skeleton-header"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text"></div>
    </div>
  {/each}
{/if}
```

---

## Implementation Checklist

### Phase 1: Setup (Est. 30 min)
- [ ] Install @supabase/supabase-js
- [ ] Create .env file with Supabase credentials
- [ ] Create src/lib/supabaseClient.js
- [ ] Create src/lib/supabaseServer.js
- [ ] Test connection to database

### Phase 2: Server API (Est. 45 min)
- [ ] Create src/routes/api/law-firms/search/+server.js
- [ ] Create src/routes/search/+page.server.js
- [ ] Test API route returns data
- [ ] Verify SSR loads initial data

### Phase 3: Basic Search (Est. 1 hour)
- [ ] Update search page to use real data
- [ ] Remove mock lawFirms array
- [ ] Add client-side search function
- [ ] Test location-based search works

### Phase 4: Geocoding (Est. 30 min)
- [ ] Add geocoding utility function
- [ ] Integrate with search form
- [ ] Handle geocoding errors gracefully
- [ ] Test various location formats

### Phase 5: Filters (Est. 1 hour)
- [ ] Connect practice area filter
- [ ] Connect rating filter
- [ ] Add "Open Now" calculation (optional)
- [ ] Test filter combinations

### Phase 6: Sorting (Est. 30 min)
- [ ] Implement relevance sort (default)
- [ ] Implement rating sort
- [ ] Implement distance sort
- [ ] Test sort persistence

### Phase 7: Polish (Est. 1 hour)
- [ ] Add loading states/spinners
- [ ] Add error messages for failed searches
- [ ] Optimize debounce timing
- [ ] Test on mobile devices
- [ ] Performance audit

**Total Estimated Time: ~5.5 hours**

---

## File Structure

```
claimsboost_app/claimsboost-homepage/
├── .env                                    # NEW: Environment variables
├── src/
│   ├── lib/
│   │   ├── supabaseClient.js              # NEW: Client-side Supabase
│   │   ├── supabaseServer.js              # NEW: Server-side Supabase
│   │   └── utils/
│   │       └── geocoding.js               # NEW: Geocoding utilities
│   └── routes/
│       ├── api/
│       │   └── law-firms/
│       │       └── search/
│       │           └── +server.js         # NEW: Search API endpoint
│       └── search/
│           ├── +page.svelte               # MODIFIED: Connect to API
│           └── +page.server.js            # NEW: SSR data loading
```

---

## Database Query Examples

### Direct Supabase RPC Call

```javascript
// Ultra-fast proximity search
const { data, error } = await supabase.rpc('search_law_firms_nearby_ultra_fast', {
  user_lat: 35.7796,
  user_lng: -78.6382,
  radius_miles: 50,
  min_rating: 4.0,
  min_reviews: 20,
  limit_results: 20
})

// Results format:
// [
//   {
//     place_id: "ChIJ...",
//     firm_name: "Miller & Associates",
//     distance_miles: 2.3,
//     city: "Raleigh",
//     state: "NC",
//     rating: 4.8,
//     review_count: 234,
//     quality_score: 3
//   },
//   ...
// ]
```

### Alternative: Direct Table Query

```javascript
// Query the table directly (less optimized)
const { data, error } = await supabase
  .from('verified_law_firms')
  .select('*')
  .eq('business_status', 'OPERATIONAL')
  .gte('rating', 4.0)
  .limit(20)

// Note: This doesn't include distance calculation or spatial filtering
```

---

## Testing Strategy

### Unit Tests
- Geocoding utility functions
- Search result filtering/sorting logic
- Data transformation functions

### Integration Tests
- API route returns correct data
- Server load function works
- Client-side search triggers correctly

### Manual Testing Checklist
- [ ] Search by city name
- [ ] Search by zip code
- [ ] Filter by practice area
- [ ] Filter by rating
- [ ] Sort by relevance/rating/distance
- [ ] Mobile responsiveness
- [ ] Loading states appear
- [ ] Error messages display correctly
- [ ] "Open now" badge accuracy

---

## Future Enhancements

### Short Term
- Add individual firm detail pages (`/firm/[id]/+page.svelte`)
- Implement "Connect" button functionality
- Add map view with firm markers
- Cache geocoding results

### Medium Term
- Real-time updates using Supabase subscriptions
- Saved searches / favorite firms
- User reviews and ratings
- Practice area extraction and population

### Long Term
- Predictive search with autocomplete
- Advanced filters (years of experience, settlement amounts)
- Firm comparison tool
- Lead generation and tracking

---

## Support & Troubleshooting

### Common Issues

**Issue**: "Cannot find module '@supabase/supabase-js'"
- **Fix**: Run `npm install` after adding to package.json

**Issue**: Environment variables not loading
- **Fix**: Ensure .env is in project root, restart dev server

**Issue**: RLS policy blocks queries
- **Fix**: Verify public read policy is enabled on verified_law_firms table

**Issue**: Search returns no results
- **Fix**: Check coordinates are valid, verify radius isn't too small

**Issue**: "TypeError: supabase.rpc is not a function"
- **Fix**: Ensure using correct Supabase client (server vs client)

### Useful Supabase Queries for Debugging

```sql
-- Check if functions exist
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE 'search_law_firms%';

-- Check table data
SELECT COUNT(*) FROM verified_law_firms WHERE business_status = 'OPERATIONAL';

-- Test search function manually
SELECT * FROM search_law_firms_nearby_ultra_fast(35.7796, -78.6382, 50, NULL, NULL, 5);

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'verified_law_firms';
```

---

## Contact & Resources

- **Supabase Dashboard**: https://supabase.com/dashboard/project/eaqsybrymavpwmdhmlxk
- **Project ID**: eaqsybrymavpwmdhmlxk
- **Database**: claimsboost_dev
- **Supabase Docs**: https://supabase.com/docs/reference/javascript/introduction
- **SvelteKit Docs**: https://kit.svelte.dev/docs

---

**Last Updated**: October 24, 2025
**Status**: Ready for Implementation
