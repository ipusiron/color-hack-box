# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Color Hack Box** is an interactive educational tool for learning color theory through RGB and HSL color space manipulation. Features 3D RGB cube visualization and color similarity calculations. Part of the "生成AIで作るセキュリティツール200" project.

**Live Demo**: https://ipusiron.github.io/color-hack-box/

## Development Setup

This is a pure HTML/CSS/JavaScript application with **no dependencies or build process**.

**IMPORTANT**: This application requires an HTTP server. Opening `index.html` directly via `file://` will not work due to fetch() restrictions.

```bash
# Start a local server
python -m http.server 8000
# Then visit http://localhost:8000
```

### Manual Testing Checklist

No automated tests exist. Key areas to test:
1. RGB sliders and 3D cube visualization (Tab 1)
2. Color similarity calculator with 3D comparison (Tab 1)
3. HSL sliders and real-time color preview (Tab 2)
4. Grayscale slider and preset buttons (Tab 3)
5. Color wheel hover interactions (complementary/analogous)
6. Copy buttons and toast notifications
7. Accordion open/close (60 sections across 8 tabs)
8. Responsive layout at 600px and 768px breakpoints
9. Tab navigation and lazy loading (check Network tab in DevTools)

## Architecture

### File Structure

```
color-hack-box/
  index.html              (~160 lines - shell only)
  script.js               (~1,500 lines - TabLoader, PaletteRenderer, core logic)
  style.css               (unchanged - responsive design)
  tabs/
    tab1-rgb.html         (RGB color space content)
    tab2-basics.html      (HSL basics content)
    tab3-grayscale.html   (Grayscale content)
    tab4-psychology.html  (Color psychology content)
    tab5-tone.html        (Tone palettes content)
    tab6-ratio.html       (Color ratio content)
    tab7-palettes.html    (Data-driven template)
    tab8-misc.html        (Miscellaneous content)
  data/
    palettes.json         (Palette definitions for Tab 7)
```

### Modular Architecture

The application uses a lazy-loading architecture:

1. **index.html (Shell)**: Contains only navigation, empty tab containers, and footer
2. **TabLoader**: Fetches tab HTML files on-demand with caching
3. **PaletteRenderer**: Reads `palettes.json` and generates Tab 7 content dynamically
4. **Tab HTML files**: Self-contained content (header + accordions) per tab

### Key Modules (script.js)

```javascript
// TabLoader - Lazy loads tab content
const TabLoader = {
  cache: new Map(),           // Cache for loaded HTML
  load(tabId),                // Fetch tab HTML with caching
  renderTab(tabId, container), // Render tab and initialize components
  initializeTabComponents(tabId) // Tab-specific initialization
};

// PaletteRenderer - JSON-driven palette rendering
const PaletteRenderer = {
  data: null,                 // Cached palette data
  loadData(),                 // Fetch palettes.json
  createPaletteHTML(palette), // Generate single palette HTML
  renderAll()                 // Render all palette sections
};
```

### Color Conversion Pipeline

```
RGB Input → rgbToHsl() → HSL Display
HSL Input → hslToRgb() → rgbToHex() → UI Update
```

**Global state** (script.js):
- HSL mode: `hue` (0-360°), `lightness` (0-100%), `saturation` (0-100%)
- RGB mode: `rgbRed`, `rgbGreen`, `rgbBlue` (0-255)

**Key functions**:
- `hslToRgb(h, s, l)` - HSL to RGB conversion with hue2rgb helper
- `rgbToHsl(r, g, b)` - RGB to HSL conversion
- `rgbToHex(r, g, b)` - RGB to uppercase HEX format
- `updateColor()` - HSL mode orchestrator that syncs all UI elements
- `updateRGBColor()` - RGB mode orchestrator with 3D cube sync
- `initializeSimilarityCalculator()` - Cosine similarity and Euclidean distance
- `showToast(message)` - Toast notifications (2-second display)

### Tab Structure

| Tab | Name | Key Features |
|-----|------|--------------|
| 1 | RGBカラースペース | RGB sliders, 3D cube visualization, color similarity calculator |
| 2 | 基礎（色の三要素） | HSL sliders, complementary/analogous color wheels |
| 3 | 無彩色（グレースケール） | Grayscale slider, 5 preset buttons |
| 4 | 色の印象と心理 | Color psychology, association tags |
| 5 | トーン別パレット | 3x3 tone map, tone-based color grids |
| 6 | 配色と比率 | 70:25:5 and 60:30:10 ratio visualizations |
| 7 | 配色例・目的別パレット | JSON-driven palettes by purpose/industry/season/mood |
| 8 | 雑学・補足 | Cultural differences, color vision, RGB vs CMYK |

### Interactive Features

- **3D RGB Cube**: Drag to rotate, displays current color position in 3D space
- **Color Similarity Calculator**: Compares two colors using cosine similarity and Euclidean distance
- **Color Wheels**: 12 segments (30° each), hover highlights complementary (±180°) or analogous (±30°)
- **Accordion System**: Native `<details>/<summary>` with CSS animations
- **Copy Functionality**: Clipboard API with textarea fallback, toast feedback
- **Tab Management**: Lazy loading with active state and auto-scroll to center

### Responsive Breakpoints

- Desktop (>768px): Full 2-column layouts
- Tablet (600-768px): Adjusted grids
- Mobile (<600px): Stacked layouts, touch-optimized (`touch-action: none` on sliders)

## Code Conventions

- **UI text**: Japanese
- **Code**: English variable/function names
- **Color formats**: HEX uppercase with # (`#FF5733`), RGB/HSL with labels for display
- **Accessibility**: WCAG AA contrast ratios

## Common Tasks

### Adding a New Tab

1. **Create tab HTML file** in `tabs/`:
   ```html
   <!-- tabs/tab9-newfeature.html -->
   <header class="fh-header">
     <h2>New Feature Title</h2>
     <p>Description of the tab content.</p>
   </header>

   <div class="main-accordion-section">
     <details class="accordion-item main-accordion">
       <summary>Section Title</summary>
       <div class="accordion-content">
         <!-- Content here -->
       </div>
     </details>
   </div>
   ```

2. **Add tab button** in `index.html`:
   ```html
   <button class="tab-btn" data-tab="tab9" aria-label="New Feature">
     <span class="tab-number">9</span>
     <span class="tab-text">New Feature</span>
   </button>
   ```

3. **Add empty container** in `index.html`:
   ```html
   <section id="tab9" class="tab-content">
   </section>
   ```

4. **Register in TabLoader** (script.js):
   ```javascript
   // In getTabFileName():
   'tab9': 'tab9-newfeature.html',
   ```

5. **Add initialization** if needed (script.js):
   ```javascript
   // In initializeTabComponents():
   case 'tab9':
     initializeNewFeature();
     break;
   ```

### Adding a Color Palette (Tab 7)

Add to `data/palettes.json`:

```json
{
  "purpose": [
    {
      "icon": "🎯",
      "title": "New Category",
      "description": "Description of this palette category.",
      "palettes": [
        {
          "name": "Palette Name",
          "colors": [
            { "hex": "#FF5733", "role": "Base" },
            { "hex": "#3498DB", "role": "Main" },
            { "hex": "#2ECC71", "role": "Accent" }
          ],
          "usage": "Usage description"
        }
      ]
    }
  ]
}
```

### Lazy Loading Verification

To verify lazy loading works correctly:
1. Open DevTools Network tab
2. Navigate to a different tab
3. Confirm the tab HTML file is fetched only once
4. Same tab click should not trigger another fetch (cached)

## Deployment

GitHub Pages auto-deploys from `main` branch. The `.nojekyll` file prevents Jekyll processing.

**Note**: GitHub Pages serves files via HTTPS, so fetch() works correctly in production.
