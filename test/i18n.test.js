'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');
const tabFiles = [
  'tab1-rgb.html', 'tab2-basics.html', 'tab3-grayscale.html', 'tab4-psychology.html',
  'tab5-tone.html', 'tab6-ratio.html', 'tab7-palettes.html', 'tab8-misc.html'
];

function values(source, pattern) {
  return [...source.matchAll(pattern)].map((match) => match[1] ?? match[0]).sort();
}

test('英語版シェルと8タブがそろっている', () => {
  assert.ok(fs.existsSync(path.join(root, 'index.en.html')));
  tabFiles.forEach((file) => assert.ok(fs.existsSync(path.join(root, 'tabs', 'en', file)), file));
});

test('日英タブのID、リンク、HEX、数値属性が一致する', () => {
  tabFiles.forEach((file) => {
    const ja = read('tabs', file);
    const en = read('tabs', 'en', file);
    assert.deepEqual(values(en, /\bid="([^"]+)"/g), values(ja, /\bid="([^"]+)"/g), `${file}: ids`);
    assert.deepEqual(values(en, /\bhref="([^"]+)"/g), values(ja, /\bhref="([^"]+)"/g), `${file}: links`);
    assert.deepEqual(values(en, /#[0-9a-fA-F]{3,8}\b/g), values(ja, /#[0-9a-fA-F]{3,8}\b/g), `${file}: colors`);
    const numericAttribute = /\b(?:value|min|max|step|data-[\w-]+)="([\d.,-]+)"/g;
    assert.deepEqual(values(en, numericAttribute), values(ja, numericAttribute), `${file}: numeric attributes`);
  });
});

test('英語画面の可視テキストに日本語が残っていない', () => {
  tabFiles.forEach((file) => {
    const visible = read('tabs', 'en', file).replace(/<!--[\s\S]*?-->/g, '');
    assert.doesNotMatch(visible, /[ぁ-んァ-ヶ一-龯]/, file);
  });
  const shell = read('index.en.html').replace('日本語', '');
  assert.doesNotMatch(shell.replace(/<!--[\s\S]*?-->/g, ''), /[ぁ-んァ-ヶ一-龯]/);
});

test('英語版にもアクセシビリティ判定の基準値と限界が明記されている', () => {
  const grayscale = read('tabs/en/tab3-grayscale.html');
  const misc = read('tabs/en/tab8-misc.html');

  assert.match(grayscale, /4\.5:1/);
  assert.match(grayscale, /7:1/);
  assert.match(grayscale, /3:1/);
  assert.match(misc, /severity 1\.0/);
  assert.match(misc, /does not determine WCAG conformance/);
});

test('日英パレットの構造と色コードが一致する', () => {
  const ja = JSON.parse(read('data', 'palettes.json'));
  const en = JSON.parse(read('data', 'palettes.en.json'));
  const shape = (value) => {
    if (Array.isArray(value)) return value.map(shape);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shape(item)]));
    if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)) return value.toUpperCase();
    return typeof value;
  };
  assert.deepEqual(shape(en), shape(ja));
});

test('言語初期化は保存済み言語と明示指定を扱う', () => {
  const source = read('language-init.js');
  const run = ({ documentLang, search, stored, browserLanguage }) => {
    let replaced = null;
    let saved = null;
    const context = {
      document: { documentElement: { lang: documentLang } },
      navigator: { language: browserLanguage },
      localStorage: { getItem: () => stored, setItem: (_key, value) => { saved = value; } },
      window: { location: { search, hash: '#tab8', replace: (value) => { replaced = value; } } },
      URLSearchParams
    };
    vm.runInNewContext(source, context);
    return { replaced, saved };
  };
  assert.deepEqual(run({ documentLang: 'ja', search: '', stored: 'en', browserLanguage: 'ja-JP' }), { replaced: 'index.en.html?lang=en#tab8', saved: 'en' });
  assert.deepEqual(run({ documentLang: 'en', search: '?lang=ja', stored: 'en', browserLanguage: 'en-US' }), { replaced: 'index.html?lang=ja#tab8', saved: 'ja' });
});

test('日英READMEが相互リンクと同じ主要セクションを持つ', () => {
  const ja = read('README.md');
  const en = read('README.en.md');
  assert.match(ja, /\[English\]\(README\.en\.md\)/);
  assert.match(en, /\[日本語\]\(README\.md\)/);
  assert.equal((ja.match(/^## /gm) || []).length, (en.match(/^## /gm) || []).length);
  ['index.en.html', 'language-init.js', 'ui-messages.js', 'palettes.en.json'].forEach((file) => assert.match(en, new RegExp(file.replace('.', '\\.'))));
});
