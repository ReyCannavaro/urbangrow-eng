# Design System: UrbanGrow (Warm Editorial Bento)

> **Architectural Source of Truth**: Extracted from `apps/web` (Next.js 16 + Tailwind CSS)  
> **Target Platforms**: `apps/web` & `apps/mobile` (Flutter 3.x)  
> **Philosophy**: Evidence-Based Climate Adaptive Design (ECAD) • Soft Luxury Tech • Scandinavian Indoor Living  

---

## 1. Visual Theme & Atmosphere

- **Atmosphere Rating**: 
  - **Density**: `5/10` (Daily App Balanced — spacious breathing room, intentional padding, strict hierarchy)
  - **Variance**: `7/10` (Offset Asymmetric Bento — balanced mix of photographic hero cards, technical dial gauges, vertical lollipop charts, and deep matte contrast panels)
  - **Motion**: `6/10` (Fluid Spring & Micro-Motion — soft 200–300ms easing, tactile physical clicks, pulsating live telemetry indicators, smooth circular gauge arcs)

- **Design Essence**:
  UrbanGrow rejects cold sterile laboratory aesthetics and generic neon AI dashboards. Instead, it pairs **warm tactile paper canvas** with **deep printer ink charcoal**, illuminated by a signature **sunlit butter yellow glow**. It feels like a high-end architectural monograph or a Scandinavian sustainable living console — calm, authoritative, deeply scientific, yet warm and inviting.

---

## 2. Color Palette & Semantic Roles

### 2.1 Surfaces & Neutrals
| Token Name | Hex / CSS Value | Functional Role & Application |
|---|---|---|
| **Canvas Linen** | `#F3EFE6` | Primary outer canvas background (warm tactile unbleached paper) |
| **Console Frame** | `#FAF8F3` | Elevated app console container / scaffold background |
| **Pure Card Surface** | `#FFFFFF` | Standard card surface fill, dialogs, and popovers |
| **Subtle Card Tint** | `#F7F4EE` | Secondary nested card backgrounds and muted containers |
| **Charcoal Ink** | `#1E1F24` | Primary high-contrast text, primary dark buttons, active nav pills |
| **Charcoal Surface** | `#282A30` | Elevated dark card panels (Hardware status, task automation console) |
| **Text Secondary** | `#666973` | Subtitles, parameter descriptions, secondary metadata |
| **Text Muted** | `#9598A3` | Timestamps, technical cycle indicators, disabled state text |
| **Text Inverse** | `#F8FAFC` | High-contrast white text on charcoal/dark surfaces |

### 2.2 Borders & Structural Hairlines
| Token Name | Value | Application |
|---|---|---|
| **Border Light** | `rgba(0, 0, 0, 0.06)` | Standard card borders, hairline dividers, subtle module boundaries |
| **Border Medium** | `rgba(0, 0, 0, 0.12)` | Interactive borders, pill button outlines, active inputs |
| **Border Charcoal** | `rgba(255, 255, 255, 0.10)`| Dividers and borders inside dark charcoal containers |

### 2.3 Signature & Biological Accents
| Token Name | Hex Code | Semantic Meaning & Usage |
|---|---|---|
| **Sunlit Butter Yellow** *(Signature)* | `#FACC15` | **Core Brand Accent**: Growth progress bars, dial gauge arcs, lollipop highlight badges, active task checks |
| **Sunlit Yellow Light** | `#FEF08A` | Soft yellow pill backgrounds, subtle notification chips, icon container fills |
| **Sunlit Yellow Deep** | `#EAB308` | High-contrast yellow labels, dot connectors, warning/caution badges |
| **Chlorophyll Emerald** | `#10B981` | Level 4 Pakcoy canopy, system health 100%, backend live status, healthy bio balance |
| **Biofloc Cyan** | `#0EA5E9` | Level 3 Nila water aeration, dissolved oxygen indicators, freshwater circulation flow |
| **Biofilter Amber** | `#D97706` | Level 2 Kangkung hydroton biofilter, ammonia-to-nitrate conversion efficiency |
| **Sump Slate** | `#475569` | Level 1 Lele bottom tank, solids filtration, submersible pump hardware |
| **Harvest Coral** | `#F97316` | Feed dispenser action trigger, temperature alert / critical anomaly badges |

> **Palette Rule**: The signature accent is **Sunlit Butter Yellow (`#FACC15`)**. Saturated generic neon greens or AI purple glows are strictly banned. All functional biological colors (Emerald, Cyan, Amber, Slate) are strictly mapped to the 4-Level physical ecosystem.

---

## 3. Typography Architecture

### 3.1 Font Stacks
- **Display & Headings**: `Geist Sans`, `Outfit`, or `Inter` (Display weights: 400 Light to 700 Bold, tracking: `-0.025em`)
- **Body & Captions**: System Sans (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`) (Weight: 400 Regular / 500 Medium)
- **Monospace & Numerical**: `Geist Mono`, `JetBrains Mono`, or System Monospace with **`tabular-nums`** enabled

### 3.2 Type Scale & Hierarchy
| Level | Size / Line-Height | Weight | Tracking | Sample Usage |
|---|---|---|---|---|
| **Display 1** | `36px – 40px` (2.5rem) | 300 Light / 600 Semi | `-0.03em` | Hero greeting: *"Welcome in, Urban Farm 01"* |
| **Stat Numerals** | `28px – 32px` (2.0rem) | 300 Light / 400 Regular | `-0.02em` | Big counters: `27 Nila`, `25.4°C`, `6.98 pH` (`num-tabular`) |
| **Heading 2** | `18px – 20px` (1.25rem) | 600 SemiBold | `-0.015em` | Card titles: *"Ekosistem 4-Tingkat"*, *"Otomasi Sistem"* |
| **Subheading** | `13px – 14px` (0.875rem) | 500 Medium / 600 Semi | `-0.01em` | Section headers: *"Suhu & Oksigen (DO)"* |
| **Body Standard** | `13px – 14px` (0.875rem) | 400 Regular | `normal` | Descriptions, accordion copy, AgriBot chat messages |
| **Micro Monospace** | `10px – 11px` (0.687rem) | 700 Bold | `+0.08em` | Technical badges: `CYCLE 1.5s`, `ECAD v2.0 ACTIVE`, `DO 7.4 mg/L` |

---

## 4. Component Stylings & Interaction Rules

### 4.1 Cards & Containers
- **Border Radius**: 
  - Outer Frame Console: `rounded-[32px]` to `rounded-[38px]`
  - Bento Content Cards: `rounded-[28px]` (28px / 1.75rem)
  - Nested Subcards & Accordions: `rounded-[20px]` to `rounded-[22px]`
  - Micro Badges & Action Pills: `rounded-full` (`9999px`)
- **Border**: Single crisp hairline border `border border-[rgba(0,0,0,0.06)]` (no heavy borders).
- **Shadow**: Gentle diffuse ambient shadow (`box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(20,21,24,0.03)`).
- **Card Action Pill**: Top-right circular action button (`h-7 w-7 rounded-full border border-stone-200`) with `ArrowUpRight` icon that transitions to black on hover.

### 4.2 The 4 Signature Dashboard Bento Modules
1. **Photographic Ecosystem Hero Card**:
   - Aspect ratio / height: 320px fixed height.
   - High-resolution architectural greenhouse/tower photography (`/aquaponic_hero.jpg`) filled with subtle dark gradient overlay at bottom (`from-black/75 via-black/20 to-transparent`).
   - Top-left floating badge (`Closed-Loop Resirkulasi`), top-right circular arrow button.
   - Bottom metadata: Large white title, italicized subtitle, and translucent glass badge (`96.2% Skor ECAD`).

2. **Lollipop Parameter Chart (pH & TDS)**:
   - Weekly vertical capsules for 7 days (`S M T W T F S`).
   - Charcoal pill bars (`w-2.5 rounded-full`) connected to subtle circular dot base.
   - Friday highlight column rendered in **Sunlit Butter Yellow (`#FACC15`)** with floating tooltip badge: `7.02 pH`.
   - Large tabular readout at top: `6.98 pH • TDS 540 ppm`.

3. **Circular Arc Dial Gauge (Suhu & Oksigen DO)**:
   - 270° SVG stroke ring with dashed outer tick track (`strokeDasharray: 2 6`).
   - Glowing Sunlit Butter Yellow arc with smooth 500ms `ease-out` transition.
   - Center tabular readout: `25.4°C` (Large Light weight) + `DO 7.42 mg/L` (Micro mono label).
   - Bottom stream control buttons: Play/Pause circular pill + status indicator (`Stream 2s`).

4. **Matte Charcoal Task & Automation Panel**:
   - High-contrast dark container (`bg-[#1E1F24]` with white/cream typography).
   - Top status pill: `2 Aktif` (Yellow pill) / `2 Standby` (Charcoal pill).
   - Micro toggle list: Hardware icon circle (`bg-white/10`), device name, wattage readout, and circular checkbox (`bg-[#FACC15]` with dark checkmark when active).

### 4.3 Multi-Segment Stage Progress Bar
- Continuous segmented horizontal pill bar (`h-7 rounded-full`) displaying biological lifecycle stages:
  - **Stage 1 (Pembibitan)**: Charcoal pill `15%`
  - **Stage 2 (Vegetatif)**: Butter Yellow pill `25%`
  - **Stage 3 (Pembesaran Biomassa)**: Striped 45° diagonal hatch pattern bar `50%`
  - **Stage 4 (Siap Panen)**: White outlined pill `10%`

### 4.4 Buttons & Interactive Controls
- **Segmented Navigation Pill**: Enclosed capsule `p-1 rounded-full border border-[rgba(0,0,0,0.12)] bg-white/80 backdrop-blur-md`. Active item receives solid Charcoal fill with crisp white text.
- **Physical Relay Switch**: Tactile optocoupler switch card with illuminated LED indicator, power wattage counter, and heavy haptic click feedback (`HapticFeedback.heavyImpact()`).
- **Heavy Feed Action Button**: Full-width rounded pill in **Harvest Coral (`#F97316`)**, shifting instantly to **Chlorophyll Emerald (`#10B981`)** upon dispensing with a checkmark badge: *"35g Pakan Telah Didistribusikan!"*.

---

## 5. Layout & Spatial Principles

1. **Outer Console Framing**:
   The entire application is framed within a centered, generous canvas container (`max-w-[1480px]`) with soft organic rounding (`32px–38px`).
2. **Sunlit Ambient Radial Glow**:
   A delicate radial warmth sits at the top-right corner of the interface:
   `radial-gradient(circle at 95% 15%, rgba(250, 204, 21, 0.18) 0%, rgba(250, 204, 21, 0.05) 35%, transparent 70%)`.
3. **Strict Spatial Separation (Zero Collision)**:
   - Elements never overlap awkwardly.
   - No floating pills obscuring underlying content.
   - Every metric card has exactly defined boundaries, padding (`p-5` to `p-6`), and comfortable margin gaps (`gap-5` to `gap-6`).
4. **Bento Grid Architecture**:
   - Desktop: 4 equal harmonious columns (`grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5`).
   - Mobile: 1 column vertical stack with card heights calibrated to smartphone viewports.

---

## 6. Responsive & Mobile Translation Rules

To completely eliminate the discrepancy between Web and Mobile:

| Element | Web Presentation (`apps/web`) | Mobile Translation (`apps/mobile`) |
|---|---|---|
| **Top Shell** | Floating Horizontal Nav + Status Pills | Editorial App Bar with Brand Pill & Live Connectivity Indicator |
| **Hero Stage Bar** | 4-Stage Horizontal Bar + 3 Stat Numbers | Condensed Segment Bar + 2-Column Stat Counters |
| **Bento Grid** | 4-Column Horizontal Row (`h-320px`) | Vertical Swipeable Bento Stack or 2x2 Clean Bento Grid |
| **Lollipop Chart** | 7-Day S M T W T F S Capsule Row | Preserved 7-Day Mini Lollipop Chart with Friday highlight badge |
| **Dial Gauge** | 270° Yellow Arc SVG + Stream Control | Native CustomPainter 270° Dial Arc with tactile center readouts |
| **Relay Panel** | Charcoal Task Checklist (`DarkTaskPanel`) | Dedicated Charcoal Hardware Panel with wattage meter |
| **Cascade Tower** | Vertical Schematic Cards with conduits | Vertical Living Cascade Stack (L4 Pakcoy $\rightarrow$ L3 Nila $\rightarrow$ L2 Kangkung $\rightarrow$ L1 Lele) |

---

## 7. Motion & Micro-Interactions

- **Spring Dynamics**: Subtle physical dampening (`curve: Curves.easeOutCubic`, duration: `250ms–350ms`).
- **Live Telemetry Heartbeat**: 
  - Emerald status dot with expanding gentle pulse shadow (`box-shadow: 0 0 8px rgba(16, 185, 129, 0.6)`).
  - Telemetry cycle ticker updates every `1.5s` seamlessly with tabular numeral transitions.
- **Actuator Trigger Physics**:
  - Immediate visual feedback on touch down (`active:scale-[0.98]`).
  - Haptic feedback trigger on mobile for hardware switches.

---

## 8. Anti-Patterns (Explicitly Banned AI Tells)

❌ **BANNED: Generic AI Purple / Blue Neon**: No `#7C3AED`, no violet glow halos, no cyber-techno gradients.  
❌ **BANNED: Pure Black (`#000000`)**: Always use Charcoal Ink (`#1E1F24`) or Charcoal Soft (`#282A30`).  
❌ **BANNED: Nested Container Disease**: No `Container` inside `Container` inside `Container` with redundant `borderRadius: 999` and `opacity: 0.1` borders.  
❌ **BANNED: Plain Vector Icon Dominance**: Do not rely exclusively on generic Material Icons; incorporate real architectural imagery, technical conduits, and tactile typography.  
❌ **BANNED: Fake Round Numbers**: No lazy `99.9%` or `100%` placeholders. Telemetry metrics must reflect real scientific aquaponic ranges (`DO: 7.42 mg/L`, `pH: 6.94`, `Suhu: 25.4°C`, `TDS: 540 ppm`).  
❌ **BANNED: Misaligned Color Schemes**: Mobile must NOT use arbitrary green/cyan/orange palettes that diverge from the Web's Sunlit Butter Yellow and Linen Canvas system.
