# Design Guidelines: Heart Disease Prediction & Lifestyle Support App

## Design Approach

**Selected Approach**: Material Design System with Healthcare Adaptations

**Justification**: This medical application requires trust, clarity, and accessibility above all else. Material Design provides excellent patterns for data-dense interfaces, clear visual hierarchy, and robust accessibility features essential for healthcare applications. The system supports both mobile (React Native) and web (clinician portal) implementations consistently.

**Core Principles**:
- Medical Trust & Credibility: Clean, professional aesthetics that inspire confidence
- Information Clarity: Strong hierarchy for complex clinical data
- Accessibility First: WCAG 2.1 AA compliance minimum
- Safety Focus: Prominent disclaimers and emergency actions

---

## Core Design Elements

### A. Color Palette

**Light Mode**:
- Primary (Trust Blue): 210 100% 45% - Used for primary actions, headers, trust indicators
- Secondary (Health Green): 145 65% 42% - Positive health indicators, success states
- Warning (Alert Amber): 38 92% 50% - Caution states, medication reminders
- Error (Medical Red): 0 85% 55% - High risk indicators, emergency actions
- Surface: 0 0% 98% - Main background
- Surface Variant: 220 15% 95% - Cards, elevated surfaces
- Text Primary: 220 25% 15%
- Text Secondary: 220 15% 45%

**Dark Mode**:
- Primary: 210 85% 65%
- Secondary: 145 55% 55%
- Warning: 38 85% 60%
- Error: 0 75% 65%
- Surface: 220 20% 10%
- Surface Variant: 220 18% 15%
- Text Primary: 0 0% 95%
- Text Secondary: 220 10% 70%

**Risk Level Colors** (Universal):
- Low Risk: 145 65% 42% (green)
- Medium Risk: 38 92% 50% (amber)
- High Risk: 0 85% 55% (red)

### B. Typography

**Font Families**:
- Primary: Inter (Google Fonts) - Clean, medical-grade readability for UI text
- Data Display: JetBrains Mono - For numerical data, risk scores, vitals
- Headings: Poppins - Professional warmth for section headers

**Type Scale**:
- Hero/Display: 2.5rem (40px), Poppins Semi-Bold
- H1: 2rem (32px), Poppins Semi-Bold
- H2: 1.5rem (24px), Poppins Medium
- H3: 1.25rem (20px), Poppins Medium
- Body Large: 1.125rem (18px), Inter Regular
- Body: 1rem (16px), Inter Regular
- Caption/Label: 0.875rem (14px), Inter Medium
- Data: 1.5rem (24px), JetBrains Mono Medium

### C. Layout System

**Spacing Primitives** (Tailwind units):
- Core spacing set: 2, 4, 6, 8, 12, 16, 24
- Use p-4 and p-6 for card padding
- Use space-y-6 and space-y-8 for vertical rhythm
- Use gap-4 and gap-6 for grid layouts
- Mobile: p-4, desktop: p-6 to p-8

**Grid System**:
- Mobile: Single column, max-w-full
- Tablet: 2 columns for data cards (grid-cols-2)
- Desktop: 3-4 columns for dashboards (grid-cols-3, grid-cols-4)
- Content max-width: max-w-7xl for main containers

### D. Component Library

**Core UI Elements**:

1. **Risk Score Card**
   - Large circular gauge (Material Design progress indicator)
   - Risk percentage in JetBrains Mono 3xl font
   - Color-coded by risk level
   - Elevated shadow: shadow-lg
   - Border radius: rounded-2xl

2. **SHAP Explanation Cards**
   - Horizontal bar charts showing feature contributions
   - Positive contributions: red tint
   - Negative contributions: green tint
   - Plain-English labels with tooltip expandables
   - Compact design: p-4, rounded-xl

3. **Clinical Data Entry Forms**
   - Labeled input groups with helper text
   - Validation states with inline error messages
   - Unit indicators (mg/dL, mmHg) in labels
   - Floating labels for active states
   - Clear focus states with blue outline

4. **Navigation**:
   - Bottom tab navigation for mobile (Material Design)
   - Sidebar navigation for clinician portal
   - Floating Action Button for emergency/quick actions
   - Icons from Material Icons (CDN)

5. **Data Display**:
   - Vitals dashboard: card grid with trend indicators
   - History timeline: vertical list with date separators
   - Medication schedule: time-based list with checkboxes

6. **Overlays**:
   - Medical Disclaimer: Full-screen modal on first launch
   - Emergency Actions: Bottom sheet with primary red CTA
   - Consent Forms: Step-by-step wizard with progress indicator

### E. Animations

**Use Sparingly - Medical Context**:
- Risk score gauge: Smooth fill animation (800ms ease-out) on load only
- SHAP bars: Width animation (400ms) when revealed
- Form validation: Subtle shake (200ms) on error
- NO decorative or distracting animations
- NO auto-playing animations that could cause anxiety

---

## Platform-Specific Implementations

### Mobile App (React Native)
- Material Design bottom navigation
- Card-based layouts with generous padding (p-6)
- Thumb-friendly tap targets (minimum 44x44px)
- Pull-to-refresh for data updates
- Native date/time pickers for medication schedules

### Clinician Portal (Web)
- Dashboard layout: sidebar + main content area
- Data tables with sorting and filtering
- Patient list with status indicators
- Export functionality prominently placed
- Multi-column layouts for data comparison

### Chatbot Interface
- Chat bubbles: user (blue), bot (gray)
- Quick reply chips for common actions
- Typing indicator for bot responses
- Embedded action cards (meal plans, exercise demos)
- Emergency escalation button always visible

---

## Critical Healthcare UX Patterns

**Medical Disclaimers**:
- Full-screen blocking modal on first launch
- Sticky footer disclaimer on prediction results
- "Not medical advice" in caption text on every health suggestion
- Color: neutral gray, not alarming

**Emergency Actions**:
- Floating red button: fixed bottom-right (mobile), top-right (web)
- One-tap to reveal: Call Emergency + Notify Caregiver
- Pre-filled emergency message templates
- No confirmation dialogs - immediate action

**Trust Indicators**:
- "Clinician Reviewed" badges on content
- Data source citations in small text
- Last updated timestamps on recommendations
- Model version display in settings

**Accessibility**:
- ARIA labels on all interactive elements
- Color contrast ratio 4.5:1 minimum
- Focus indicators on all focusable elements
- Screen reader friendly data tables
- Text alternatives for all visualizations

---

## Images & Visual Assets

**Hero Section** (Marketing/Landing):
- Large hero image: Diverse patients using the app in clinical/home settings
- Image treatment: Subtle blue overlay (opacity 0.1) for brand consistency
- Image position: Background, with centered text overlay

**In-App Images**:
- Exercise demos: Illustrated diagrams or simple animations
- Meal photos: Clean, well-lit food photography
- Avatar placeholders: Material Design person icon
- Empty states: Friendly illustrations (outline style) for no data

**Icons**:
- Material Icons via CDN for all UI icons
- Consistent 24px size for inline icons
- 32px for prominent feature icons
- Use outlined style for consistency

---

## Data Visualization

**Risk Score Display**:
- Circular gauge with gradient fill based on risk level
- Percentage in center (large, JetBrains Mono)
- Risk category label below (Low/Medium/High)
- Contextual color coding

**SHAP Contributions**:
- Horizontal bar chart (max 3 features)
- Bars aligned left with labels
- Magnitude shown as bar width + numerical value
- Tap to expand full explanation

**Health Trends**:
- Line charts for vitals over time (Chart.js or Recharts)
- Color: primary blue for consistency
- Grid lines: subtle gray
- Data points: visible circles on hover/tap

---

## Content Strategy

**Information Hierarchy**:
1. Critical health information (risk score, emergency)
2. Actionable recommendations (diet, exercise, medication)
3. Educational content (explanations, FAQs)
4. Administrative (profile, settings, history)

**Microcopy Guidelines**:
- Medical terms: Use plain English with clinical term in parentheses
- CTAs: Action-oriented ("Check My Risk" not "Submit")
- Error messages: Specific and helpful, never alarming
- Success states: Encouraging and supportive tone