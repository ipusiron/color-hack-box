(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.ColorCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function normalizeHex(value) {
    if (typeof value !== 'string') return null;
    const match = value.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!match) return null;
    const digits = match[1].length === 3
      ? match[1].split('').map((digit) => digit + digit).join('')
      : match[1];
    return `#${digits.toUpperCase()}`;
  }

  function hexToRgb(value) {
    const hex = normalizeHex(value);
    if (!hex) throw new TypeError(`Invalid HEX color: ${value}`);
    return {
      r: Number.parseInt(hex.slice(1, 3), 16),
      g: Number.parseInt(hex.slice(3, 5), 16),
      b: Number.parseInt(hex.slice(5, 7), 16)
    };
  }

  function linearize(channel) {
    const srgb = channel / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  }

  function relativeLuminance(value) {
    const { r, g, b } = hexToRgb(value);
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
  }

  function contrastRatio(colorA, colorB) {
    const luminanceA = relativeLuminance(colorA);
    const luminanceB = relativeLuminance(colorB);
    const lighter = Math.max(luminanceA, luminanceB);
    const darker = Math.min(luminanceA, luminanceB);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function evaluateContrast(foreground, background) {
    const ratio = contrastRatio(foreground, background);
    return {
      ratio,
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3,
      aaaNormal: ratio >= 7,
      aaaLarge: ratio >= 4.5
    };
  }

  function bestTextColor(background) {
    const blackRatio = contrastRatio('#000000', background);
    const whiteRatio = contrastRatio('#FFFFFF', background);
    return blackRatio >= whiteRatio ? '#000000' : '#FFFFFF';
  }

  return Object.freeze({ normalizeHex, hexToRgb, relativeLuminance, contrastRatio, evaluateContrast, bestTextColor });
});
