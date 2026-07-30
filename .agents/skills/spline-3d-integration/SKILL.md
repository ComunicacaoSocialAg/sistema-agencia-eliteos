---
name: spline-3d-integration
description: >-
  Provides the agent with precise templates and optimized implementation strategies to integrate,
  manage, and optimize interactive 3D elements using Spline in modern web interfaces.
  Covers script loading, responsive overlays, dynamic event listeners, and performance optimizations.
---

# Interactive Spline 3D Integration Skill

## Overview
This skill provides structured guidelines and boilerplate templates for integrating interactive 3D elements from **Spline** into modern web pages. It ensures that 3D assets load fast, look seamless, adapt to screens, and respond programmatically to web interactions (like hover or clicks).

---

## 1. Core Web Component Implementation (Vanilla/HTML)

The standard and most performant way to load a Spline scene in a standard HTML project is using the official `<spline-viewer>` web component.

### Elegant Spline Embed Template
Use this template to embed a Spline canvas with a fluid glassmorphism container and elegant placeholder styling:

```html
<!-- Wrapper to constraint size and style position -->
<div class="spline-wrapper">
  <!-- Loading state indicator -->
  <div class="spline-loading" id="spline-loader">
    <div class="spline-spinner"></div>
    <span>Loading 3D Experience...</span>
  </div>

  <!-- Spline Web Component -->
  <spline-viewer 
    id="main-3d-canvas" 
    url="https://prod.spline.design/your-scene-id/scene.splinecode"
    loading-to-reveal>
  </spline-viewer>
</div>

<style>
  .spline-wrapper {
    position: relative;
    width: 100%;
    height: clamp(400px, 60vh, 700px);
    background: radial-gradient(circle at center, #1b1c22, #0d0e12);
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  /* Absolute centered loading state */
  .spline-loading {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: rgba(255, 255, 255, 0.7);
    font-family: 'Outfit', sans-serif;
    font-size: 0.95rem;
    z-index: 10;
    transition: opacity 0.5s ease;
  }

  .spline-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top: 3px solid #6366f1;
    border-radius: 50%;
    animation: spline-spin 1s linear infinite;
  }

  @keyframes spline-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  spline-viewer {
    width: 100%;
    height: 100%;
  }
</style>

<script type="module" src="https://unpkg.com/@splinetool/viewer@1.0.28/build/spline-viewer.js"></script>
<script>
  // Hide loader once the 3D scene completes loading
  const splineViewer = document.getElementById('main-3d-canvas');
  const splineLoader = document.getElementById('spline-loader');
  
  if (splineViewer && splineLoader) {
    splineViewer.addEventListener('load', () => {
      splineLoader.style.opacity = '0';
      setTimeout(() => splineLoader.remove(), 500);
    });
  }
</script>
```

---

## 2. Programmatic Interaction via JavaScript API

For premium interactive interfaces, the web page should interact programmatically with the 3D scene (e.g., clicking a HTML button changes a state in the 3D model).

### Triggering Spline States and Animations
Once the Spline viewer loads, you can access the underlying Application instance to trigger events:

```javascript
import { Application } from '@splinetool/runtime';

// Initialize via runtime for fine-grained JS control
const canvas = document.getElementById('canvas3d');
const splineApp = new Application(canvas);

splineApp.load('https://prod.spline.design/your-scene-id/scene.splinecode')
  .then(() => {
    console.log('Spline scene successfully loaded!');
    
    // Example: Click an HTML button to trigger a 3D state
    const actionBtn = document.getElementById('btn-transform');
    actionBtn.addEventListener('click', () => {
      // Find object by name (defined inside Spline editor)
      const meshObject = splineApp.findObjectByName('MainHeroSphere');
      if (meshObject) {
        // Trigger a pre-configured state transition in Spline
        splineApp.emitEvent('click', 'MainHeroSphere');
      }
    });
  });
```

---

## 3. High-Performance Optimization Checklist
3D in a browser is computationally expensive. Always implement the following performance best practices:

1. **Lazy Loading:** Do not load the Spline runtime/scripts unless the canvas container is in or near the user's viewport.
   - Use `IntersectionObserver` to defer setting the `url` attribute of the `<spline-viewer>` component until it is visible.
2. **Disable Non-Essential Controls:** Set appropriate attributes on the viewer to avoid wasting CPU/GPU cycles on mouse tracking if not needed:
   - Disable pan: `unload-pan`
   - Disable zoom: `unload-zoom`
   - Set hints: `hint="false"`
3. **Handle Mobile Responsiveness:** Mobile GPUs struggle with complex scenes. Scale down canvas rendering resolution or simplify the scene:
   - On screens smaller than 768px, use CSS to hide the heavy interactive 3D canvas and display a fallback highly optimized visual or flat PNG screenshot of the render.
4. **Pointer Events Configuration:** To allow users to scroll past the 3D canvas on mobile without getting "stuck" inside the rotation navigation context, specify CSS touch actions:
   ```css
   spline-viewer {
     pointer-events: none; /* Allow click-through to parent page scrolling */
   }
   /* Enable mouse interaction only when element is in focus or hover */
   .spline-wrapper:hover spline-viewer {
     pointer-events: auto;
   }
   ```
