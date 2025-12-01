# SEO Pages Implementation Plan

## Overview

Generate 673 SEO-optimized pages for law firm practice areas using the taxonomy data from `practice_area_taxonomy` table.

## Page Breakdown

### Total Pages: ~673
- **17 Category Pages** (Level 1)
- **115 Subcategory Pages** (Level 2)
- **541 Keyword Pages** (Level 3)

### Example Hierarchy
```
/practice-areas/vehicle-accidents
  └─ /practice-areas/vehicle-accidents/commercial-truck
      └─ /practice-areas/vehicle-accidents/commercial-truck/18-wheeler-accidents
```

---

## Phase 1: Data Preparation

### 1.1 Audit Display Keywords
**Task**: Check for duplicate or conflicting display keywords

```sql
-- Find display keywords that map to multiple canonical practice areas
SELECT
  practice_area_display_keyword,
  COUNT(DISTINCT canonical_practice_area) as canonical_count,
  ARRAY_AGG(DISTINCT canonical_practice_area) as canonicals
FROM practice_area_taxonomy
WHERE practice_area_display_keyword IS NOT NULL
GROUP BY practice_area_display_keyword
HAVING COUNT(DISTINCT canonical_practice_area) > 1
ORDER BY canonical_count DESC;
```

**Expected Issues**:
- "Catastrophic Injuries" maps to both "catastrophic injuries" and "catastrophic injury"
- "Assault & Battery" maps to both "assault" and "assault and battery"

**Resolution**: These are OK - same display keyword, similar canonical is intentional consolidation.

### 1.2 Generate URL Slugs
**Task**: Create slug generation utility

**Rules**:
- Lowercase all text
- Replace `&` with `and`
- Replace spaces with hyphens
- Remove special characters except hyphens
- Handle numbers (e.g., "18-wheeler" stays as "18-wheeler")

**Examples**:
```javascript
"18-Wheeler Accidents" → "18-wheeler-accidents"
"Slip & Fall" → "slip-and-fall"
"Camp Lejeune Water Contamination" → "camp-lejeune-water-contamination"
"Assault & Battery" → "assault-and-battery"
```

**Implementation**: `src/lib/utils/slugify.js`

### 1.3 Build Page Index
**Task**: Query database and generate complete page manifest

```sql
-- Generate page index for all 673 pages
SELECT
  primary_category,
  sub_category,
  practice_area_display_keyword,
  canonical_practice_area,
  COUNT(DISTINCT law_firm_id) as firm_count,
  COUNT(*) as total_practice_areas,
  AVG(classification_confidence) as avg_confidence
FROM practice_area_taxonomy
WHERE practice_area_display_keyword IS NOT NULL
  AND classification_confidence >= 70
GROUP BY 1, 2, 3, 4
ORDER BY firm_count DESC;
```

**Output**: `output/seo_page_manifest.json`

---

## Phase 2: Route Structure

### 2.1 SvelteKit Route Files

Create these route files:

```
src/routes/practice-areas/
├── +page.svelte                                      # Landing page (all categories)
├── +page.server.js                                   # Load all categories
├── [category]/
│   ├── +page.svelte                                  # Category page
│   ├── +page.server.js                               # Load category data
│   └── [subcategory]/
│       ├── +page.svelte                              # Subcategory page
│       ├── +page.server.js                           # Load subcategory data
│       └── [keyword]/
│           ├── +page.svelte                          # Keyword page
│           └── +page.server.js                       # Load keyword data
```

### 2.2 Static Generation Strategy

**Option A: Full Static Generation (Recommended)**
- Pre-render all 673 pages at build time
- Fast page loads, excellent SEO
- 5-10 minute build time
- Use SvelteKit's `prerender = true` and `entries()` function

**Option B: Hybrid (Category/Subcategory static, Keywords dynamic)**
- Pre-render 132 pages (17 categories + 115 subcategories)
- Generate 541 keyword pages on-demand
- Faster builds, slightly slower first load
- Cache keyword pages after first request

**Recommendation**: Start with **Option A**, move to Option B if build times become problematic.

---

## Phase 3: Page Implementation

### 3.1 Level 1: Category Pages (17 pages)

**URL Pattern**: `/practice-areas/vehicle-accidents`

**Data to Load**:
```sql
-- Category overview
SELECT
  primary_category,
  COUNT(DISTINCT sub_category) as subcategory_count,
  COUNT(DISTINCT practice_area_display_keyword) as keyword_count,
  COUNT(DISTINCT law_firm_id) as firm_count
FROM practice_area_taxonomy
WHERE primary_category = $1
  AND classification_confidence >= 70
GROUP BY primary_category;

-- Top subcategories
SELECT
  sub_category,
  COUNT(DISTINCT law_firm_id) as firm_count
FROM practice_area_taxonomy
WHERE primary_category = $1
  AND classification_confidence >= 70
GROUP BY sub_category
ORDER BY firm_count DESC
LIMIT 12;

-- Top keywords
SELECT
  practice_area_display_keyword,
  COUNT(DISTINCT law_firm_id) as firm_count
FROM practice_area_taxonomy
WHERE primary_category = $1
  AND classification_confidence >= 70
GROUP BY practice_area_display_keyword
ORDER BY firm_count DESC
LIMIT 20;
```

**Page Content**:
- Hero section with category name
- Brief category description (generated or manual)
- Grid of subcategories (with firm counts)
- Featured law firms (top 12 by relevance)
- Recent settlements in this category
- FAQ section
- Schema.org structured data

**SEO Meta**:
- Title: `{Category Name} Lawyers Near You | ClaimsBoost`
- Description: `Find experienced {category} lawyers. Browse {X} law firms and {Y} settlements. Free case evaluation.`
- H1: `{Category Name} Lawyers`

### 3.2 Level 2: Subcategory Pages (115 pages)

**URL Pattern**: `/practice-areas/vehicle-accidents/commercial-truck`

**Data to Load**:
```sql
-- Subcategory overview
SELECT
  primary_category,
  sub_category,
  COUNT(DISTINCT practice_area_display_keyword) as keyword_count,
  COUNT(DISTINCT law_firm_id) as firm_count
FROM practice_area_taxonomy
WHERE primary_category = $1
  AND sub_category = $2
  AND classification_confidence >= 70
GROUP BY primary_category, sub_category;

-- Keywords in this subcategory
SELECT
  practice_area_display_keyword,
  canonical_practice_area,
  COUNT(DISTINCT law_firm_id) as firm_count
FROM practice_area_taxonomy
WHERE primary_category = $1
  AND sub_category = $2
  AND classification_confidence >= 70
GROUP BY practice_area_display_keyword, canonical_practice_area
ORDER BY firm_count DESC;

-- Top law firms
SELECT DISTINCT vf.*
FROM verified_law_firms vf
JOIN practice_area_taxonomy pat ON pat.law_firm_id = vf.id
WHERE pat.primary_category = $1
  AND pat.sub_category = $2
  AND pat.classification_confidence >= 70
ORDER BY vf.name
LIMIT 20;
```

**Page Content**:
- Hero section with subcategory name
- Detailed subcategory description
- List of all keywords in this subcategory
- Featured law firms (top 20)
- Recent settlements
- Related subcategories
- FAQ section
- Schema.org structured data

**SEO Meta**:
- Title: `{Subcategory Name} Lawyers | {Category Name} | ClaimsBoost`
- Description: `Find specialized {subcategory} lawyers. {X} experienced attorneys handling {keyword1}, {keyword2}, and more.`
- H1: `{Subcategory Name} Lawyers`

### 3.3 Level 3: Keyword Pages (541 pages)

**URL Pattern**: `/practice-areas/vehicle-accidents/commercial-truck/18-wheeler-accidents`

**Data to Load**:
```sql
-- Keyword metadata
SELECT
  primary_category,
  sub_category,
  practice_area_display_keyword,
  canonical_practice_area,
  COUNT(DISTINCT law_firm_id) as firm_count,
  COUNT(*) as total_practice_areas,
  AVG(classification_confidence) as avg_confidence
FROM practice_area_taxonomy
WHERE practice_area_display_keyword = $1
  AND classification_confidence >= 70
GROUP BY 1, 2, 3, 4;

-- Law firms specializing in this keyword
SELECT DISTINCT vf.*
FROM verified_law_firms vf
JOIN practice_area_taxonomy pat ON pat.law_firm_id = vf.id
WHERE pat.practice_area_display_keyword = $1
  AND pat.classification_confidence >= 70
ORDER BY vf.name
LIMIT 50;

-- Settlements for this keyword (semantic search)
SELECT ss.*
FROM settlement_search_view ss
WHERE ss.practice_area ILIKE '%' || $canonical || '%'
ORDER BY ss.settlement_date DESC
LIMIT 20;
```

**Page Content**:
- Hero section with keyword name
- Comprehensive keyword description
- "What is {keyword}?" section
- "When to hire a {keyword} lawyer" section
- Law firms specializing in this area (with distance if user location available)
- Recent settlements
- Related keywords
- FAQ section
- Schema.org structured data (LegalService, FAQPage)

**SEO Meta**:
- Title: `{Keyword} Lawyers Near You | ClaimsBoost`
- Description: `Find experienced {keyword} lawyers. {X} attorneys, {Y} settlements. Free case evaluation. No fees unless you win.`
- H1: `{Keyword} Lawyers`

---

## Phase 4: Semantic Matching

### 4.1 Most Relevant Law Firms

Use semantic similarity to rank law firms by relevance:

```sql
-- Get most relevant firms using embeddings
SELECT
  vf.*,
  1 - (pae.embedding <=> (
    SELECT embedding
    FROM practice_area_embeddings
    WHERE canonical_practice_area = $1
    LIMIT 1
  )) as similarity_score
FROM verified_law_firms vf
JOIN practice_area_embeddings pae ON pae.law_firm_id = vf.id
WHERE pae.canonical_practice_area = $1
ORDER BY similarity_score DESC
LIMIT 50;
```

**Enhancement**: Add distance filter if user location is available:
```sql
-- Combine semantic similarity with geographic proximity
SELECT
  vf.*,
  1 - (pae.embedding <=> $query_embedding) as similarity_score,
  ST_Distance(
    vf.location::geography,
    ST_SetSRID(ST_MakePoint($user_lon, $user_lat), 4326)::geography
  ) / 1609.34 as distance_miles
FROM verified_law_firms vf
JOIN practice_area_embeddings pae ON pae.law_firm_id = vf.id
WHERE pae.canonical_practice_area = $1
  AND ST_DWithin(
    vf.location::geography,
    ST_SetSRID(ST_MakePoint($user_lon, $user_lat), 4326)::geography,
    80467  -- 50 miles in meters
  )
ORDER BY
  similarity_score DESC,
  distance_miles ASC
LIMIT 50;
```

### 4.2 Most Relevant Settlements

Match settlements to keywords using semantic search:

```sql
-- Semantic search for settlements
SELECT
  ss.*,
  1 - (ss.embedding <=> $query_embedding) as similarity_score
FROM settlement_search_view ss
WHERE 1 - (ss.embedding <=> $query_embedding) > 0.7
ORDER BY similarity_score DESC, ss.settlement_date DESC
LIMIT 20;
```

**Fallback**: If no embeddings available, use text matching:
```sql
SELECT ss.*
FROM settlement_search_view ss
WHERE ss.practice_area ILIKE '%' || $canonical || '%'
   OR ss.practice_area ILIKE '%' || $keyword || '%'
ORDER BY ss.settlement_date DESC
LIMIT 20;
```

---

## Phase 5: SEO Optimization

### 5.1 URL Structure
```
✅ Clean, hierarchical URLs
✅ Keyword-rich slugs
✅ Consistent depth (3 levels max)
✅ No query parameters
```

### 5.2 Meta Tags
```html
<!-- Title -->
<title>{Keyword} Lawyers Near You | ClaimsBoost</title>

<!-- Description -->
<meta name="description" content="{X} experienced {keyword} lawyers. Browse settlements, read reviews, and get free case evaluations.">

<!-- Open Graph -->
<meta property="og:title" content="{Keyword} Lawyers | ClaimsBoost">
<meta property="og:description" content="Find the best {keyword} lawyers near you">
<meta property="og:type" content="website">
<meta property="og:url" content="https://claimsboost.com/practice-areas/...">

<!-- Canonical -->
<link rel="canonical" href="https://claimsboost.com/practice-areas/...">
```

### 5.3 Structured Data (Schema.org)

**For all pages**:
```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "{Page Title}",
  "description": "{Page Description}",
  "url": "{Canonical URL}"
}
```

**For keyword pages**:
```json
{
  "@context": "https://schema.org",
  "@type": "LegalService",
  "serviceType": "{Keyword}",
  "provider": {
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "Attorney",
        "name": "{Law Firm Name}",
        "url": "{Law Firm URL}"
      }
    ]
  }
}
```

**FAQ Schema** (if FAQs present):
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is {keyword}?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{Answer text}"
      }
    }
  ]
}
```

### 5.4 Internal Linking

**Breadcrumbs**:
```
Home > Practice Areas > Vehicle Accidents > Commercial Truck > 18-Wheeler Accidents
```

**Related Links**:
- Parent category/subcategory
- Sibling keywords (same subcategory)
- Related keywords (semantic similarity)

### 5.5 Content Requirements

**Minimum Content per Page**:
- Category: 500+ words
- Subcategory: 400+ words
- Keyword: 300+ words

**Content Structure**:
1. H1: Main keyword
2. H2: "What is {keyword}?"
3. H2: "When to hire a {keyword} lawyer"
4. H2: "Top {keyword} lawyers"
5. H2: "Recent {keyword} settlements"
6. H2: "Frequently asked questions"

---

## Phase 6: Implementation Steps

### Step 1: Setup (Week 1)
- [ ] Create route structure in SvelteKit
- [ ] Build slug generation utility
- [ ] Create page manifest from database
- [ ] Design page templates (Figma/mockups)

### Step 2: Data Layer (Week 1-2)
- [ ] Write SQL queries for all page types
- [ ] Create database helper functions
- [ ] Test semantic similarity queries
- [ ] Implement caching strategy

### Step 3: Page Templates (Week 2-3)
- [ ] Build category page template
- [ ] Build subcategory page template
- [ ] Build keyword page template
- [ ] Implement breadcrumbs component
- [ ] Add schema.org structured data

### Step 4: Content Generation (Week 3-4)
- [ ] Write or generate category descriptions (17)
- [ ] Write or generate subcategory descriptions (115)
- [ ] Generate keyword descriptions (541)
- [ ] Create FAQ content
- [ ] Review and edit all content

### Step 5: SEO Implementation (Week 4)
- [ ] Implement meta tags
- [ ] Add structured data
- [ ] Set up internal linking
- [ ] Generate sitemap.xml
- [ ] Test with SEO tools (Lighthouse, Screaming Frog)

### Step 6: Testing & Launch (Week 5)
- [ ] Test all 673 pages generate correctly
- [ ] Verify data accuracy
- [ ] Check mobile responsiveness
- [ ] Performance testing (Core Web Vitals)
- [ ] Deploy to production

### Step 7: Post-Launch (Week 6+)
- [ ] Submit sitemap to Google Search Console
- [ ] Monitor indexing status
- [ ] Track rankings for key terms
- [ ] A/B test page layouts
- [ ] Iterate based on analytics

---

## Phase 7: Performance Considerations

### 7.1 Build Time
**Expected build time**: 5-10 minutes for 673 pages

**Optimization strategies**:
- Use parallel builds (`vite build --parallel`)
- Cache database queries during build
- Pre-compute embeddings for similarity searches

### 7.2 Page Load Performance
**Target metrics**:
- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Time to Interactive: < 3.8s

**Strategies**:
- Lazy load law firm cards (below fold)
- Optimize images (WebP, responsive)
- Minimize JavaScript bundle
- Use SvelteKit's server-side rendering

### 7.3 Database Performance
**Queries per page build**: 3-5 queries

**Total queries for all pages**: ~2,500-3,500

**Optimization**:
- Use connection pooling
- Cache query results during build
- Create database indexes on:
  - `practice_area_taxonomy.primary_category`
  - `practice_area_taxonomy.sub_category`
  - `practice_area_taxonomy.practice_area_display_keyword`
  - `practice_area_taxonomy.canonical_practice_area`

---

## Phase 8: Content Strategy

### 8.1 AI-Generated Content

Use AI to generate initial descriptions for all 673 pages:

**Category descriptions** (17):
- 500-800 words
- Overview of category
- Common case types
- What to expect
- How to choose a lawyer

**Subcategory descriptions** (115):
- 400-600 words
- Specific subcategory details
- Typical damages
- Legal process
- Success factors

**Keyword descriptions** (541):
- 300-500 words
- Keyword definition
- Common causes
- Legal rights
- Next steps

**Tools**:
- Claude API for generation
- Human review and editing
- Legal accuracy verification

### 8.2 Manual Content Priorities

Focus manual writing effort on high-value pages:

**Top 20 Keywords by Firm Count**:
1. Brain Injuries (576 firms)
2. Bicycle Accidents (653 firms)
3. Boating Accidents (402 firms)
4. Birth Injuries (346 firms)
5. Burn Injuries (306 firms)
6. Bus Accidents (278 firms)
7. Catastrophic Injuries (272 firms)
8. Business Litigation (193 firms)
9. Child Sexual Abuse (168 firms)
10. Aviation Accidents (181 firms)
... (continue for top 20)

**Strategy**:
- Write high-quality, original content for top 50 keywords
- Use AI-generated + human-edited for next 150
- Use templated AI content for remaining 341

---

## Phase 9: Analytics & Monitoring

### 9.1 Tracking Setup
- [ ] Google Analytics 4
- [ ] Google Search Console
- [ ] Conversion tracking (contact form submissions)
- [ ] Custom events (law firm clicks, settlement views)

### 9.2 Key Metrics
**Traffic**:
- Organic impressions
- Organic clicks
- Click-through rate (CTR)
- Average position

**Engagement**:
- Bounce rate
- Time on page
- Pages per session
- Scroll depth

**Conversions**:
- Contact form submissions
- Phone clicks
- Law firm profile views

### 9.3 Reporting
**Weekly**:
- Top performing keywords
- New rankings
- Indexing issues

**Monthly**:
- Traffic trends
- Conversion rate
- Revenue attribution (if available)

---

## Phase 10: Future Enhancements

### 10.1 User Location Integration
- Detect user location (already implemented with MaxMind)
- Filter law firms by proximity
- Show "Lawyers near {City, State}"
- Add local schema markup

### 10.2 Reviews & Ratings
- Integrate lawyer reviews
- Display star ratings
- Add review schema markup
- Sort by rating + relevance

### 10.3 Dynamic Content
- Real-time firm availability
- Recently contacted firms
- Trending settlements
- Popular searches

### 10.4 Personalization
- Remember user location
- Track viewed firms
- Recommend similar practice areas
- Save favorite lawyers

---

## Technical Specifications

### Database Indexes Needed
```sql
-- Speed up taxonomy queries
CREATE INDEX idx_taxonomy_primary_category ON practice_area_taxonomy(primary_category);
CREATE INDEX idx_taxonomy_sub_category ON practice_area_taxonomy(sub_category);
CREATE INDEX idx_taxonomy_display_keyword ON practice_area_taxonomy(practice_area_display_keyword);
CREATE INDEX idx_taxonomy_canonical ON practice_area_taxonomy(canonical_practice_area);
CREATE INDEX idx_taxonomy_confidence ON practice_area_taxonomy(classification_confidence);

-- Composite index for common query pattern
CREATE INDEX idx_taxonomy_category_subcategory
ON practice_area_taxonomy(primary_category, sub_category, classification_confidence);
```

### Environment Variables
```bash
# Already configured
PUBLIC_SUPABASE_URL=https://eaqsybrymavpwmdhmlxk.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# For AI content generation (optional)
ANTHROPIC_API_KEY=<claude-api-key>
```

### File Structure
```
src/
├── routes/
│   └── practice-areas/
│       ├── +page.svelte
│       ├── +page.server.js
│       └── [category]/
│           ├── +page.svelte
│           ├── +page.server.js
│           └── [subcategory]/
│               ├── +page.svelte
│               ├── +page.server.js
│               └── [keyword]/
│                   ├── +page.svelte
│                   └── +page.server.js
├── lib/
│   ├── utils/
│   │   └── slugify.js
│   ├── components/
│   │   ├── LawFirmCard.svelte
│   │   ├── SettlementCard.svelte
│   │   ├── Breadcrumbs.svelte
│   │   └── PracticeAreaFAQ.svelte
│   └── server/
│       └── taxonomy.js  # Database queries
└── content/
    ├── categories/      # Manual descriptions
    ├── subcategories/
    └── keywords/
```

---

## Success Criteria

### Launch Criteria (Week 5)
- [ ] All 673 pages generate successfully
- [ ] All pages pass Lighthouse SEO audit (score > 90)
- [ ] All pages load in < 3 seconds
- [ ] All data displays correctly
- [ ] Mobile responsive
- [ ] Schema.org validation passes

### 30-Day Post-Launch (Week 9)
- [ ] At least 500 pages indexed by Google
- [ ] 10+ keywords ranking on page 1
- [ ] 1,000+ organic sessions
- [ ] 20+ contact form submissions from SEO traffic

### 90-Day Post-Launch (Week 17)
- [ ] All 673 pages indexed by Google
- [ ] 50+ keywords ranking on page 1
- [ ] 10,000+ organic sessions
- [ ] 200+ contact form submissions from SEO traffic
- [ ] $X in attributed revenue (if tracking available)

---

## Risks & Mitigation

### Risk 1: Duplicate Content
**Issue**: Similar content across pages flagged as duplicate

**Mitigation**:
- Write unique descriptions for each page
- Use canonical tags
- Vary content structure between levels
- Add unique FAQs per keyword

### Risk 2: Slow Indexing
**Issue**: Google takes months to index all pages

**Mitigation**:
- Submit sitemap immediately
- Create internal links between pages
- Share on social media
- Build backlinks to high-value pages

### Risk 3: Low Quality Scores
**Issue**: AI-generated content flagged as low quality

**Mitigation**:
- Human review all content
- Add unique value (settlements, firm counts)
- Include real data and statistics
- Regular content updates

### Risk 4: Long Build Times
**Issue**: 673 pages take 30+ minutes to build

**Mitigation**:
- Use incremental static regeneration
- Move to hybrid approach (some dynamic pages)
- Optimize database queries
- Use parallel builds

---

## Budget Estimate

### Development Time
- Setup & Planning: 40 hours
- Data Layer: 30 hours
- Page Templates: 40 hours
- Content Generation: 60 hours (mostly AI + review)
- SEO Implementation: 20 hours
- Testing: 20 hours
- **Total**: ~210 hours (~5 weeks at 40 hrs/week)

### Ongoing Costs
- Claude API for content generation: ~$50-100 (one-time)
- SEO tools (optional): $99-299/month
- Hosting: Already covered by Vercel free tier

---

## Next Steps

1. **Review this plan** - Confirm approach and timeline
2. **Design mockups** - Create visual designs for 3 page types
3. **Set up routes** - Build SvelteKit route structure
4. **Query database** - Verify all data is available
5. **Build first prototype** - Implement one complete page (keyword level)
6. **Iterate** - Refine based on feedback
7. **Scale** - Generate all 673 pages

---

## Questions to Answer

- [ ] Should we manually write content for top 50 keywords or use AI for all?
- [ ] Do we want user location filtering from day 1?
- [ ] Should settlement matching be semantic or text-based initially?
- [ ] What's the priority: speed to launch or content quality?
- [ ] Do we need lawyer reviews/ratings at launch?
- [ ] Should we implement A/B testing for page layouts?

---

## Resources

### Documentation
- SvelteKit prerendering: https://kit.svelte.dev/docs/page-options#prerender
- Schema.org LegalService: https://schema.org/LegalService
- Google Search Console: https://search.google.com/search-console

### Tools
- Screaming Frog SEO Spider (crawl testing)
- Google Lighthouse (performance testing)
- Ahrefs or SEMrush (keyword research)
- Claude API (content generation)

---

## Appendix

### Sample Query Results

**Top 10 Keywords by Firm Count**:
1. Brain Injuries - 576 firms
2. Bicycle Accidents - 653 firms
3. Boating Accidents - 402 firms
4. Birth Injuries - 346 firms
5. Burn Injuries - 306 firms
6. Bus Accidents - 278 firms
7. Catastrophic Injuries - 272 firms
8. Business Litigation - 193 firms
9. Child Sexual Abuse - 168 firms
10. Aviation Accidents - 181 firms

**Category Distribution**:
- 17 primary categories
- 115 subcategories (avg: 6.8 per category)
- 541 display keywords (avg: 4.7 per subcategory)

**Confidence Scores**:
- Average: 91.3
- Minimum: 60
- Maximum: 100
- Pages with confidence < 70: ~50 (needs review)
