```markdown
# Design System Document: High-End Investment Management
 
## 1. Overview & Creative North Star
**Creative North Star: "The Sovereign Architect"**
 
This design system is built to transcend the "generic fintech" aesthetic. We are not building a bank; we are building a private vault for wealth management. The "Sovereign Architect" direction focuses on structural authority, quiet luxury, and an editorial rhythm. Instead of a busy, grid-locked dashboard, we utilize **intentional white space** and **asymmetric layering** to guide the eye toward high-value data. 
 
The goal is to provide "Executive Credibility" through restraint. We move away from flat, boxed-in layouts in favor of a fluid, multi-dimensional experience where data feels curated, not just displayed.
 
---
 
## 2. Colors
Our palette is rooted in the heritage of private equity and heritage luxury. 
 
*   **Primary (`#002444`) & Primary Container (`#1B3A5C`):** Represents the depth of the ocean—stable, deep, and unwavering. Use the Container for large structural elements and the Primary for high-contrast accents.
*   **Secondary (`#755B00`) & Container (`#C9A84C`):** The "Gold Standard." These tokens are used sparingly for success states, highlights, and premium CTAs to provide a glint of exclusivity.
*   **Neutral (Surface Scale):** From `surface-container-lowest` (#FFFFFF) to `surface-dim` (#D9DADB). This range defines the "physicality" of our paper-like interface.
 
### The "No-Line" Rule
Standard UI relies on 1px borders to separate sections. **We do not.** Sectioning must be achieved through background shifts. A `surface-container-low` side panel sitting adjacent to a `surface` main content area is all the definition the eye needs.
 
### The "Glass & Gradient" Rule
To add soul to the "Minimalist" brief, apply a subtle linear gradient to main CTAs (e.g., `primary` to `primary_container`). For floating modals or navigation headers, use **Glassmorphism**: a semi-transparent `surface` color with a 12px backdrop-blur. This ensures the UI feels like a cohesive environment rather than a collection of disconnected parts.
 
---
 
## 3. Typography
We use **Inter** exclusively, but we treat it with editorial intent. The hierarchy is designed to be "scannable yet authoritative."
 
*   **Display-LG (3.5rem):** Reserved for portfolio totals or high-impact hero statements. Tighten letter-spacing (-0.02em) to maintain executive tension.
*   **Headline-SM to LG (1.5rem - 2rem):** Used for section titles. These should have generous top-margin to breathe.
*   **Title-MD (1.125rem):** The workhorse for card titles and important labels.
*   **Body-MD (0.875rem / 14px):** Our primary data point and paragraph size. The slightly smaller size compared to industry standards adds a "pro-tool" feel.
 
**Hierarchy Strategy:** Use `on_surface` (#191C1D) for headlines and `on_surface_variant` (#43474E) for body copy. This contrast ensures that the structure of the information is clear before a single word is read.
 
---
 
## 4. Elevation & Depth
We eschew traditional "drop shadows" in favor of **Tonal Layering**.
 
### The Layering Principle
Depth is achieved by stacking the Surface-Container tiers. 
1.  **Level 0 (Background):** `surface` (#F8F9FA).
2.  **Level 1 (Sub-sections):** `surface-container-low` (#F3F4F5).
3.  **Level 2 (Active Cards):** `surface-container-lowest` (#FFFFFF).
 
### Ambient Shadows
Where floating elements are necessary (e.g., a "New Investment" modal), use an **Ambient Shadow**:
*   **Blur:** 24px - 40px
*   **Opacity:** 4% - 6%
*   **Color:** Derived from `on_surface` with a hint of `primary` to ensure the shadow feels like part of the atmosphere, not a gray smudge.
 
### The "Ghost Border" Fallback
If contrast is legally required for accessibility (WCAG), use the **Ghost Border**: `outline-variant` at 15% opacity. This provides a "suggestion" of a boundary without breaking the minimalist aesthetic.
 
---
 
## 5. Components
 
### Buttons
*   **Primary:** `primary_container` (#1B3A5C) with `on_primary` text. **State Shift:** On hover, the background transitions to `secondary` (#C9A84C). This mimics the "gilding" of a luxury object.
*   **Secondary:** A "Ghost Button" using `on_surface` text with no background, only appearing on hover as a `surface-container-high` tint.
 
### Cards & Lists
*   **Rule:** Forbid divider lines. 
*   **Implementation:** Use 32px of vertical white space to separate list items. For complex data tables, use alternating row tints of `surface-container-lowest` and `surface-container-low`.
*   **Radius:** All cards must use `DEFAULT` (0.5rem / 8px). This is soft enough to feel modern but sharp enough to feel professional.
 
### Inputs
*   **High-End Treatment:** Field backgrounds should be `surface-container-low`. On focus, they transition to `surface-container-lowest` with a 1px `primary` bottom-border only. This mimics the look of a signature line on a contract.
 
### New Component: The "Perspective Bar"
For investment performance, do not use standard progress bars. Use a thin (2px) line with a `secondary` (gold) indicator dot. It suggests precision and surgical accuracy.
 
---
 
## 6. Do's and Don'ts
 
### Do
*   **Do use asymmetric margins.** Shift main content slightly off-center to create an editorial, "crafted" feel.
*   **Do use Lucide icons at 20px.** They should always be `outline-variant` (gray), turning `primary` only when active.
*   **Do prioritize white space.** If a section feels crowded, double the padding.
 
### Don't
*   **Don't use 100% black.** Always use `on_surface` (#191C1D) or `primary_fixed_variant` (#2B486B) for text to maintain a sophisticated "ink-on-paper" look.
*   **Don't use "loud" animations.** Transitions should be slow (300ms+) and use a "Cubic Bezier" curve for a weighted, mechanical feel.
*   **Don't use borders.** Rely on the `surface` hierarchy. If you feel the need to draw a line, try adding 16px of space instead.
 
---
**Director's Note:** Every pixel must justify its existence. If an element doesn't help the user make a better investment decision, remove it. Elegance is refusal.```