# Law Firm Search Functions - API Documentation

## Overview
There are 2 main search functions available in the database, ordered from fastest to most feature-rich.

## Function 1: Ultra-Fast Search (Recommended for initial results)
**Function Name:** `search_law_firms_nearby_ultra_fast`
**Response Time:** ~60-80ms
**Best For:** Initial search results, autocomplete, map markers

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
- `distance_miles` - Distance from user in miles
- `city` - City name
- `state` - State abbreviation
- `rating` - Google rating (1.0-5.0)
- `review_count` - Number of Google reviews
- `quality_score` - Pre-calculated quality score (0-3)

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

## Function 2: Fast Search with Full Details
**Function Name:** `search_law_firms_nearby_fast`
**Response Time:** ~130-150ms
**Best For:** Detailed results page, when you need all information

### Parameters:
- `user_lat` (DECIMAL, required) - User's latitude
- `user_lng` (DECIMAL, required) - User's longitude
- `radius_miles` (INTEGER, default: 50) - Search radius in miles
- `practice_area_filter` (TEXT, optional) - Future: filter by practice area
- `limit_results` (INTEGER, default: 20) - Maximum results to return

### Returns:
- `place_id` - Google Place ID (unique identifier)
- `firm_name` - Law firm name
- `distance_miles` - Distance from user in miles
- `address` - Full formatted address
- `phone` - Phone number
- `website` - Website URL
- `rating` - Google rating (1.0-5.0)
- `review_count` - Number of Google reviews
- `quality_score` - Pre-calculated quality score (0-3)
- `rating_display` - Pre-formatted string like "4.8 (125 reviews)"

### Example Query:
```sql
SELECT * FROM search_law_firms_nearby_fast(
  40.7128,   -- NYC latitude
  -74.0060,  -- NYC longitude
  25,        -- 25 mile radius
  NULL,      -- no practice area filter yet
  20         -- return up to 20 results
);
```

## Quality Score Explanation
- **3** = Premium (rating ≥ 4.5 AND reviews ≥ 50)
- **2** = Good (rating ≥ 4.0 AND reviews ≥ 20)
- **1** = Standard (rating ≥ 3.5)
- **0** = Basic (rating < 3.5 or few reviews)

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
1. Use `ultra_fast` for initial page load
2. Use `fast` only when user needs detailed information
3. Smaller radius = faster results
4. Add rating/review filters to reduce result set

### Missing Features (Coming Soon)
- Practice area filtering (personal injury, medical malpractice, etc.)
- Business hours calculation (currently returns NULL)
- Driving distance/time via routing API