# Workers' Compensation Funnel Research Report

**Date:** December 8-9, 2025
**Purpose:** Research competitor workers' comp lead generation funnels to design an optimal conversion-optimized funnel for ClaimsBoost.com

---

## Executive Summary

This report documents comprehensive research on 4 workers' compensation lead generation funnels to identify best practices for optimizing ClaimsBoost.com's conversion rate. The research includes step-by-step screenshots of each competitor's intake process.

**Key Findings:**
- Survey-style funnels outperform simple contact forms for lead qualification
- Visual body part pickers increase engagement (Atticus.com)
- Progress indicators reduce abandonment
- Settlement estimates serve as compelling value propositions
- Social proof (testimonials) during loading screens build trust
- Explicit TCPA consent as dedicated step improves legal compliance (Accident.com)
- Typeform-style UX with keyboard shortcuts can improve completion rates

---

## Competitor 1: Atticus.com

**URL:** https://atticus.com/workers-compensation/
**Funnel Type:** Comprehensive survey (13+ steps)
**Key Differentiator:** Visual body part picker, settlement estimate calculator

### Landing Page

![Atticus Homepage](.playwright-mcp/research/atticus-homepage.png)

![Atticus Workers' Comp Landing](.playwright-mcp/research/atticus-workers-comp-landing.png)

### Step 1: State Selection

The funnel opens with state selection - this qualifies leads geographically and determines jurisdictional requirements.

![Atticus Q1 - State](.playwright-mcp/research/atticus-q1-state.png)

**UX Notes:**
- Visual state icons grid layout
- Clean, uncluttered design
- Clear progress indicator at top

### Step 2: Injury Recency (2 weeks)

First timeline qualifier - asks if injury occurred within last 2 weeks.

![Atticus Q2 - Recent Injury](.playwright-mcp/research/atticus-q2-recent-injury.png)

**UX Notes:**
- Simple Yes/No binary choice
- Large, easy-to-tap buttons
- Minimal cognitive load

### Step 3: Injury Within 3 Years

Second timeline qualifier - statute of limitations check.

![Atticus Q3 - Three Years](.playwright-mcp/research/atticus-q3-three-years.png)

### Step 4: Age Range

Demographic question with range selection.

![Atticus Q4 - Age](.playwright-mcp/research/atticus-q4-age.png)

**UX Notes:**
- Age ranges rather than exact age (reduces friction)
- Multiple button options in grid

### Step 5: Already Working With Lawyer

Lead qualification - identifies if prospect already has representation.

![Atticus Q5 - Lawyer](.playwright-mcp/research/atticus-q5-lawyer.png)

### Step 6: Upper Body Injury Location (Visual Picker)

**KEY FEATURE:** Multi-select visual body part picker with illustrations.

![Atticus Q6 - Injury Location](.playwright-mcp/research/atticus-q6-injury-location.png)

**UX Notes:**
- Visual illustrations of body parts
- Multi-select capability
- Clear selected states
- "Skip" option available

### Step 7: Injury Type (Conditional)

Follow-up question based on body part selection - asks about specific injury type.

![Atticus Q7 - Injury Type](.playwright-mcp/research/atticus-q7-injury-type.png)

**UX Notes:**
- Conditional branching based on Step 6
- Specific injury types (herniated disc, strain, etc.)

### Step 8: Lower Body Injuries

Second visual body part picker for lower body.

![Atticus Q8 - Lower Body](.playwright-mcp/research/atticus-q8-lower-body.png)

### Step 9: Injury Summary

Confirmation screen showing all selected injuries.

![Atticus Q9 - Injury Summary](.playwright-mcp/research/atticus-q9-injury-summary.png)

**UX Notes:**
- Shows user their selections for review
- Builds confidence in process
- Opportunity to go back and edit

### Step 10: Work Status

Asks if user has returned to work full-time.

![Atticus Q10 - Work Status](.playwright-mcp/research/atticus-q10-work-status.png)

### Step 11: USPS Employment Check

**KEY FEATURE:** Federal employee detection for FECA cases.

![Atticus Q11 - USPS](.playwright-mcp/research/atticus-q11-usps.png)

**UX Notes:**
- Third option: "Not sure"
- Explanation text about government workers
- Routes federal employees differently

### Step 12: Job Physical Demand (Slider)

**KEY FEATURE:** Interactive slider with dynamic illustration.

![Atticus Q12 - Job Physicality](.playwright-mcp/research/atticus-q12-job-physicality.png)

**UX Notes:**
- Slider input with visual feedback
- Illustration changes based on slider position
- Engaging, interactive element

### Step 13: Earnings Before Injury

Salary/wage question with range options.

![Atticus Q13 - Salary](.playwright-mcp/research/atticus-q13-salary.png)

**UX Notes:**
- Shows both hourly and annual equivalents
- Range selection (less friction than exact input)

### Loading/Calculating Screen

**KEY FEATURE:** Testimonial displayed during processing.

![Atticus Calculating](.playwright-mcp/research/atticus-calculating-estimate.png)

**UX Notes:**
- Social proof testimonial with photo
- "Calculating estimate" messaging
- Builds anticipation for result
- Reduces perceived wait time

---

## Competitor 2: CallJustice.com (Lawyers for Justice)

**URL:** https://calljustice.com/i-was-injured-at-work/
**Funnel Type:** 6-step modal survey
**Key Differentiator:** Attorney photo throughout, employment-focused questions

### Landing Page

![CallJustice Landing](.playwright-mcp/research/calljustice-landing.png)

**UX Notes:**
- Blog-style landing page
- "Get Free Evaluation" CTAs
- Multiple trust signals

### Step 1: Situation Type (6-step funnel)

Multi-select for case type routing.

![CallJustice Q1 - Situation](.playwright-mcp/research/calljustice-q1-situation.png)

**UX Notes:**
- Modal overlay design
- Attorney photo on left creates personal connection
- Progress bar shows "Step 1 of 6"
- Multiple situation types (not just workers' comp)
- Options include: unpaid wages, wrongful termination, injury, retaliation, harassment, discrimination

### Step 2: Employer Information

Company name and state selection.

![CallJustice Q2 - Employer](.playwright-mcp/research/calljustice-q2-employer.png)

**UX Notes:**
- Text input for company name
- Dropdown for state selection
- Progress shows 16%

### Step 3: Employment Status

Binary question with conditional follow-up.

![CallJustice Q3 - Still Employed](.playwright-mcp/research/calljustice-q3-still-employed.png)

**KEY FEATURE:** Conditional field appears based on selection.

![CallJustice Q3 - Conditional](.playwright-mcp/research/calljustice-q3-conditional.png)

**UX Notes:**
- "No" selection reveals "Last day worked" field
- Selected option highlighted in blue
- Smart conditional logic

### Step 4: Pay Type

Hourly vs. Salary selection.

![CallJustice Q4 - Pay Type](.playwright-mcp/research/calljustice-q4-pay-type.png)

**UX Notes:**
- Simple binary choice
- Side-by-side radio buttons

### Step 5: Description

Open-ended narrative field.

![CallJustice Q5 - Description](.playwright-mcp/research/calljustice-q5-description.png)

**UX Notes:**
- Textarea for case details
- Supportive messaging: "Provide as much detail as you feel comfortable sharing"

### Step 6: Contact Capture

Final contact information collection.

![CallJustice Q6 - Contact](.playwright-mcp/research/calljustice-q6-contact.png)

**UX Notes:**
- Standard contact fields: Name, Email, Phone
- "Best time to contact you?" preference (Now/Morning/Afternoon/Evening)
- Referral consent checkbox
- Progress shows 83%

---

## Competitor 3: Accident.com

**URL:** https://www.accident.com/
**Funnel Type:** Typeform-based survey (9 steps)
**Key Differentiator:** Third-party form tool (Typeform), streamlined qualification questions, explicit TCPA consent

### Homepage

Case type selector with visual icons for different injury types.

![Accident.com Homepage](.playwright-mcp/research/accident-homepage.png)

**UX Notes:**
- Clean icon-based case type selection
- Categories: Auto, Malpractice, Personal Injury, Workers Comp, Slip and Fall, SSDI
- Location auto-detection (shows city/state)
- Simple "Find Local Lawyers" CTA

### Step 1: Timeline (How long ago)

First question qualifies based on statute of limitations.

![Accident Q1 - Timeline](.playwright-mcp/research/accident-q1-timeline.png)

**UX Notes:**
- Three simple options: Less than 1 year / Less than 2 years / Less than 3 years
- Keyboard shortcuts (A, B, C) for quick selection
- Progress bar at top
- Clean Typeform styling

### Step 2: Injury Type

Primary injury categorization.

![Accident Q2 - Injury Type](.playwright-mcp/research/accident-q2-injury-type.png)

**UX Notes:**
- Five injury categories: Back/Neck, Headaches, Cuts/Bruises, Broken Bones, Other
- Single-select radio buttons
- Simple categorization (less detailed than Atticus)

### Step 3: Already Have Lawyer

Lead qualification - filters out represented prospects.

![Accident Q3 - Lawyer](.playwright-mcp/research/accident-q3-lawyer.png)

**UX Notes:**
- Simple Yes/No binary
- Critical qualification question early in funnel

### Step 4: Medical Treatment

Case strength indicator.

![Accident Q4 - Medical](.playwright-mcp/research/accident-q4-medical.png)

**UX Notes:**
- Asks about hospitalization/medical treatment
- Yes/No format
- Helps assess case viability

### Step 5-6: Name Capture

First Name and Last Name collected separately.

![Accident Q5 - First Name](.playwright-mcp/research/accident-q5-contact.png)

**UX Notes:**
- Separate fields for first/last name (Typeform pattern)
- Simple text input
- One question at a time for focus

### Step 7: Phone Number

Phone capture with country selector.

![Accident Q7 - Phone](.playwright-mcp/research/accident-q7-phone.png)

**UX Notes:**
- International phone format with country flag dropdown
- Auto-formatting as user types
- US flag pre-selected

### Step 8: Email

Email address collection.

![Accident Q8 - Email](.playwright-mcp/research/accident-q8-email.png)

**UX Notes:**
- Standard email input with placeholder
- Required field

### Step 9: Terms of Service (TCPA Consent)

**KEY FEATURE:** Explicit TCPA consent with full disclosure.

![Accident Q9 - Terms](.playwright-mcp/research/accident-q9-terms.png)

**UX Notes:**
- Full TCPA disclosure text visible
- Binary choice: "I accept" / "I don't accept"
- Link to full terms and conditions
- Mentions third-party/affiliate contact, pre-recorded messages, automated technology
- Clear "no requirement to consent as condition of purchase" language

---

## Additional Research: LawsuitInfoCenter.com (Chat-Bot Style)

**URL:** https://lawsuitinfocenter.com/contact-car-accident-lawyer/
**Funnel Type:** Chat-bot style (LeadBot)

![LawsuitInfoCenter Chat](.playwright-mcp/research/lawsuitinfocenter-intake.png)

**UX Notes:**
- Chat bubble interface (conversational)
- Profile photo avatar
- "6 easy questions" messaging
- Different paradigm from traditional survey forms

---

## Additional Research: WorkInjurySource.com

Single-page form approach (not step-by-step).

![WorkInjurySource Form](.playwright-mcp/research/workinjurysource-form.png)

**UX Notes:**
- All questions visible at once
- Different approach - may be faster but less engaging
- No progressive disclosure

---

## Competitive Analysis Matrix

| Feature | Atticus | CallJustice | Accident.com | ClaimsBoost (Current) |
|---------|---------|-------------|--------------|----------------------|
| **Total Steps** | 13+ | 6 | 9 | 7 |
| **Platform** | Custom | Custom | Typeform | Custom |
| **Visual Body Part Picker** | Yes | No | No | No |
| **Conditional Branching** | Yes | Limited | No | No |
| **Progress Indicator** | Yes (bar) | Yes (%) | Yes (bar) | Yes (steps) |
| **Settlement Estimate** | Yes | No | No | Yes |
| **Testimonials** | Yes (loading) | No | No | No |
| **Attorney Photo** | No | Yes | No | No |
| **State Selection** | Step 1 | Step 2 | Auto-detect | No |
| **Salary/Wage Question** | Yes (slider) | Type only | No | No |
| **Federal Employee Check** | Yes (USPS) | No | No | No |
| **TCPA Consent** | Hidden | Checkbox | Explicit step | Checkbox |
| **Keyboard Shortcuts** | No | No | Yes (A,B,C) | No |

---

## Key Takeaways for ClaimsBoost

### What Works Well

1. **Atticus.com:**
   - Visual body part picker is highly engaging
   - Settlement estimate as value proposition
   - Testimonials during loading reduce abandonment
   - Federal employee detection for proper routing
   - Comprehensive data collection enables better matching

2. **CallJustice.com:**
   - Attorney photo creates personal connection
   - Shorter funnel (6 steps) may reduce drop-off
   - Conditional fields (smart logic)
   - Contact time preference is user-friendly

3. **Accident.com:**
   - Clean Typeform interface with excellent mobile UX
   - Keyboard shortcuts (A, B, C) for power users
   - Explicit TCPA consent as dedicated step (legal compliance)
   - Location auto-detection pre-fills geographic data
   - Simple 5-category injury classification
   - Quick 4-question qualification before contact capture

### Recommended ClaimsBoost Approach

Based on research, recommend a **9-step dedicated `/workers-comp` funnel**:

1. **State Selection** - Geographic qualification
2. **Injury Timeline** - Statute of limitations check
3. **Body Part Categories** - Simplified multi-select (Head/Neck, Back/Spine, Arms/Hands, Legs/Feet, Internal/Other)
4. **Medical Treatment Status** - Case strength indicator
5. **Employment Status** - With conditional "last day worked"
6. **Employer Type** - Including federal employee detection
7. **Weekly Earnings Range** - For settlement estimation
8. **Loading Screen** - With testimonial and "calculating" animation
9. **Contact Capture** - Name, Phone, Email with TCPA consent

### Design Principles

- **Progress visibility:** Show step X of 9 with visual progress bar
- **Conditional logic:** Hide/show fields based on responses
- **Mobile-first:** Large touch targets, minimal scrolling per step
- **Social proof:** Testimonial on loading screen
- **Value proposition:** Settlement estimate as reward for completion

---

## Screenshots Location

All research screenshots are stored in:
```
/.playwright-mcp/research/
```

### Atticus.com Screenshots:
- `atticus-homepage.png`
- `atticus-workers-comp-landing.png`
- `atticus-q1-state.png` through `atticus-q13-salary.png`
- `atticus-calculating-estimate.png`

### CallJustice.com Screenshots:
- `calljustice-landing.png`
- `calljustice-q1-situation.png` through `calljustice-q6-contact.png`
- `calljustice-q3-conditional.png`

### Accident.com Screenshots:
- `accident-homepage.png`
- `accident-q1-timeline.png`
- `accident-q2-injury-type.png`
- `accident-q3-lawyer.png`
- `accident-q4-medical.png`
- `accident-q5-contact.png`
- `accident-q7-phone.png`
- `accident-q8-email.png`
- `accident-q9-terms.png`

### Other:
- `lawsuitinfocenter-intake.png`
- `workinjurysource-form.png`
- `workinjuryrights-homepage.png`

---

## Next Steps

1. Create dedicated `/workers-comp` route
2. Build 9-step survey component with state management
3. Implement conditional logic (federal employees, employment status)
4. Add loading screen with testimonial
5. Update thank-you page with workers' comp specific estimates
6. A/B test against existing flow

---

*Research conducted December 8-9, 2025 using Playwright browser automation*
