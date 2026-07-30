---
name: framer-webflow-export
description: >-
  Instructs the agent on how to write custom components and layout architectures that are fully
  compatible with visual design systems like Framer and Webflow. Covers custom code embeds,
  custom styling variables, Framer React property controls, CMS integration, and clean export structures.
---

# Framer & Webflow Integration & Export Skill

## Overview
This skill outlines the technical architecture required to export high-quality custom code directly into visual development platforms like **Framer** and **Webflow**. It bridges the gap between raw web engineering and visual designers, ensuring that custom integrations are easy to maintain, style, and scale inside visual builders.

---

## 1. Webflow Custom Code & Embed Architecture

### A. BEM & Clean Naming Conventions
Webflow's visual builder is built on top of CSS classes. When writing code destined for Webflow embeds or custom styling:
- Use clean, structured class names (BEM is highly recommended: e.g., `card-premium__title`).
- Avoid ID selectors for global styling; rely on clean utility classes.
- Prefix all custom classes with a project identifier (e.g., `db-` for Dubola, `el-` for EliteOS) to prevent collisions with Webflow's native helper classes.

### B. Dynamic Styles in Custom Embeds
When creating customized cards or interactive sliders that users insert into Webflow HTML embeds, wrap them in clean, self-contained components:
```html
<!-- Self-contained Webflow Custom Embed Example -->
<div class="db-premium-glow-card">
  <h3 class="db-premium-glow-card__title">Interactive Element</h3>
  <p class="db-premium-glow-card__body">This component is styled dynamically.</p>
</div>

<style>
  .db-premium-glow-card {
    --card-glow-color: rgba(99, 102, 241, 0.15);
    background: #0d0e12;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 24px;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .db-premium-glow-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px var(--card-glow-color);
    border-color: rgba(99, 102, 241, 0.3);
  }
  .db-premium-glow-card__title {
    color: #ffffff;
    font-family: inherit; /* Inherits Webflow's typography settings */
    font-size: 1.25rem;
    margin-bottom: 8px;
  }
  .db-premium-glow-card__body {
    color: #a1a1aa;
    font-size: 0.95rem;
    line-height: 1.5;
  }
</style>
```

---

## 2. Framer Custom Code Components (React)
Framer allows importing custom React components directly. To make them fully customizable by a visual designer in Framer, always export `PropertyControls`.

### A. Framer Component Template
Create component files using the following format:
```tsx
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

// 1. Define Props with defaults
interface PremiumButtonProps {
    text: string
    variant: "primary" | "secondary"
    glowColor: string
    onClick?: () => void
}

// 2. Implement the component
export function PremiumButton(props: PremiumButtonProps) {
    const { text, variant, glowColor, onClick } = props

    const buttonStyle: React.CSSProperties = {
        padding: "12px 24px",
        borderRadius: "8px",
        fontWeight: 600,
        fontFamily: "inherit",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        border: variant === "primary" ? "none" : "1px solid rgba(255,255,255,0.15)",
        background: variant === "primary" ? "linear-gradient(135deg, #6366f1, #a855f7)" : "transparent",
        color: "#ffffff",
        boxShadow: variant === "primary" ? `0 4px 15px ${glowColor}` : "none",
    }

    return (
        <button 
            style={buttonStyle}
            onClick={onClick}
            onMouseEnter={(e) => {
                if (variant === "primary") {
                    e.currentTarget.style.transform = "scale(1.05)"
                    e.currentTarget.style.boxShadow = `0 8px 25px ${glowColor}`
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)"
                e.currentTarget.style.boxShadow = variant === "primary" ? `0 4px 15px ${glowColor}` : "none"
            }}
        >
            {text}
        </button>
    )
}

// 3. Define visual properties for Framer Editor UI
addPropertyControls(PremiumButton, {
    text: {
        type: ControlType.String,
        title: "Button Text",
        defaultValue: "Discover More",
    },
    variant: {
        type: ControlType.Enum,
        title: "Style Variant",
        defaultValue: "primary",
        options: ["primary", "secondary"],
        optionTitles: ["Solid Gradient", "Ghost Outline"],
    },
    glowColor: {
        type: ControlType.Color,
        title: "Glow Ambient Color",
        defaultValue: "rgba(99, 102, 241, 0.3)",
    }
})
```

---

## 3. Best Practices & Pitfalls to Avoid
1. **Font Settings:** Always use `font-family: inherit` inside custom CSS so that the typography respects the Webflow / Framer site-wide font configurations chosen by the designer.
2. **Absolute Resizing:** Ensure exported components are fluid (`width: 100%`, `height: 100%`) or responsive, letting the visual builder's parent layout wrapper control size constraints.
3. **External Dependencies:** When using external scripts (e.g., Lottie, GSAP, or Spline), load them asynchronously and ensure they do not cause multiple instances or block site rendering.
