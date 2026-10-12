(function (root, factory) {
  const colorCore = typeof module === 'object' && module.exports
    ? require('./color-core.js')
    : root.ColorCore;
  const api = factory(colorCore);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.AccessibilityCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (ColorCore) {
  'use strict';

  if (!ColorCore) throw new Error('ColorCore is required');

  // Machado, Oliveira, and Fernandes (2009), severity 1.0 matrices.
  // The matrix acts on normalized RGB values; output channels are clamped to sRGB range.
  const CVD_MATRICES = Object.freeze({
    protanopia: Object.freeze([
      Object.freeze([0.152286, 1.052583, -0.204868]),
      Object.freeze([0.114503, 0.786281, 0.099216]),
      Object.freeze([-0.003882, -0.048116, 1.051998])
    ]),
    deuteranopia: Object.freeze([
      Object.freeze([0.367322, 0.860646, -0.227968]),
      Object.freeze([0.280085, 0.672501, 0.047413]),
      Object.freeze([-0.011820, 0.042940, 0.968881])
    ]),
    tritanopia: Object.freeze([
      Object.freeze([1.255528, -0.076749, -0.178779]),
      Object.freeze([-0.078411, 0.930809, 0.147602]),
      Object.freeze([0.004733, 0.691367, 0.303900])
    ])
  });

  function clampChannel(value) {
    return Math.min(255, Math.max(0, Math.round(value * 255)));
  }

  function channelToHex(channel) {
    return channel.toString(16).padStart(2, '0').toUpperCase();
  }

  function simulateHex(value, type) {
    const hex = ColorCore.normalizeHex(value);
    if (!hex) throw new TypeError(`Invalid HEX color: ${value}`);
    if (type === 'normal') return hex;

    const matrix = CVD_MATRICES[type];
    if (!matrix) throw new RangeError(`Unknown simulation type: ${type}`);
    const { r, g, b } = ColorCore.hexToRgb(hex);
    const channels = [r / 255, g / 255, b / 255];
    const simulated = matrix.map((row) => clampChannel(
      row[0] * channels[0] + row[1] * channels[1] + row[2] * channels[2]
    ));
    return `#${simulated.map(channelToHex).join('')}`;
  }

  function parsePaletteInput(value) {
    const tokens = typeof value === 'string'
      ? value.split(/[\s,;]+/).filter(Boolean)
      : [];
    const colors = [];
    const invalid = [];
    tokens.forEach((token) => {
      const normalized = ColorCore.normalizeHex(token);
      if (!normalized) {
        invalid.push(token);
      } else if (!colors.includes(normalized)) {
        colors.push(normalized);
      }
    });
    return { colors, invalid };
  }

  function auditPalette(values, type = 'normal') {
    if (!Array.isArray(values)) throw new TypeError('Palette must be an array');
    const colors = values.map((value) => {
      const normalized = ColorCore.normalizeHex(value);
      if (!normalized) throw new TypeError(`Invalid HEX color: ${value}`);
      return normalized;
    });
    if (colors.length < 2 || colors.length > 8) {
      throw new RangeError('Palette must contain between 2 and 8 colors');
    }

    const simulatedColors = colors.map((color) => simulateHex(color, type));
    const pairs = [];
    for (let first = 0; first < colors.length - 1; first += 1) {
      for (let second = first + 1; second < colors.length; second += 1) {
        const ratio = ColorCore.contrastRatio(colors[first], colors[second]);
        const simulatedRatio = ColorCore.contrastRatio(
          simulatedColors[first],
          simulatedColors[second]
        );
        pairs.push({
          first: colors[first],
          second: colors[second],
          simulatedFirst: simulatedColors[first],
          simulatedSecond: simulatedColors[second],
          ratio,
          simulatedRatio,
          aaNormal: ratio >= 4.5,
          threeToOne: ratio >= 3
        });
      }
    }
    return { colors, simulatedColors, type, pairs };
  }

  return Object.freeze({
    CVD_MATRICES,
    simulateHex,
    parsePaletteInput,
    auditPalette
  });
});
