'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const AccessibilityCore = require('../accessibility-core.js');

test('変換なしは正規化したHEXを返す', () => {
  assert.equal(AccessibilityCore.simulateHex('#abc', 'normal'), '#AABBCC');
});

test('Machado強度1.0行列で代表色を変換する', () => {
  assert.equal(AccessibilityCore.simulateHex('#FF0000', 'protanopia'), '#271D00');
  assert.equal(AccessibilityCore.simulateHex('#FF0000', 'deuteranopia'), '#5E4700');
  assert.equal(AccessibilityCore.simulateHex('#0000FF', 'tritanopia'), '#00264D');
});

test('変換後のチャンネルを0から255に収める', () => {
  assert.equal(AccessibilityCore.simulateHex('#00FF00', 'protanopia'), '#FFC900');
  assert.match(AccessibilityCore.simulateHex('#FF00FF', 'tritanopia'), /^#[0-9A-F]{6}$/);
});

test('パレット入力を正規化し、重複と不正値を分ける', () => {
  assert.deepEqual(
    AccessibilityCore.parsePaletteInput('#fff, 000000; #FFF tomato #123'),
    { colors: ['#FFFFFF', '#000000', '#112233'], invalid: ['tomato'] }
  );
});

test('4色の全6組を元の順序で監査する', () => {
  const result = AccessibilityCore.auditPalette(
    ['#000000', '#FFFFFF', '#777777', '#FF0000'],
    'deuteranopia'
  );
  assert.equal(result.pairs.length, 6);
  assert.deepEqual(
    [result.pairs[0].first, result.pairs[0].second],
    ['#000000', '#FFFFFF']
  );
  assert.equal(result.pairs[0].ratio, 21);
  assert.equal(result.pairs[0].aaNormal, true);
  assert.equal(result.simulatedColors.length, 4);
});

test('4.5:1と3:1を元の配色だけで判定する', () => {
  const result = AccessibilityCore.auditPalette(['#767676', '#FFFFFF'], 'protanopia');
  assert.equal(result.pairs[0].aaNormal, true);
  assert.equal(result.pairs[0].threeToOne, true);
  assert.notEqual(result.pairs[0].simulatedRatio, undefined);
});

test('不正な種類・色数・HEXを拒否する', () => {
  assert.throws(() => AccessibilityCore.simulateHex('#FFFFFF', 'unknown'), /Unknown/);
  assert.throws(() => AccessibilityCore.auditPalette(['#FFFFFF']), /between 2 and 8/);
  assert.throws(() => AccessibilityCore.auditPalette(['red', '#FFFFFF']), /Invalid HEX/);
});
