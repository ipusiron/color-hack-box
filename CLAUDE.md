# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Color Hack Box** is an interactive educational tool for learning color theory through HSL (Hue, Saturation, Lightness) manipulation. Part of the "生成AIで作るセキュリティツール200" (200 Security Tools with Generative AI) project - Day 101.

**Live Demo**: https://ipusiron.github.io/color-hack-box/

## Development Setup

This is a pure HTML/CSS/JavaScript application with **no dependencies or build process**.

### Running Locally

```bash
# Direct browser open (macOS)
open index.html

# Or use a local server
python -m http.server 8000
# Then visit http://localhost:8000

# Node.js alternative
npx http-server
```

### Testing

No automated test suite exists. Manual testing checklist:
1. Adjust Hue/Lightness/Saturation sliders
2. Verify color chip updates in real-time
3. Check HEX/RGB/HSL code displays match
4. Test "ランダム生成" (Random) and "リセット" (Reset) buttons
5. Verify responsive layout on mobile/tablet viewports

## Architecture

### Core Files

- **index.html** - UI structure with sliders, color preview, and educational accordion
- **script.js** - Color conversion logic and event handling
- **style.css** - Responsive grid layout (desktop: 45%/50% columns, mobile: stacked)

### Color Conversion Pipeline

```
User Input → HSL State → hslToRgb() → rgbToHex() → UI Update
```

Key functions in script.js:
- `hslToRgb(h, s, l)` at line 76 - Converts HSL to RGB using standard algorithm
- `rgbToHex(r, g, b)` at line 103 - Converts RGB to uppercase HEX format
- `updateColor()` at line 20 - Main orchestrator that syncs all UI elements

Global state (script.js:16-18): `hue` (0-360°), `lightness` (0-100%), `saturation` (0-100%)

### Responsive Design

Mobile breakpoint at 600px (style.css:77):
- Desktop: 2-column grid layout
- Mobile: Stacked layout with aspect-ratio-preserved color chip

## Deployment

GitHub Pages deployment:
- `.nojekyll` file prevents Jekyll processing
- Push to `main` branch triggers auto-deployment
- No build step required

## Code Conventions

- UI text and README in Japanese
- JavaScript uses English variable/function names
- HEX format: uppercase with # (e.g., `#FF5733`)
- RGB format: `rgb(255, 87, 51)`
- HSL format: `hsl(12°, 100%, 60%)`