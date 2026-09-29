## PROJECT: CycloneShield — Operational Disaster Dashboard

ROLE: You are a senior UI/UX designer building a Palantir-style
operational decision-support dashboard for cyclone emergency management
in India (Odisha, Andhra Pradesh, West Bengal coastlines). The product
is used by disaster management officials — not the general public.


## DESIGN SYSTEM

Backgrounds:
  --bg-base:     #07111F   (deepest ground)
  --bg-surface:  #0D1B2A   (panels, sidebars)
  --bg-card:     #12263A   (cards, table rows)
  --bg-card-hi:  #1A3250   (hover / selected state)

Risk Semantic Colors (MUST be consistent everywhere):
  --risk-critical: #EF4444  (CRITICAL)
  --risk-high:     #F97316  (HIGH)
  --risk-moderate: #FACC15  (MODERATE)
  --risk-low:      #22C55E  (LOW)

Brand & Text:
  --accent:   #38BDF8   (interactive elements, links)
  --text:     #F8FAFC
  --muted:    #94A3B8
  --border:   #1E3A55

Typography:
  Display headings  →  Syne Bold / ExtraBold (600–800)
  Body & UI labels  →  Inter Regular / Medium (400–500)
  Data & code       →  JetBrains Mono (400)


## PAGES TO DESIGN (10 Figma pages)

01. Research        — Competitor analysis, references (Palantir, NDMA)
02. User Flow       — Full journey: Login → Dashboard → Cyclone →
                      Map → Risk → AI Analysis → Advisory → Dispatch
03. Wireframes      — Low-fidelity layouts for all 8 screens
04. Design System   — Colors, type scale, spacing, components library
05. Dashboard       — Main operational overview screen
06. Map View        — Interactive GIS with 4 layer toggles
07. Risk Analysis   — Infrastructure risk breakdown screen
08. AI Advisory     — Gemini analysis + advisory generation screen
09. Mobile          — 390×844 responsive versions of screens 05–08
10. Prototype       — Clickable flow connecting all screens


## COMPONENT LIBRARY (create all with variants)

Atoms:
  Button        [Primary, Secondary, Ghost, Destructive, Icon-only]
  Badge         [Default, Active]
  RiskBadge     [Critical, High, Moderate, Low] — pill with colored dot
  Icon          [24px Lucide icons: AlertTriangle, Map, Hospital,
                 Zap, Route, CloudRain, Wind, Bell, Bot, Shield]

Molecules:
  StatCard      [metric label + big number + RiskBadge + trend arrow]
  AlertCard     [severity stripe + title + timestamp + dismiss]
  InfraCard     [icon + category + count + risk level + progress bar]
  LayerToggle   [map layer on/off with icon + label]
  SidebarItem   [icon + label + optional badge + active state]
  AdvisoryCard  [priority + action list + [Edit][Approve][Dispatch]]

Organisms:
  Sidebar       [Logo + nav items + cyclone selector + status]
  MapControls   [layer toggles + zoom + legend]
  RiskSummary   [4-column StatCard row: Power / Roads / Hospitals / People]
  AIPanel       [analysis results + advisory generation CTA]


## SCREEN 05 — MAIN DASHBOARD

Layout: fixed left sidebar (240px) + main content area
Sidebar contents:
  🌀 CycloneShield logo
  — Map View
  — Risk Analysis
  — Infrastructure
  — Alerts (badge: 3)
  — Settings
  [Cyclone Selector dropdown: "BOB-2024-05 · Mocha"]
  [Status chip: 🔴 ACTIVE WARNING]

Main area (top → bottom):
  Row 1: 4 StatCards — Power Substations (27, HIGH), Roads at risk
          (43 km, HIGH), Hospitals affected (8, CRITICAL), Population
          exposed (1.2M, HIGH)
  Row 2: Map panel (60% width) + Alert feed (40% width)
  Row 3: RiskSummary bar with mini progress bars per category

Map panel placeholder shows:
  Bay of Bengal base layer
  Cyclone track (dashed line with 🌀 icon at head)
  Landfall marker (red pin)
  Risk zone rings: red/orange/yellow


## SCREEN 06 — MAP VIEW (full screen)

Full-bleed map with:
  Top bar: breadcrumb + cyclone name + intensity badge
  Left panel (collapsed by default, expandable):
    Layer toggles (each with icon):
      [🌀] Cyclone Track       [ON]
      [🔴] Risk Zones          [ON]
      [⚡] Power Infrastructure [OFF]
      [🏥] Medical Facilities  [OFF]
      [🛣] Road Network        [OFF]
      [💧] Flood/Surge Zones   [OFF]
  Bottom-left: Legend card
  Bottom-right: Zoom controls + locate button

Map states to show as variants:
  State A — Track only
  State B — Track + Risk zones
  State C — Track + Risk + Infrastructure
  State D — All layers ON


## SCREEN 07 — RISK ANALYSIS

Two-column layout:
  Left (55%): Infrastructure breakdown table
    Columns: Asset / Location / Risk Level / Status / Action
    Rows (examples):
      Paradip Substation A  |  Kendrapara  |  🔴 CRITICAL  |  Unprotected
      NH-16 Junction Km 42  |  Bhadrak     |  🟠 HIGH      |  Monitoring
      KIMS Hospital         |  Bhubaneswar |  🟠 HIGH      |  Alert sent
      Bhadrak Shelter 3     |  Bhadrak     |  🟡 MODERATE  |  Standby

  Right (45%):
    Donut chart — Risk distribution (Critical 32%, High 45%, Mod 23%)
    Bar chart   — Exposure by district (Kendrapara, Bhadrak, Balasore)
    Timeline    — Landfall T-minus countdown with hourly risk escalation


## SCREEN 08 — AI ADVISORY

Two-panel screen:
  Left panel — Gemini Impact Analysis:
    Header: "🤖 AI IMPACT ANALYSIS · BOB-2024-05"
    Sub-header badge: CYCLONE RISK: HIGH
    Analysis text block (formatted, real prose)
    Key concerns list:
      🔴 7 power substations at critical risk
      🟠 21 km of arterial roads compromised
      🔴 4 medical facilities in surge zone
      🟠 380,000 population exposed
    CTA button: [✦ Generate Emergency Advisory]  [Loading state variant]

  Right panel — Generated Advisory (appears after CTA):
    Header: "📢 AI-GENERATED ADVISORY"
    Priority chip: CRITICAL
    Advisory body (numbered action list):
      1. Immediately inspect 7 high-risk substations in Kendrapara
      2. Pre-position 3 NDRF teams at Bhadrak staging area
      3. Evacuate low-lying areas within 10 km of projected landfall
      4. Alert KIMS and Balasore District Hospital for mass-casualty prep
      5. Close NH-16 between Km 38–55 pending inspection
    Language selector: [English ▼] (options: ଓଡ଼ିଆ, हिन्दी, বাংলা, తెలుగు)
    Action row: [✏ Edit]  [✓ Approve]  [📡 Dispatch]
    Dispatch confirmation modal variant (destructive action confirmation)


## SCREEN 09 — MOBILE (390×844)

Single-column layout with bottom navigation:
  Nav tabs: Map / Risks / Alerts / Advisory
  Map screen: Full-width map + floating bottom sheet with risk summary
  Risk screen: Scrollable InfraCard list with risk severity stripes
  Advisory screen: Stacked AI analysis + advisory with full-width buttons
  Hamburger menu → slides in sidebar as right drawer


## PROTOTYPE CONNECTIONS

Login → Dashboard (fade, 300ms)
Dashboard Map panel → Map View (push right)
Dashboard StatCard click → Risk Analysis (push right)
Risk Analysis → AI Advisory (push right, highlight relevant row)
AI Advisory [Generate] → Loading state (1.2s) → Advisory revealed
Advisory [Dispatch] → Confirmation modal → Success state → Dashboard
Mobile: bottom sheet swipe up/down, tab switching


## DESIGN PRINCIPLES

✓  Any user must understand situation within 5–10 seconds
✓  Risk colors NEVER deviate — same hex everywhere
✓  No decorative animations — only purposeful (track appear, layer fade)
✓  Every screen works at 1440px desktop, 1024px tablet, 390px mobile
✓  Use Lucide icons only — no custom SVGs
✓  Data precision: real Indian district names, realistic metrics

✗  No consumer website patterns (hero sections, testimonials)
✗  No pure white backgrounds — always dark operational palette
✗  No decorative gradients or glassmorphism
✗  No placeholder lorem ipsum — use real cyclone/infrastructure data