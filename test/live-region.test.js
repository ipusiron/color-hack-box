'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const LiveRegion = require('../live-region.js');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

function fakeElement(text = '') {
  let value = text;
  let writes = 0;
  return {
    get textContent() { return value; },
    set textContent(next) { value = next; writes += 1; },
    get writes() { return writes; }
  };
}

test('同じ文は live 領域へ書き直さない', () => {
  const element = fakeElement();
  assert.equal(LiveRegion.writeIfChanged(element, '4.500:1'), true);
  assert.equal(LiveRegion.writeIfChanged(element, '4.500:1'), false);
  assert.equal(LiveRegion.writeIfChanged(element, '7.000:1'), true);
  assert.equal(element.writes, 2);
  assert.equal(element.textContent, '7.000:1');
});

test('空にするのも1回だけで、null は空文字として扱う', () => {
  const element = fakeElement('エラー');
  assert.equal(LiveRegion.writeIfChanged(element, ''), true);
  assert.equal(LiveRegion.writeIfChanged(element, null), false);
  assert.equal(LiveRegion.writeIfChanged(element, undefined), false);
  assert.equal(element.writes, 1);
  assert.equal(LiveRegion.writeIfChanged(null, 'x'), false);
});

test('入力中はエラーの種類が変わったときだけ書き、確定時は書く', () => {
  assert.equal(LiveRegion.shouldWriteError('', 'invalidTokens', false), true);
  assert.equal(LiveRegion.shouldWriteError('invalidTokens', 'invalidTokens', false), false);
  assert.equal(LiveRegion.shouldWriteError('invalidTokens', 'paletteRange', false), true);
  assert.equal(LiveRegion.shouldWriteError('paletteRange', '', false), true);
  assert.equal(LiveRegion.shouldWriteError('', '', false), false);
  assert.equal(LiveRegion.shouldWriteError('invalidTokens', 'invalidTokens', true), true);
});

test('日英シェルで live 領域の補助をアプリ本体より先に読み込む', () => {
  ['index.html', 'index.en.html'].forEach((file) => {
    const shell = read(file);
    assert.ok(shell.indexOf('live-region.js') > 0, file);
    assert.ok(shell.indexOf('live-region.js') < shell.indexOf('script.js'), file);
  });
});

test('コントラスト結果の表示は live 領域ではなく、読み上げ用の status を別に持つ', () => {
  ['tabs/tab3-grayscale.html', 'tabs/en/tab3-grayscale.html'].forEach((file) => {
    const html = read(file);
    assert.match(html, /<div class="contrast-result">/, file);
    assert.match(html, /<p id="contrast-announcement" class="visually-hidden" role="status"><\/p>/, file);
  });
});

test('色覚パレット入力のエラーは見える表示と読み上げ用 alert を分ける', () => {
  ['tabs/tab8-misc.html', 'tabs/en/tab8-misc.html'].forEach((file) => {
    const html = read(file);
    assert.match(html, /<p id="cvd-input-error" class="cvd-error"><\/p>/, file);
    assert.match(html, /<p id="cvd-input-error-live" class="visually-hidden" role="alert"><\/p>/, file);
  });
});

test('ピッカーの input では読み上げず、change で読み上げる', () => {
  const source = read('script.js');
  assert.match(source, /picker\.addEventListener\('input', \(\) => \{\s+text\.value = picker\.value\.toUpperCase\(\);\s+render\(\{ announce: false \}\);/);
  assert.match(source, /picker\.addEventListener\('change', /);
});

test('読み上げ文の辞書が日英にある', () => {
  const source = read('ui-messages.js');
  assert.equal((source.match(/contrastAnnouncement: '/g) || []).length, 2);
});
