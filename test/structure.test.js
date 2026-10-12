'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const tab3 = fs.readFileSync(path.join(root, 'tabs', 'tab3-grayscale.html'), 'utf8');

test('8つのタブとパネルが対応している', () => {
  const buttons = [...index.matchAll(/data-tab="(tab\d+)"/g)].map(match => match[1]);
  const panels = [...index.matchAll(/<section id="(tab\d+)"/g)].map(match => match[1]);
  assert.deepEqual(buttons, ['tab1', 'tab2', 'tab3', 'tab4', 'tab5', 'tab6', 'tab7', 'tab8']);
  assert.deepEqual(panels, buttons);
});

test('タブはARIA属性を持つ', () => {
  assert.equal((index.match(/role="tab"/g) || []).length, 8);
  assert.equal((index.match(/role="tabpanel"/g) || []).length, 8);
  assert.match(index, /role="tablist"/);
});

test('コントラストコアをアプリ本体より先に読み込む', () => {
  assert.ok(index.indexOf('color-core.js') < index.indexOf('script.js'));
});

test('OGP画像は存在するファイルを参照する', () => {
  assert.doesNotMatch(index, /assets\/ogp\.png/);
  assert.match(index, /assets\/screenshot\.png/);
  assert.ok(fs.existsSync(path.join(root, 'assets', 'screenshot.png')));
});

test('コントラスト検査に必要な要素IDが一意に存在する', () => {
  const ids = ['contrast-foreground-picker', 'contrast-foreground-text', 'contrast-background-picker', 'contrast-background-text', 'contrast-swap', 'contrast-preview', 'contrast-ratio'];
  ids.forEach(id => {
    assert.equal((tab3.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, id);
  });
});
