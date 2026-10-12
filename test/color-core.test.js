'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const ColorCore = require('../color-core.js');

test('HEXを6桁の大文字へ正規化する', () => {
  assert.equal(ColorCore.normalizeHex('#abc'), '#AABBCC');
  assert.equal(ColorCore.normalizeHex('336699'), '#336699');
});

test('不正なHEXを拒否する', () => {
  assert.equal(ColorCore.normalizeHex('#12'), null);
  assert.equal(ColorCore.normalizeHex('#GGGGGG'), null);
  assert.throws(() => ColorCore.hexToRgb('red'), /Invalid HEX color/);
});

test('白と黒のコントラスト比は21:1', () => {
  assert.equal(ColorCore.contrastRatio('#FFFFFF', '#000000'), 21);
});

test('色の順序を替えても比率は同じ', () => {
  const first = ColorCore.contrastRatio('#FFFFFF', '#333333');
  assert.equal(first, ColorCore.contrastRatio('#333333', '#FFFFFF'));
  assert.ok(Math.abs(first - 12.63465434445799) < 1e-12);
});

test('WCAG AAとAAAの閾値を個別に判定する', () => {
  const result = ColorCore.evaluateContrast('#666666', '#FFFFFF');
  assert.equal(result.aaNormal, true);
  assert.equal(result.aaLarge, true);
  assert.equal(result.aaaNormal, false);
  assert.equal(result.aaaLarge, true);
});

test('赤背景では黒文字の比率が白文字を上回る', () => {
  assert.ok(ColorCore.contrastRatio('#000000', '#FF0000') > 4.5);
  assert.ok(ColorCore.contrastRatio('#FFFFFF', '#FF0000') < 4.5);
  assert.equal(ColorCore.bestTextColor('#FF0000'), '#000000');
});

test('暗い背景では白文字を選ぶ', () => {
  assert.equal(ColorCore.bestTextColor('#222222'), '#FFFFFF');
});
