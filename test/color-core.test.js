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

test('用途ごとのコントラスト基準を返す', () => {
  assert.equal(ColorCore.getContrastTarget('aa-normal').ratio, 4.5);
  assert.equal(ColorCore.getContrastTarget('aaa-normal').ratio, 7);
  assert.equal(ColorCore.getContrastTarget('aa-large').ratio, 3);
  assert.equal(ColorCore.getContrastTarget('aaa-large').ratio, 4.5);
  assert.equal(ColorCore.getContrastTarget('non-text').ratio, 3);
  assert.equal(ColorCore.getContrastTarget('unknown'), null);
});

test('基準を満たす配色は変更しない', () => {
  const candidate = ColorCore.suggestContrastPair('#000000', '#FFFFFF', 7);
  assert.deepEqual(candidate, {
    foreground: '#000000',
    background: '#FFFFFF',
    ratio: 21,
    changed: 'none'
  });
});

test('不適合の配色から基準を満たす候補を返す', () => {
  const candidate = ColorCore.suggestContrastPair('#999999', '#FFFFFF', 4.5);
  assert.ok(candidate.ratio >= 4.5);
  assert.equal(candidate.background, '#FFFFFF');
  assert.equal(candidate.changed, 'foreground');
  assert.ok(ColorCore.contrastRatio(candidate.foreground, candidate.background) >= 4.5);
});

test('片方だけの調整で届かない場合は両方を変更する', () => {
  const candidate = ColorCore.suggestContrastPair('#777777', '#777777', 7);
  assert.equal(candidate.changed, 'both');
  assert.ok(candidate.ratio >= 7);
});

test('候補生成の引数を検証する', () => {
  assert.throws(() => ColorCore.suggestContrastPair('red', '#FFFFFF', 4.5), /valid HEX/);
  assert.throws(() => ColorCore.suggestContrastPair('#000000', '#FFFFFF', 22), /between 1 and 21/);
});
