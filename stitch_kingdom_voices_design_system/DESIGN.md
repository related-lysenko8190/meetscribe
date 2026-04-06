# Design System Strategy: The Living Blueprint

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Living Blueprint."** 

This system rejects the sterile, "perfect" finish of modern SaaS platforms in favor of a high-end editorial experience that celebrates the process of creation. It is a visual dialogue between engineering precision (the grid, the mono-spaced data, the sharp edges) and human intuition (the handwritten note, the ink bleed, the intentional asymmetry). 

We are not building a static interface; we are designing a digital drafting table. By utilizing a **0px border-radius** across the entire ecosystem, we evoke the sharpness of cut vellum and professional schematics. The experience should feel like a high-fidelity technical document that has been personally reviewed and annotated by a master craftsman.

## 2. Colors & Surface Philosophy
The palette is rooted in the physical materials of a design studio: paper, graphite, and technical ink.

### The Tonal Hierarchy
*   **Paper & Ink:** Use `surface` (#FAF9F5) as your base "canvas." All primary interactions and text use `on-surface` (#1A1C1A) to mimic heavy ink.
*   **The Annotation Accent:** `primary_container` (#FF6B00) is reserved exclusively for emphasis, action, and human "mark-making." It should feel like a highlighter or a red-pen correction on a technical drawing.
*   **Ruler & Construction:** Use `outline_variant` (#E2BFB0) and `secondary_fixed_dim` (#C9C6C3) for non-structural guides, such as grid lines and protractor motifs.

### The "No-Line" Rule & Surface Nesting
While the prompt mentions drafting boxes, avoid using 1px borders to define the primary global layout. Instead:
*   **Structural Nesting:** Define large content areas through background shifts. Place a `surface_container_low` (#F4F4F0) section against a `surface` (#FAF9F5) background. 
*   **The Ghost Border:** For internal containment, use the `outline_variant` token at 20% opacity. This creates a "hairline" guide that feels like a pencil mark rather than a digital stroke.
*   **Glassmorphism:** For floating annotations or "sticky notes," use `surface_container_lowest` (#FFFFFF) with a 15% opacity and a 20px backdrop blur. This mimics the look of tracing paper overlaid on a technical drawing.

## 3. Typography: The Dual-Layer Narrative
The typography system functions as two distinct layers of information: the **Official Record** and the **Human Commentary.**

*   **The Official Record (Technical):** 
    *   **Display & Headlines:** Use **Epilogue** (from the technical scale) for authoritative headers. This provides a clean, architectural foundation. 
    *   **Technical Data:** Use **Space Mono** (or **Space Grotesk** from the scale) for all body text, metadata, and labels. The monospaced nature reinforces the "drafting-table" precision.
*   **The Human Commentary (Expressive):**
    *   **Editorial Moments:** Use **Caveat** for primary display moments where the brand's "voice" needs to break the grid.
    *   **Annotations:** Use **Nanum Pen Script** for notes, "corrections," and marginalia. These elements must always be treated as secondary layers, often rotated ±5deg to break the rigid horizontal flow.

## 4. Elevation & Depth: Tonal Layering
In this system, depth is not created by light and shadow, but by the **stacking of materials.**

*   **The Layering Principle:** 
    *   Level 0: The Grid (`surface_container_low` with `ruler/construction` lines).
    *   Level 1: The Paper (`surface`).
    *   Level 2: The Vellum/Overlays (`surface_container_highest` or Glassmorphism).
*   **Ambient Shadows:** Standard drop shadows are forbidden. If an element must float (like a modal or a floating action button), use a tinted shadow: `on_surface` at 4% opacity with a 40px blur and 0px offset. It should look like a sheet of paper casting a soft, natural glow on the table.
*   **Signature Textures:** Apply a global background texture of "Ink Stains"—blurred black blobs at 3% opacity—to the `surface_container_lowest` layer to provide organic warmth.

## 5. Components & Drafting Patterns

### The Drafting Box (Core Primitive)
Instead of standard cards, use "Section Boxes." 
*   **Style:** 1px `graphite` border (#A0A09A).
*   **Labeling:** Floating labels (`label-sm` in Space Mono) positioned exactly on the top-left border line, breaking the stroke.
*   **Corners:** Strictly **0px radius**.

### Buttons: The "Stamp"
*   **Primary:** `primary` (#A04100) background with `on_primary` (#FFFFFF) text. No rounded corners.
*   **States:** On hover, shift to `primary_container` (#FF6B00). The transition should be instant (0ms or 50ms) to mimic the tactile feel of a physical stamp.
*   **Secondary:** 1px `ink` border with no background.

### Annotations & Process Marks
*   **The "Note" Component:** Absolute positioned text using `Nanum Pen Script`. 
*   **Construction Lines:** Use 1px `ruler/construction` lines that extend slightly beyond the edges of the content boxes, suggesting they are still being "measured."
*   **Protractor Motifs:** Use large, semi-transparent (5% opacity) circular strokes in the background of hero sections to create a sense of mathematical scale.

### Input Fields
*   **Style:** A single bottom border using `ink` (#1A1A18). 
*   **Interaction:** When focused, the label should transform into a `Nanum Pen Script` annotation in `Accent Orange`, as if a person is hand-writing the prompt.

## 6. Do's and Don'ts

### Do:
*   **Embrace the Grid:** Use the 40px grid to align all major elements, but allow "handwritten" notes to intentionally ignore it.
*   **Vary Text Rotation:** Rotate annotations slightly (±2-5 degrees). Perfect alignment kills the "hand-drawn" illusion.
*   **Use High Contrast:** Keep the technical layer (Ink on Paper) high contrast for maximum readability and a premium "printed" feel.

### Don't:
*   **No Rounded Corners:** Never use `border-radius`. Everything is cut sharp.
*   **No Generic Shadows:** Avoid CSS `box-shadow` defaults. Use tonal shifts and ghost borders instead.
*   **Don't Over-Decorate:** The "ink stains" and "ruler lines" should feel like artifacts of work, not "clipart." If a motif doesn't serve a conceptual purpose, remove it.
*   **No Dividers:** Never use a standard horizontal rule to separate list items. Use 24px of vertical white space or a subtle shift from `surface` to `surface_container_low`.

---
*Director's Note: This system is a balance of rigor and soul. The junior designer’s tendency will be to make it too messy or too rigid. Your job is to find the tension—the point where the technical drawing is interrupted by the human hand.*