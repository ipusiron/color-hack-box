# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Color Hack Box** is an interactive educational tool for learning color theory through HSL (Hue, Saturation, Lightness) manipulation. Part of the "生成AIで作るセキュリティツール200" project.

**Live Demo**: https://ipusiron.github.io/color-hack-box/

## Development Setup

This is a pure HTML/CSS/JavaScript application with **no dependencies or build process**.

```bash
# Direct browser open (macOS)
open index.html

# Or use a local server
python -m http.server 8000
# Then visit http://localhost:8000
```

### Manual Testing Checklist

No automated tests exist. Key areas to test:
1. HSL sliders and real-time color preview (Tab 1)
2. Grayscale slider and preset buttons (Tab 2)
3. Color wheel hover interactions (complementary/analogous)
4. Copy buttons and toast notifications
5. Accordion open/close (44 sections across 7 tabs)
6. Responsive layout at 600px and 768px breakpoints
7. Tab navigation and scroll behavior

## Architecture

### Core Files

- **index.html** - Complete UI with 7 tabs, 44 accordions, color wheels, and palettes
- **script.js** - Color conversion, tab management, copy functionality, interactive wheels
- **style.css** - Responsive design, accordion styles, color chip layouts

### Color Conversion Pipeline

```
User Input → HSL State → hslToRgb() → rgbToHex() → UI Update
```

**Global state** (script.js): `hue` (0-360°), `lightness` (0-100%), `saturation` (0-100%)

**Key functions**:
- `hslToRgb(h, s, l)` - HSL to RGB conversion with hue2rgb helper
- `rgbToHex(r, g, b)` - RGB to uppercase HEX format
- `updateColor()` - Main orchestrator that syncs all UI elements
- `showToast(message)` - Toast notifications (2-second display)

### Tab Structure

| Tab | Name | Key Features |
|-----|------|--------------|
| 1 | 基礎（色の三要素） | HSL sliders, complementary/analogous color wheels |
| 2 | 無彩色（グレースケール） | Grayscale slider, 5 preset buttons |
| 3 | 色の印象と心理 | Color psychology, association tags |
| 4 | トーン別パレット | 3x3 tone map, tone-based color grids |
| 5 | 配色と比率 | 70:25:5 and 60:30:10 ratio visualizations |
| 6 | 配色例・目的別パレット | 50+ palettes by purpose/industry/season/mood |
| 7 | 雑学・補足 | Cultural differences, color vision, RGB vs CMYK |

### Interactive Features

- **Color Wheels**: 12 segments (30° each), hover highlights complementary (±180°) or analogous (±30°)
- **Accordion System**: Native `<details>/<summary>` with CSS animations
- **Copy Functionality**: Clipboard API with textarea fallback, toast feedback
- **Tab Management**: Active state with auto-scroll to center

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

1. Add button in `.tab-navigation` with `data-tab="tabN"`
2. Add section with `id="tabN"` and `class="tab-content"`
3. Include `.fh-header` for consistent styling
4. Add accordion sections with `.main-accordion` class

### Adding a Color Palette (Tab 6)

```html
<div class="palette-example">
  <div class="palette-header">Palette Name</div>
  <div class="palette-colors">
    <div class="palette-chip" style="background: #COLOR">
      <span class="chip-code">#COLOR</span>
      <span class="chip-role">Role</span>
    </div>
    <!-- more chips -->
  </div>
  <p class="palette-usage">Description</p>
</div>
```

## Deployment

GitHub Pages auto-deploys from `main` branch. The `.nojekyll` file prevents Jekyll processing.