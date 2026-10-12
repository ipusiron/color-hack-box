'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const tab3 = fs.readFileSync(path.join(root, 'tabs', 'tab3-grayscale.html'), 'utf8');
const tab8 = fs.readFileSync(path.join(root, 'tabs', 'tab8-misc.html'), 'utf8');

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

test('アクセシビリティコアを依存先の後、アプリ本体より先に読み込む', () => {
  assert.ok(index.indexOf('color-core.js') < index.indexOf('accessibility-core.js'));
  assert.ok(index.indexOf('accessibility-core.js') < index.indexOf('script.js'));
});

test('OGP画像は存在するファイルを参照する', () => {
  assert.doesNotMatch(index, /assets\/ogp\.png/);
  assert.match(index, /assets\/screenshot\.png/);
  assert.ok(fs.existsSync(path.join(root, 'assets', 'screenshot.png')));
});

test('コントラスト検査に必要な要素IDが一意に存在する', () => {
  const ids = [
    'contrast-foreground-picker', 'contrast-foreground-text', 'contrast-background-picker',
    'contrast-background-text', 'contrast-swap', 'contrast-preview', 'contrast-ratio',
    'contrast-target', 'contrast-target-status', 'contrast-non-text', 'contrast-suggestion',
    'contrast-suggestion-preview', 'contrast-suggestion-foreground',
    'contrast-suggestion-background', 'contrast-suggestion-ratio',
    'contrast-apply-suggestion', 'contrast-copy-suggestion'
  ];
  ids.forEach(id => {
    assert.equal((tab3.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, id);
  });
});

test('コントラスト検査の用途選択に5つの基準がある', () => {
  ['aa-normal', 'aaa-normal', 'aa-large', 'aaa-large', 'non-text'].forEach(value => {
    assert.match(tab3, new RegExp(`<option value="${value}"`));
  });
});

test('配色候補と判定限界が利用者に説明されている', () => {
  assert.match(tab3, /唯一の配色ではありません/);
  assert.match(tab3, /ページ全体のWCAG適合を証明しません/);
  assert.match(tab3, /UI部品が接する色/);
});

test('色覚比較とパレット監査に必要な要素IDが一意に存在する', () => {
  const ids = [
    'cvd-palette-input', 'cvd-type', 'cvd-pair-filter', 'cvd-input-error',
    'cvd-original-palette', 'cvd-simulated-palette', 'cvd-audit-status', 'cvd-audit-body'
  ];
  ids.forEach(id => {
    assert.equal((tab8.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, id);
  });
});

test('色覚シミュレーションの限界と非色覚的な手がかりを説明する', () => {
  assert.match(tab8, /当事者一人ひとりの見え方を再現するものではなく/);
  assert.match(tab8, /医学的な診断やWCAG適合の判定にも使えません/);
  assert.match(tab8, /形＋文字＋色/);
  assert.match(tab8, /近似表示後の比率は、WCAGの合否ではなく/);
});
