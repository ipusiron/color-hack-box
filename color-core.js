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

  const CONTRAST_TARGETS = Object.freeze({
    'aa-normal': Object.freeze({ label: 'AA 通常文字', ratio: 4.5 }),
    'aaa-normal': Object.freeze({ label: 'AAA 通常文字', ratio: 7 }),
    'aa-large': Object.freeze({ label: 'AA 大きい文字', ratio: 3 }),
    'aaa-large': Object.freeze({ label: 'AAA 大きい文字', ratio: 4.5 }),
    'non-text': Object.freeze({ label: '非テキスト', ratio: 3 })
  });

  function getContrastTarget(targetId) {
    return CONTRAST_TARGETS[targetId] || null;
  }

  function rgbToHex({ r, g, b }) {
    const toHex = (channel) => Math.round(channel).toString(16).padStart(2, '0').toUpperCase();
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function mixRgb(from, to, step) {
    const amount = step / 255;
    return {
      r: Math.round(from.r + (to.r - from.r) * amount),
      g: Math.round(from.g + (to.g - from.g) * amount),
      b: Math.round(from.b + (to.b - from.b) * amount)
    };
  }

  function colorDistanceSquared(colorA, colorB) {
    return (colorA.r - colorB.r) ** 2 + (colorA.g - colorB.g) ** 2 + (colorA.b - colorB.b) ** 2;
  }

  function findSingleColorCandidates(foreground, background, targetRatio) {
    const foregroundRgb = hexToRgb(foreground);
    const backgroundRgb = hexToRgb(background);
    const endpoints = [hexToRgb('#000000'), hexToRgb('#FFFFFF')];
    const candidates = [];

    [
      { key: 'foreground', original: foregroundRgb, fixed: background },
      { key: 'background', original: backgroundRgb, fixed: foreground }
    ].forEach(({ key, original, fixed }) => {
      endpoints.forEach((endpoint) => {
        for (let step = 1; step <= 255; step += 1) {
          const adjusted = mixRgb(original, endpoint, step);
          const color = rgbToHex(adjusted);
          const ratio = key === 'foreground'
            ? contrastRatio(color, fixed)
            : contrastRatio(fixed, color);
          if (ratio >= targetRatio) {
            candidates.push({ key, color, ratio, distance: colorDistanceSquared(original, adjusted) });
            break;
          }
        }
      });
    });

    return candidates;
  }

  function suggestContrastPair(foregroundValue, backgroundValue, targetRatio) {
    const foreground = normalizeHex(foregroundValue);
    const background = normalizeHex(backgroundValue);
    if (!foreground || !background) throw new TypeError('Foreground and background must be valid HEX colors');
    if (!Number.isFinite(targetRatio) || targetRatio < 1 || targetRatio > 21) {
      throw new RangeError('Target contrast ratio must be between 1 and 21');
    }

    const currentRatio = contrastRatio(foreground, background);
    if (currentRatio >= targetRatio) {
      return { foreground, background, ratio: currentRatio, changed: 'none' };
    }

    const candidates = findSingleColorCandidates(foreground, background, targetRatio)
      .sort((a, b) => a.distance - b.distance || b.ratio - a.ratio);
    if (candidates.length > 0) {
      const candidate = candidates[0];
      return {
        foreground: candidate.key === 'foreground' ? candidate.color : foreground,
        background: candidate.key === 'background' ? candidate.color : background,
        ratio: candidate.ratio,
        changed: candidate.key
      };
    }

    const endpointPairs = [
      { foreground: '#000000', background: '#FFFFFF' },
      { foreground: '#FFFFFF', background: '#000000' }
    ];
    const foregroundRgb = hexToRgb(foreground);
    const backgroundRgb = hexToRgb(background);
    return endpointPairs
      .map((pair) => ({
        ...pair,
        ratio: contrastRatio(pair.foreground, pair.background),
        changed: 'both',
        distance: colorDistanceSquared(foregroundRgb, hexToRgb(pair.foreground))
          + colorDistanceSquared(backgroundRgb, hexToRgb(pair.background))
      }))
      .sort((a, b) => a.distance - b.distance)[0];
  }

  function bestTextColor(background) {
    const blackRatio = contrastRatio('#000000', background);
    const whiteRatio = contrastRatio('#FFFFFF', background);
    return blackRatio >= whiteRatio ? '#000000' : '#FFFFFF';
  }

  return Object.freeze({
    normalizeHex,
    hexToRgb,
    relativeLuminance,
    contrastRatio,
    evaluateContrast,
    bestTextColor,
    CONTRAST_TARGETS,
    getContrastTarget,
    suggestContrastPair
  });
});
