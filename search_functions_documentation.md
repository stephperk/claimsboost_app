# Law Firm Search Functions - API Documentation

## Overview
There are 3 search functions available in the database, ordered from fastest to most feature-rich.

## Function 1: Ultra-Fast Search (Homepage)
**Function Name:** `search_law_firms_nearby_ultra_fast`
**Response Time:** ~60-80ms
**Best For:** Initial search results, homepage carousel, autocomplete, map markers
**Used On:** Home page law firms carousel (`/api/law-firms/nearby`)

### Parameters:
- `user_lat` (DECIMAL, required) - User's latitude
- `user_lng` (DECIMAL, required) - User's longitude
- `radius_miles` (INTEGER, default: 50) - Search radius in miles
- `min_rating` (DECIMAL, optional) - Minimum rating filter (e.g., 4.0)
- `min_reviews` (INTEGER, optional) - Minimum review count filter (e.g., 10)
- `limit_results` (INTEGER, default: 20) - Maximum results to return

### Returns:
- `place_id` - Google Place ID (unique identifier)
- `firm_name` - Law firm name
- `slug` - URL-friendly identifier for firm profile pages
- `distance_miles` - Distance from user in miles
- `city` - City name
- `state` - State abbreviation
- `rating` - Google rating (1.0-5.0)
- `review_count` - Number of Google reviews
- `quality_score` - Pre-calculated quality score (0-3)
- `practice_areas` - Array of practice area strings
- `short_description` - Brief description text

### Example Query:
```sql
SELECT * FROM search_law_firms_nearby_ultra_fast(
  40.7128,   -- NYC latitude
  -74.0060,  -- NYC longitude
  25,        -- 25 mile radius
  4.0,       -- minimum 4.0 rating
  10,        -- minimum 10 reviews
  20         -- return up to 20 results
);
```

### Implementation Notes:
- Home page uses automatic radius expansion: 50 → 100 → 150 → 200 miles
- Quality score filtering prioritizes firms with scores 2-3, includes 1 if needed
- Returns top 4 firms sorted by quality score DESC, then distance ASC

---

## Function 2: Fast Search with Full Details (Search Page)
**Function Name:** `search_law_firms_nearby_fast`
**Response Time:** ~130-150ms
**Best For:** Detailed results page when you need all information
**Used On:** Search results page (`/api/law-firms/search`)

### Parameters:
- `user_lat` (DECIMAL, required) - User's latitude
- `user_lng` (DECIMAL, required) - User's longitude
- `radius_miles` (INTEGER, default: 50) - Search radius in miles
- `practice_area_filter` (TEXT, optional) - Comma-separated practice areas (e.g., "Auto Accidents,Slip & Fall")
- `limit_results` (INTEGER, default: 20) - Maximum results to return

### Returns:
**Basic Information:**
- `place_id` - Google Place ID (unique identifier)
- `firm_name` - Law firm name
- `slug` - URL-friendly identifier
- `distance_miles` - Distance from user in miles
- `address` - Full formatted address
- `city` - City name
- `state` - State abbreviation
- `phone` - Phone number
- `website` - Website URL

**Ratings & Quality:**
- `rating` - Google rating (1.0-5.0)
- `review_count` - Number of Google reviews
- `quality_score` - Pre-calculated quality score (0-3)
- `rating_display` - Pre-formatted string like "4.8 (125 reviews)"

**Practice Areas & Descriptions:**
- `practice_areas` - Array of practice area strings
- `short_description` - Brief description for cards/previews
- `long_description` - Detailed description for profile pages

**Firm Statistics:**
- `total_recovered` - Total amount recovered (bigint)
- `cases_won` - Number of cases won (integer)
- `year_founded` - Year the firm was established (integer)
- `clients_served` - Number of clients served (integer)

**Additional Details:**
- `short_facts` - Array of short fact strings for quick highlights
- `long_facts` - Array of detailed fact strings
- `is_personal_injury_firm` - Boolean indicating if verified PI firm

### Example Query:
```sql
SELECT * FROM search_law_firms_nearby_fast(
  40.7128,                      -- NYC latitude
  -74.0060,                     -- NYC longitude
  25,                           -- 25 mile radius
  'Auto Accidents,Slip & Fall', -- practice area filter
  50                            -- return up to 50 results
);
```

### Implementation Notes:
- Search page fetches 200 results for client-side filtering
- Supports practice area filtering via comma-separated string
- Client-side rating filter applied after database query
- Three sort options: relevance (quality + distance), rating, distance
- Practice area filter is **ACTIVE** (not "coming soon")

---

## Function 3: Base Search with Business Hours
**Function Name:** `search_law_firms_nearby`
**Response Time:** ~150-180ms
**Best For:** When you need real-time business hours status
**Currently:** Not actively used in production

### Parameters:
- `user_lat` (DECIMAL, required) - User's latitude
- `user_lng` (DECIMAL, required) - User's longitude
- `radius_miles` (INTEGER, default: 50) - Search radius in miles
- `practice_area_filter` (TEXT, optional) - Practice area filter
- `limit_results` (INTEGER, default: 20) - Maximum results to return

### Returns:
Same as `search_law_firms_nearby_fast` plus:
- `is_open_now` - Boolean indicating current business hours status

### Example Query:
```sql
SELECT * FROM search_law_firms_nearby(
  40.7128,   -- NYC latitude
  -74.0060,  -- NYC longitude
  25,        -- 25 mile radius
  NULL,      -- no practice area filter
  20         -- return up to 20 results
);
```

---

## Quality Score Explanation
- **3** = Premium (rating ≥ 4.5 AND reviews ≥ 50)
- **2** = Good (rating ≥ 4.0 AND reviews ≥ 20)
- **1** = Standard (rating ≥ 3.5)
- **0** = Basic (rating < 3.5 or few reviews)

---

## Important Notes

### Coordinates Format
- Latitude: -90 to 90 (negative = South)
- Longitude: -180 to 180 (negative = West)
- Example: New York City = (40.7128, -74.0060)

### Distance Calculation
- Uses actual geographic distance (not driving distance)
- Accurate within ~1% for distances under 500 miles
- Returns results sorted by distance (closest first)

### Performance Tips
1. Use `ultra_fast` for homepage/initial page load (carousel, quick previews)
2. Use `fast` for search results page with detailed information
3. Use base `search_law_firms_nearby` only when business hours status is critical
4. Smaller radius = faster results
5. Add rating/review filters to reduce result set

### Practice Area Filtering
- **Status:** ✅ ACTIVE (implemented and working)
- Pass comma-separated string: `"Auto Accidents,Medical Malpractice,Wrongful Death"`
- Case-sensitive matching
- Empty string or NULL returns all firms

### Available Practice Areas
Common practice areas in the system:
- Auto Accidents
- Workplace Injury
- Slip & Fall
- Medical Malpractice
- Product Liability
- Dog Bites
- Wrongful Death
- Brain Injury
- Personal Injury (general)

### Data Transformations
When displaying to users, consider:
- **Years of Experience:** `currentYear - year_founded`
- **Amount Recovered Display:**
  - ≥ $1B: Display as "$XB+ Recovered"
  - ≥ $1M: Display as "$XM+ Recovered"
- **Slug URLs:** `/injury-law-firms/{state}/{city}/{slug}`

---

## API Endpoint Summary

### `/api/law-firms/nearby` (Homepage)
- Function: `search_law_firms_nearby_ultra_fast`
- Returns: 4 firms max
- Features: Radius expansion, quality filtering
- Query params: `lat`, `lng`, `radius` (optional)

### `/api/law-firms/search` (Search Page)
- Function: `search_law_firms_nearby_fast`
- Returns: Up to 50 firms
- Features: Practice area filter, rating filter, sorting
- Query params: `lat`, `lng`, `radius`, `practice_areas`, `min_rating`, `sort_by`, `limit`
