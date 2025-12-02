# Comprehensive SEO Audit Report for claimsboost.com

**Date:** December 2, 2025
**Framework:** SvelteKit
**Type:** Law Firm Directory / Legal Services

---

## Executive Summary

claimsboost.com has a solid foundation with good URL structure and basic metadata implementation, but is missing several critical SEO components that could significantly impact search visibility. The most pressing issues are:

1. **No sitemap.xml** - Critical for crawlability
2. **Limited structured data** - Missing LocalBusiness/LawFirm schemas
3. **Large unoptimized images** - 4+ MB of uncompressed PNGs
4. **No canonical URLs** - Potential duplicate content issues
5. **Static Open Graph tags** - Not dynamic per page

---

## Audit Findings

### 1. Technical SEO

#### Rendering & Crawlability

| Item | Status | Notes |
|------|--------|-------|
| Server-Side Rendering | ✅ Good | SvelteKit SSR enabled, crawlers see full content |
| robots.txt | ✅ Good | Permissive, allows all crawling |
| sitemap.xml | ❌ Missing | **Critical gap** - no sitemap found |
| HTTPS | ⚠️ Assumed | Not verified in codebase |
| URL Structure | ✅ Excellent | Semantic URLs: `/injury-law-firms/[state]/[city]/[slug]` |

**Sitemap Recommendation:**
Create a dynamic sitemap at `/sitemap.xml` that includes:
- Homepage
- All firm profile pages (~thousands of URLs)
- `/injury-law-firms/locations`
- `/injury-law-firms/practice-areas`
- Search result pages for major cities (if indexable)

#### Page Speed & Core Web Vitals

| Issue | Severity | Details |
|-------|----------|---------|
| hero-person.png | 🔴 High | 1.1 MB - needs compression/WebP |
| courthouse-bg.png | 🔴 High | 1.1 MB - needs compression/WebP |
| ai_icon_star_brand.png | 🟡 Medium | 835 KB - needs optimization |
| Gemini images | 🟡 Medium | 449-865 KB each |
| claimsboost-logo.png | 🟡 Medium | 277 KB - consider SVG |
| No lazy loading | 🟡 Medium | Images load immediately |
| No srcset/responsive images | 🟡 Medium | Single size served to all devices |
| No width/height attributes | 🟡 Medium | Causes CLS (layout shift) |

**Image Optimization Recommendations:**
1. Convert all PNG images to WebP format (70-80% size reduction)
2. Add `loading="lazy"` to below-fold images
3. Add explicit `width` and `height` attributes
4. Implement responsive `srcset` for different screen sizes
5. Consider using a CDN with automatic optimization (Cloudflare, Vercel Image Optimization)

**Estimated Impact:** Could reduce page load by 3-4 MB on homepage alone.

---

### 2. On-Page SEO

#### Meta Tags Implementation

| Page | Title | Description | Status |
|------|-------|-------------|--------|
| Homepage | ✅ | ✅ | Good defaults in layout |
| Search Results | ✅ Dynamic | ✅ Dynamic | Location-aware |
| Firm Profile | ✅ Dynamic | ✅ Dynamic | Firm name + city/state |
| Locations | ✅ | ✅ | Static but appropriate |
| Practice Areas | ✅ | ✅ | Static but appropriate |

**Current Implementation (layout.svelte:7-10):**
```svelte
<title>claimsboost.com - Get help submitting your personal injury claim</title>
<meta name="description" content="Find top-rated personal injury lawyers near you..." />
```

**Issues Found:**
1. Title is 67 characters (should be 50-60)
2. No `og:url` meta tag
3. No `og:locale` meta tag
4. No canonical URL tags

#### Heading Structure

| Page | H1 | Issue |
|------|-----|-------|
| Homepage | ⚠️ Unknown | Need to verify in Hero component |
| Firm Profile | ✅ `{firm.name}` | Good, unique per page |
| Locations | ✅ Present | Good |
| Practice Areas | ✅ Present | Good |

---

### 3. Structured Data (JSON-LD)

#### Current Implementation

**Website Schema (layout.svelte:25-38):**
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "claimsboost.com",
  "url": "https://claimsboost.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://claimsboost.com/injury-law-firms?location={search_term_string}"
  }
}
```
Status: ✅ Good for sitelinks search box

#### Missing Structured Data (Critical)

| Schema Type | Where Needed | SEO Impact |
|-------------|--------------|------------|
| LocalBusiness / LegalService | Firm profile pages | 🔴 High - enables rich snippets |
| Attorney / LawFirm | Firm profile pages | 🔴 High - professional services schema |
| BreadcrumbList | All interior pages | 🟡 Medium - breadcrumb rich results |
| AggregateRating | Firm profile pages | 🔴 High - star ratings in SERPs |
| Review | Individual settlements | 🟡 Medium - social proof |
| FAQPage | Homepage FAQ section | 🔴 High - FAQ rich results |
| WebPage | All pages | 🟡 Medium - basic page info |

**Recommended LegalService Schema for Firm Pages:**
```json
{
  "@context": "https://schema.org",
  "@type": "LegalService",
  "name": "Firm Name",
  "description": "Personal injury law firm...",
  "url": "https://claimsboost.com/injury-law-firms/ca/los-angeles/firm-slug",
  "telephone": "+1-555-555-5555",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Los Angeles",
    "addressRegion": "CA",
    "addressCountry": "US"
  },
  "priceRange": "Free Consultation",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "150"
  },
  "areaServed": {
    "@type": "City",
    "name": "Los Angeles"
  },
  "knowsAbout": ["Personal Injury", "Car Accidents", "Medical Malpractice"]
}
```

**Recommended FAQPage Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does it cost to get an estimate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely nothing! Our case estimate tool is completely free..."
      }
    }
  ]
}
```

---

### 4. Social Media / Open Graph

#### Current Implementation (layout.svelte:12-22)

| Tag | Value | Issue |
|-----|-------|-------|
| og:type | website | ✅ Good |
| og:site_name | claimsboost.com | ✅ Good |
| og:title | Static | ❌ Same for all pages |
| og:description | Static | ❌ Same for all pages |
| og:image | /claimsboost-logo.png | ⚠️ Should use full URL |
| og:url | ❌ Missing | Should be dynamic per page |
| og:locale | ❌ Missing | Should add for localization |
| twitter:card | summary_large_image | ✅ Good |
| twitter:image | ❌ Missing | Should add image tag |

**Recommendations:**
1. Make OG tags dynamic per page (especially firm profiles)
2. Add `og:url` with canonical URL
3. Add `twitter:image` tag
4. Use absolute URLs for images
5. Create unique social images for firm pages (dynamic OG images)

---

### 5. Internal Linking

#### Current Structure

| Feature | Status | Notes |
|---------|--------|-------|
| Main Navigation | ✅ Good | Links to locations, practice areas, search |
| Breadcrumbs | ✅ Present | On firm pages: Home > State > City > Firm |
| Firm Cards | ✅ Good | Links to profile pages |
| Footer Links | ⚠️ Unknown | Need to verify |

**Breadcrumb Implementation (firm profile page):**
```svelte
<nav class="breadcrumbs">
  <a href="/">Home</a> ›
  <a href="/injury-law-firms/search?state={firm.state}">{firm.stateName}</a> ›
  <a href="/injury-law-firms/search?location={firm.city}, {firm.state}">{firm.city}</a> ›
  <span>{firm.name}</span>
</nav>
```

**Issues:**
1. Breadcrumb links use query parameters instead of clean URLs
2. No BreadcrumbList structured data markup
3. Could add more internal links on firm pages (related firms, nearby cities)

---

### 6. Local SEO Considerations

Since claimsboost.com is a directory for law firms, local SEO is critical:

| Factor | Status | Recommendation |
|--------|--------|----------------|
| Location pages | ✅ | `/injury-law-firms/locations` exists |
| City-specific URLs | ✅ | `/injury-law-firms/[state]/[city]/[slug]` |
| NAP consistency | N/A | Individual firms manage their own |
| LocalBusiness schema | ❌ | Add to firm profile pages |
| GeoCoordinates | ⚠️ | Available in data, not in schema |

---

### 7. Canonical URLs

**Status: ❌ Not Implemented**

This is important for:
- Search results with query parameters (`?location=...&practice_area=...`)
- Preventing duplicate content from URL variations
- Consolidating link equity

**Recommended Implementation:**
```svelte
<link rel="canonical" href="https://claimsboost.com{$page.url.pathname}" />
```

For search pages with filters, decide canonical strategy:
- Option A: Canonical to base `/injury-law-firms` (consolidates all searches)
- Option B: Canonical to full URL with params (indexes each variation)

---

### 8. Mobile Optimization

| Factor | Status | Notes |
|--------|--------|-------|
| Viewport meta tag | ✅ | Present in app.html |
| Responsive design | ✅ | CSS media queries present |
| Touch targets | ⚠️ | Need to verify button sizes |
| Mobile menu | ⚠️ | Need to verify |

---

### 9. Accessibility (Impacts SEO)

| Factor | Status | Notes |
|--------|--------|-------|
| Image alt text | ✅ | Present on most images |
| ARIA attributes | ✅ | FAQ has aria-expanded |
| Semantic HTML | ✅ | Uses article, section, nav, footer |
| Color contrast | ⚠️ | Need to verify |
| Keyboard navigation | ⚠️ | Need to verify |

---

## Priority Recommendations

### 🔴 Critical (Do First)

1. **Create sitemap.xml**
   - Generate dynamic sitemap with all firm pages
   - Submit to Google Search Console
   - Add to robots.txt: `Sitemap: https://claimsboost.com/sitemap.xml`

2. **Add LegalService/LawFirm JSON-LD to firm pages**
   - Include name, address, phone, rating, practice areas
   - Test with [Google Rich Results Test](https://search.google.com/test/rich-results)

3. **Add FAQPage schema to homepage**
   - Enables FAQ rich snippets in search results
   - Already have structured FAQ data in component

4. **Add canonical URLs**
   - Prevents duplicate content issues
   - Essential for pages with query parameters

### 🟡 High Priority (Do Soon)

5. **Optimize images**
   - Convert to WebP (4+ MB savings)
   - Add lazy loading
   - Add width/height attributes
   - Consider image CDN

6. **Make Open Graph tags dynamic**
   - Unique titles/descriptions per firm
   - Add og:url per page
   - Add twitter:image

7. **Add BreadcrumbList schema**
   - Enables breadcrumb rich results
   - Already have visual breadcrumbs

8. **Shorten homepage title**
   - Current: 67 characters
   - Target: Under 60 characters

### 🟢 Nice to Have (Future)

9. **Create dynamic OG images per firm**
   - Auto-generate social sharing images
   - Include firm name, rating, location

10. **Add hreflang tags**
    - If targeting multiple regions/languages

11. **Implement preconnect for external resources**
    - Already doing for Google Fonts ✅

12. **Add theme-color meta tag**
    - Improves mobile browser experience

13. **Create web.manifest for PWA**
    - Enables "Add to Home Screen"

---

## Implementation Checklist

```
[ ] 1. Create /sitemap.xml generator
[ ] 2. Add LegalService JSON-LD to firm profile pages
[ ] 3. Add FAQPage JSON-LD to homepage
[ ] 4. Implement canonical URLs
[ ] 5. Convert images to WebP
[ ] 6. Add lazy loading to images
[ ] 7. Add width/height to all images
[ ] 8. Make OG/Twitter tags dynamic per page
[ ] 9. Add BreadcrumbList JSON-LD
[ ] 10. Shorten homepage title to <60 chars
[ ] 11. Add AggregateRating schema to firm pages
[ ] 12. Submit sitemap to Google Search Console
[ ] 13. Test all structured data with Rich Results Test
```

---

## Tools for Ongoing SEO Monitoring

1. **[Google Search Console](https://search.google.com/search-console)** - Monitor indexing, crawl errors
2. **[Google PageSpeed Insights](https://pagespeed.web.dev/)** - Core Web Vitals
3. **[Rich Results Test](https://search.google.com/test/rich-results)** - Validate structured data
4. **[Schema Markup Validator](https://validator.schema.org/)** - Debug JSON-LD
5. **[Ahrefs/Semrush](https://ahrefs.com)** - Keyword rankings, backlinks

---

## Sources & References

- [SEO Best Practices 2025 - First Page Sage](https://firstpagesage.com/seo-blog/seo-best-practices/)
- [SEO Priorities for 2025 - Search Engine Land](https://searchengineland.com/seo-priorities-2025-453418)
- [Next.js SEO Guide - Strapi](https://strapi.io/blog/nextjs-seo) (patterns apply to SvelteKit)
- [Local SEO for Lawyers 2025 - On The Map](https://www.onthemap.com/seo-for-attorneys/local-seo/)
- [Local SEO for Law Firms - Grow Law Firm](https://growlawfirm.com/blog/local-seo-for-lawyers)
- [Technical SEO Strategies - Elegant Themes](https://www.elegantthemes.com/blog/marketing/technical-seo)
- [SEO for Law Firms 2025 - Hurrdat Marketing](https://hurrdatmarketing.com/seo-news/seo-for-lawyers/)

---

*Report generated by Claude Code SEO Audit*
