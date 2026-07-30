---
name: ux-ui-premium-design
description: >-
  Provides the agent with precise design directives to construct premium websites that 'WOW' users.
  Includes Awwwards-level typography, dynamic HSL colors, glassmorphism, responsive UX rules,
  and a masterclass collection of 9 'Aesthetic Master Blueprints' from legendary designers
  and art directors (Dieter Rams, Tobias van Schneider, Claudio Guglieri, Jessica Walsh, Kenya Hara,
  Virgil Abloh, Zaha Hadid, David Carson, and Es Devlin).
---

# Premium UX/UI & Art-Directed Visual Design Skill

## Overview
This skill guides the agent in crafting high-end, premium web applications that prioritize visual excellence, immersive aesthetics, and flawless user experiences. It enables the agent to act as a world-class front-end engineer and art director, adopting specific design philosophies from legendary designers and studios.

---

## Aesthetic Master Blueprints
When requested to design an interface, adopt one of the following master-level aesthetic blueprints:

### 1. Dieter Rams: Minimalist Functionalism & Clarity
* **Visual Philosophy:** "Less, but better" (*Weniger, aber besser*). Absolute utility, invisible interface, structural elegance, and timelessness.
* **Implementation Directives:**
  - **Grid & Layout:** Rigid grid alignments (8px / 16px margins), plenty of whitespace (breathing room), stark asymmetrical layouts.
  - **Typography:** Strict sans-serif system (e.g., *Helvetica Neue*, *Inter*, *System UI*) with precise font weight and scale contrasts.
  - **Colors:** Dominant monochrome or neutral tones (pure whites `#FFFFFF`, deep graphite `#1A1A1A`, cool greys) with exactly **one** accent color (e.g., international orange or cadmium yellow) used sparingly for interactive cues.
  - **UI Elements:** Clean borders, zero decorations, micro-borders (`1px solid rgba(0,0,0,0.1)`), and absolute clarity of function.

### 2. Tobias van Schneider: Atmospheric Storytelling & Deep Contrast
* **Visual Philosophy:** Cinematic dark modes, mysterious and moody atmospheric colors, bold typography, and narrative-driven structures.
* **Implementation Directives:**
  - **Grid & Layout:** Full-bleed layouts, hero screens dominated by high-impact visuals and massive copy, card layouts with ambient dark-depth layering.
  - **Typography:** High-contrast combinations (e.g., an elegant serif header like *Playfair Display* or *Outfit* combined with a sleek sans-serif body).
  - **Colors:** Deep volcanic dark themes (`#0B0B0C`, `#0D0E12`), glowing accents (nebula blues, deep purples, emeralds), and subtle colored glow shadows (`box-shadow: 0 8px 32px rgba(88, 101, 242, 0.15)`).
  - **UI Elements:** Seamless background image overlays, soft radial gradient spotlights (`background: radial-gradient(circle at top right, rgba(255,255,255,0.05), transparent)`), and immersive media.

### 3. Claudio Guglieri & Locomotive: Editorial Interactivity & Fluid Motion
* **Visual Philosophy:** Awwwards-winning high-production values, editorial magazine-like layouts, fluid transitions, and playful but structured motion.
* **Implementation Directives:**
  - **Grid & Layout:** Dynamic editorial grids, overlapping elements, container queries, large side margins, and off-grid graphic highlights.
  - **Typography:** Editorial sans/serif pairs (e.g., *Sora*, *Syne*, *Clash Display*) with letter-spacing tweaks (`letter-spacing: -0.03em`) for a premium print feel.
  - **Colors:** Sophisticated natural tones (sand, soft terracotta, sage green, midnight blue) that feel warm and curated.
  - **Motion & Micro-animations:** Highly organic timing functions (e.g., `cubic-bezier(0.25, 1, 0.5, 1)` - Ease Out Quad; or spring curves). Dynamic hover underlines, image-scaling on hover, smooth scroll reveals.

### 4. Jessica Walsh: Bold Expressiveness & Vibrance
* **Visual Philosophy:** Emotionally charged, highly colorful, surreal, and daring interfaces that reject dull templates.
* **Implementation Directives:**
  - **Grid & Layout:** Playful, stacked elements, floating cards, high density of visual blocks, expressive vector decorations.
  - **Typography:** Highly stylized headers (e.g., *Cabinet Grotesk*, *Syne*, *Space Grotesk*) paired with clear body text.
  - **Colors:** Vibrant, harmonious multi-color palettes (dynamic HSL pairs: e.g., warm coral `hsl(14, 100%, 57%)` paired with deep electric indigo `hsl(235, 100%, 60%)`). High contrast, saturated gradients.
  - **UI Elements:** Thick shadows (`box-shadow: 4px 4px 0px #000000`), bold retro-future borders, high-contrast buttons, and tactile elements.

### 5. Kenya Hara: Zen Emptiness & Silent Utility
* **Visual Philosophy:** The concept of "Emptiness" (*Ma*). Rather than simple minimalism, design the site as a calm, empty vessel that is filled by the user's focus. Tactile sensory cleanliness.
* **Implementation Directives:**
  - **Grid & Layout:** Vast open spaces (up to 70% empty viewport), extreme margins, off-center positioning that feels natural and relaxed.
  - **Typography:** Ultra-thin, highly spaced letterings (e.g., *Noto Serif*, *Cinzel*, *Lora* with `letter-spacing: 0.15em; font-weight: 300`).
  - **Colors:** Dominance of paper-like white backgrounds, warm oatmeals, soft shadows, and light slate greys. Avoid pure black text; use soft charcoal (`#2E3033`).
  - **UI Elements:** Almost invisible borders (`0.5px solid rgba(0,0,0,0.05)`), extremely quiet transitions (linear fades over 0.6s), and raw nature imagery.

### 6. Virgil Abloh: Industrial Deconstruction & Post-Modern Irony
* **Visual Philosophy:** Exposed construction grids, meta-commentary, technical annotations, and high-street industrial contrast.
* **Implementation Directives:**
  - **Grid & Layout:** Layouts showing the underlying grid structure (e.g., literal gridlines dividing sections like a blueprint), visible layout coordinates, and overlapping technical panels.
  - **Typography:** Strict use of *Helvetica Neue Bold*, *Space Mono*, or *Courier* in uppercase. Frequent use of double quotes for ironic framing (e.g., `"HERO"` or `"SUBMIT"`).
  - **Colors:** Technical base (pure white and charcoal) slashed with high-visibility safety colors (Safety Orange `hsl(24, 100%, 50%)`, Warning Yellow `hsl(45, 100%, 50%)`, or Neon Lime).
  - **UI Elements:** Technical labels detailing pixel size (e.g., small text `[width: 320px]`), crosshair graphic elements `+`, raw exposed borders, and tag-like UI blocks.

### 7. Zaha Hadid: Fluid Parametricism & Organic Futurism
* **Visual Philosophy:** Non-Euclidean geometry, sweeping dynamic curves, architectural perspective shifts, and futuristic fluid motions.
* **Implementation Directives:**
  - **Grid & Layout:** Breaking the horizontal box model. Use angled grid divisions (`transform: skewY(-4deg)`), curved clipping masks (`clip-path: ellipse(...)`), and flowing asymmetric paths.
  - **Typography:** Modern, rounded-geometric typefaces (e.g., *Outfit*, *Syne*, *Syncopate*).
  - **Colors:** Iridescent luminous gradients, metallic silvers, glowing turquoise, and deep obsidian dark backgrounds.
  - **Motion & Micro-animations:** High kinetic energy. Sliding kinetic panel reveals, liquid hover effects, elastic custom Bezier curves (`cubic-bezier(0.68, -0.6, 0.32, 1.6)`).

### 8. David Carson: Experimental Expressive Grunge & Typographic Art
* **Visual Philosophy:** Rejecting traditional grids and rules of legibility for raw emotional typographic expression. The web page as an artistic canvas.
* **Implementation Directives:**
  - **Grid & Layout:** Collaged layouts, deliberately overlapping text blocks, cropped graphics, and rotated or skewed panels.
  - **Typography:** Fractured and layered headers where characters overlap (`margin-right: -0.08em`), combining serif, sans-serif, and mono in the same sentence for contrast.
  - **Colors:** Moody, textured color schemes (rust red, sand beige, charcoal, faded olive, navy). High contrast distress.
  - **UI Elements:** Distressed text elements, diagonal menu systems, raw layout textures, and expressive structural elements.

### 9. Es Devlin: Theatrical Lighting & Volumetric Scale
* **Visual Philosophy:** Vast scale contrasts (gigantic elements paired with tiny details), high-drama spotlight effects, volumetric shadows, and cinematic spatial depth.
* **Implementation Directives:**
  - **Grid & Layout:** Centered stage layouts, cards floating in deep negative space, dramatic vertical columns resembling stage pillars.
  - **Typography:** Cinematic, thin display fonts (e.g., *Cormorant Garamond*, *Outfit* with `font-weight: 200`) in massive scale, contrasted with tiny structural details.
  - **Colors:** High-contrast theatrical spotlighting (deep velvet black `#050505` illuminated by glowing white, red, or warm amber radial gradients).
  - **UI Elements:** Box shadows representing dramatic directional light sources (`box-shadow: 0 40px 100px -20px rgba(255,0,0,0.15)`), thin luminous neon borders, and dark spatial layers.

---

## Technical Design Token Specifications

### 1. Typography Hierarchy (Fluid Scale)
Always define typography using fluid sizes via `clamp()` to ensure elegant scaling from mobile to ultra-wide displays:
```css
:root {
  --font-display: 'Outfit', sans-serif;
  --font-body: 'Inter', sans-serif;

  /* Fluid sizes: min size (mobile), scalable factor, max size (desktop) */
  --fs-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --fs-sm: clamp(0.875rem, 0.8rem + 0.35vw, 1rem);
  --fs-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --fs-md: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --fs-lg: clamp(1.75rem, 1.5rem + 1vw, 2.25rem);
  --fs-xl: clamp(2.5rem, 2rem + 2.5vw, 4.5rem);
}
```

### 2. Glassmorphism Engine (Premium UI Depth)
To implement a high-end glass look, combine background opacity, backdrop filters, and dual-layered borders:
```css
.premium-glass-card {
  background: rgba(255, 255, 255, 0.04); /* or rgba(0,0,0,0.3) for dark mode */
  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 4px 30px rgba(0, 0, 0, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.05);
  border-radius: 16px;
}
```

### 3. Dynamic Color System (Harmonious HSL)
Use CSS Custom Properties with HSL for flexible, programmatic control over dark/light schemes and states:
```css
:root {
  --hue: 250; /* Adjust to shift whole app theme */
  --primary: hsl(var(--hue), 85%, 60%);
  --primary-glow: hsla(var(--hue), 85%, 60%, 0.15);
  --background: hsl(var(--hue), 20%, 8%);
  --surface: hsl(var(--hue), 15%, 12%);
  --surface-hover: hsl(var(--hue), 15%, 16%);
  --text: hsl(var(--hue), 10%, 94%);
  --text-muted: hsl(var(--hue), 8%, 65%);
}
```

### 4. Interactive Micro-Animations
Avoid default transitions. Use professional ease-out spring curves for natural physics:
```css
.interactive-element {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
              background-color 0.3s ease,
              box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.interactive-element:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px var(--primary-glow);
}
```

---

## Checklist for Premium Deliverables
1. **Pristine First Glance:** Does the hero section instantly evoke a high production value (typography, spacing, contrast)?
2. **Harmonious Palettes:** Are the colors unified, avoiding generic, raw CSS saturated primary colors?
3. **Typography Rule:** Is browser-default Times or standard Arial avoided in favor of modern Google Fonts?
4. **Motion Polish:** Are hover states fluid, smooth, and micro-animated instead of instantaneous or jerky?
5. **Dark Mode Depth:** Do dark modes use soft grays/blues (`#0D0E12`) rather than pure `#000000`?
