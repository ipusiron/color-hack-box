# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Color Hack Box** is an interactive educational tool for learning color theory through HSL (Hue, Saturation, Lightness) manipulation. Part of the "生成AIで作るセキュリティツール200" (200 Security Tools with Generative AI) project - Day 101.

**Live Demo**: https://ipusiron.github.io/color-hack-box/

## Development Setup

This is a pure HTML/CSS/JavaScript application with **no dependencies or build process**.

### Running Locally

```bash
# Direct browser open (macOS/Linux)
open index.html

# Windows
start index.html

# Or use a local server
python -m http.server 8000
# Then visit http://localhost:8000

# Node.js alternative
npx http-server
```

### Testing

No automated test suite exists. Manual testing checklist:
1. Adjust Hue/Lightness/Saturation sliders across all tabs
2. Verify color chip updates in real-time
3. Check HEX/RGB/HSL code displays and copy functionality
4. Test "ランダム生成" (Random) and "リセット" (Reset) buttons
5. Test grayscale slider and preset buttons (Tab 2)
6. Hover over color wheel segments to verify complementary/analogous highlighting (Tab 1)
7. Verify all 44 accordion sections open/close properly
8. Test responsive layout on mobile (600px), tablet (768px), and desktop viewports
9. Test tab navigation and automatic scrolling
10. Verify toast notifications on copy actions

## Architecture

### Core Files

- **index.html** (197KB) - Complete UI with 7 tabs, 44 accordions, color wheels, and palettes
- **script.js** (14KB) - Color conversion, tab management, copy functionality, interactive wheels
- **style.css** (58KB) - Responsive design, accordion styles, color chip layouts

### File Structure

```
color-hack-box/
├── index.html          # Main HTML (7 tabs, 44 accordion sections)
├── script.js           # JavaScript functionality
├── style.css           # All styling and responsive design
├── README.md           # Documentation
├── CLAUDE.md           # This file
├── LICENSE             # MIT License
└── .nojekyll           # GitHub Pages configuration
```

### Tab Architecture

The application consists of 7 tabs, each focusing on different aspects of color theory:

#### Tab 1: 基礎（色の三要素）- Fundamentals
- **Location**: index.html lines 48-688
- **Features**:
  - HSL sliders with real-time preview (lines 60-102)
  - HEX/RGB/HSL code display with copy buttons (lines 104-125)
  - Random generation and reset buttons (lines 127-136)
  - Complementary color wheel (12 segments, lines 234-314)
  - Analogous color wheel (12 segments, lines 423-508)
  - 6 educational accordion sections
- **JavaScript**:
  - `updateColor()` (script.js:20-49) - Main color update logic
  - `initializeSliders()` (script.js:51-90) - Slider event listeners
  - `initializeCopyButtons()` (script.js:177-250) - Copy functionality
  - `initializeComplementaryWheel()` (script.js:252-312) - Interactive color wheel
  - `initializeAnalogousWheel()` (script.js:314-377) - Analogous color interactions

#### Tab 2: 無彩色（グレースケール）- Achromatic Colors
- **Location**: index.html lines 690-1064
- **Features**:
  - Grayscale slider (0-100% lightness)
  - 5 preset buttons (Black, Dark Gray, Mid Gray, Light Gray, White)
  - HEX code display with RGB equivalents
  - 7 educational accordion sections on achromatic color usage
- **JavaScript**:
  - `initializeGrayscaleSlider()` (script.js:379-427) - Grayscale controls
  - `updateGrayscale(lightness)` (script.js:390-410) - Updates grayscale display

#### Tab 3: 色の印象と心理 - Color Psychology
- **Location**: index.html lines 1066-1815
- **Features**:
  - 9 accordion sections covering psychological effects of each color
  - Association tags (positive/neutral/negative)
  - Color variations with different lightness/saturation
  - Industry-specific usage examples
- **CSS**: Tag styling at style.css:1664-1697

#### Tab 4: トーン別パレット - Tone-based Palettes
- **Location**: index.html lines 1817-2372
- **Features**:
  - 3x3 tone map diagram (Pale, Light, Vivid, Bright, Dull, Grayish, Deep, Dark, Very Dark)
  - Color grids for each tone category
  - Same-tone and gradient color scheme examples
- **CSS**: Tone map styling at style.css:1795-1848

#### Tab 5: 配色と比率 - Color Schemes and Ratios
- **Location**: index.html lines 2374-2838
- **Features**:
  - 70:25:5 rule visualization (Base:Main:Accent)
  - 60:30:10 pattern visualization
  - Interactive ratio bars with hover effects
  - 5 accordion sections with practical examples
- **CSS**: Ratio bar styling at style.css:2112-2177

#### Tab 6: 配色例・目的別パレット - Color Palette Examples
- **Location**: index.html lines 2840-3481
- **Features**:
  - 50+ color palettes organized by:
    - Purpose (Corporate, EC, Blog, Portfolio)
    - Industry (Healthcare, Education, Food, Tech, Finance, Entertainment)
    - Season (Spring, Summer, Autumn, Winter)
    - Mood (Trust, Energy, Gentle, Luxury, Fun, Modern, Natural, Dramatic)
  - Each palette shows HEX codes with role labels (Base/Main/Accent)
  - 5 main accordion sections
- **CSS**: Palette styling at style.css:3115-3513

#### Tab 7: 雑学・補足 - Trivia and Supplementary Info
- **Location**: index.html lines 3483-3725
- **Features**:
  - 8 accordion sections covering:
    - Cultural differences in color meanings
    - Color vision deficiencies and universal design
    - RGB vs CMYK (screen vs print)
    - Web-safe colors
    - Color temperature (warm/cool colors)
    - Web color keywords (140+ CSS color names)
    - Color illusions and optical effects
    - Gamma correction across devices
- **CSS**: Uses existing trivia/accordion styles

### Color Conversion Pipeline

```
User Input → HSL State → hslToRgb() → rgbToHex() → UI Update
```

Key functions in script.js:
- `hslToRgb(h, s, l)` at line 92 - Converts HSL to RGB using standard algorithm
- `rgbToHex(r, g, b)` at line 119 - Converts RGB to uppercase HEX format
- `updateColor()` at line 20 - Main orchestrator that syncs all UI elements
- `showToast(message)` at line 164 - Toast notifications for copy actions

Global state (script.js:16-18): `hue` (0-360°), `lightness` (0-100%), `saturation` (0-100%)`

### Interactive Features

#### Tab Management
- **Function**: `initializeTabs()` (script.js:141-165)
- **Features**: Tab switching with active state management, automatic scroll to center active tab
- **CSS**: Tab navigation at style.css:34-129

#### Accordion System
- **Structure**: 44 total accordions across 7 tabs
- **HTML**: `<details class="accordion-item main-accordion">` pattern
- **CSS**: Main accordion styling at style.css:282-334, sub-accordion at style.css:337-392
- **Animation**: slideDown animation (style.css:2424-2433)

#### Copy Functionality
- **Function**: `initializeCopyButtons()` (script.js:177-250)
- **Features**: Clipboard API with textarea fallback, toast notifications, visual feedback
- **Toast**: 2-second display at bottom-right (style.css:2833-2857)

#### Color Wheels
- **Complementary**: 12 segments (30° each), highlights opposite colors (180° apart)
- **Analogous**: 12 segments, highlights ±30° adjacent colors
- **Interaction**: Hover to highlight, dimming non-selected segments
- **CSS**: Wheel styling at style.css:464-573 (complementary), 576-621 (analogous)

### Responsive Design

Three breakpoints implemented:
- **Desktop** (>768px): Full 2-column layouts, all features visible
- **Tablet** (600-768px): Adjusted grids, maintained functionality (style.css:2884-3012)
- **Mobile** (<600px): Stacked layouts, touch-optimized controls (style.css:3014-3113)

Key responsive patterns:
- Tab navigation: Horizontal scroll with touch support
- Sliders: `touch-action: none` for improved mobile interaction (style.css:2478, 994)
- Color chips: Flexible layouts that adapt to screen width
- Accordions: Full-width on mobile

### Performance Considerations

- **Large Files**: HTML is 197KB (all content inline), CSS is 58KB
- **No External Dependencies**: Everything self-contained
- **Inline SVG**: Favicon encoded as base64 in HTML head
- **Animation**: CSS transitions and transforms for smooth interactions
- **Touch Optimization**: `touch-action: none` on sliders for responsive touch

## Deployment

GitHub Pages deployment:
- `.nojekyll` file prevents Jekyll processing
- Push to `main` branch triggers auto-deployment
- No build step required
- Canonical URL: https://ipusiron.github.io/color-hack-box/

## Code Conventions

- **UI text**: Japanese for user-facing content
- **Code**: English variable/function names
- **Comments**: Japanese inline comments, English function documentation
- **Color formats**:
  - HEX: Uppercase with # (e.g., `#FF5733`)
  - RGB: `rgb(255, 87, 51)` or `R: 255  G: 87  B: 51` for display
  - HSL: `hsl(12°, 100%, 60%)` or `H: 12°  S: 100%  L: 60%` for display
- **CSS naming**: Mix of semantic (.main-accordion) and utility (.ratio-bar-70-25-5) classes
- **Accessibility**: WCAG AA color contrast ratios (#2c6ba8 for blue text on white)

## Key Implementation Details

### HSL to RGB Conversion (script.js:92-117)
Standard HSL→RGB algorithm with hue2rgb helper function. Handles achromatic case (s=0) separately.

### Toast Notification System (script.js:164-174)
- Positioned at bottom-right with `.toast` class
- 2-second display duration
- Fade-in animation via `.show` class
- Used for copy success/failure feedback

### Accordion Behavior
- Native HTML `<details>/<summary>` elements
- CSS-only open/close animations
- No JavaScript required for basic functionality
- Icons: ▼ (open) and ▶ (closed) using CSS ::before pseudo-elements

### Color Wheel Highlighting
- 12 segments created with CSS transforms
- Data attributes store hue values (`data-hue="0"`)
- Hover triggers highlighting via `.highlighted` and `.dimmed` classes
- JavaScript calculates complementary (±180°) and analogous (±30°) colors

## Common Tasks

### Adding a New Tab
1. Add button in `.tab-navigation` (index.html ~line 18-47)
2. Add section with `id="tabN"` and `class="tab-content"`
3. Include `.fh-header` for consistent styling
4. Add accordion sections with `.main-accordion` class
5. Update `initializeTabs()` if special behavior needed

### Adding a Color Palette (Tab 6)
1. Create `.palette-example` container
2. Add `.palette-header` with title
3. Create `.palette-colors` flex container
4. Add `.palette-chip` elements with inline `style="background: #COLOR"`
5. Include `.chip-code` (HEX) and `.chip-role` (label) spans
6. Add `.palette-usage` description paragraph

### Modifying Color Conversion
- Update `hslToRgb()` for HSL→RGB logic
- Update `rgbToHex()` for RGB→HEX conversion
- Call `updateColor()` to refresh UI after changes

### Adjusting Responsive Breakpoints
- Tablet: Edit `@media (max-width: 768px)` section
- Mobile: Edit `@media (max-width: 600px)` section
- Test tab navigation scroll behavior at each breakpoint
