(function (root) {
  'use strict';
  const language = document.documentElement.lang === 'en' ? 'en' : 'ja';
  const catalog = {
    ja: {
      loadError: 'タブの読み込みに失敗しました。', loading: '読み込み中...', pass: '適合', fail: '不適合', reached: '✓ 達成', missed: '× 未達', noPairs: 'この条件に該当する組み合わせはありません。',
      auditStatus: '{count}組を検査：通常文字4.5:1未達 {aa}組、3:1未達 {three}組。', invalidTokens: 'HEXとして読めない値：{values}', paletteRange: '重複を除き、2〜8色のHEXコードを入力してください。',
      keywords: 'キーワード：', purposeIntro: 'Webサイトやアプリの目的に応じた配色パレットを紹介します。それぞれの目的に最適化された配色で、効果的なデザインを実現できます。', industryIntro: '各業種の特性に合わせた配色パレットを紹介します。業種ごとに求められる印象や雰囲気を色で表現します。', seasonIntro: '季節感を表現する配色パレットです。キャンペーンやイベントデザインに活用できます。', moodIntro: '表現したい感情や雰囲気に合わせた配色パレットです。デザインの目的に応じて選びましょう。',
      copyCode: '✓ {format}コードをクリップボードにコピーしました', copyFailed: '❌ コピーに失敗しました', invalidHex: 'HEXは #RGB または #RRGGBB 形式で入力してください。',
      targetLabel: { 'aa-normal': 'AA 通常文字', 'aaa-normal': 'AAA 通常文字', 'aa-large': 'AA 大きい文字', 'aaa-large': 'AAA 大きい文字', 'non-text': '非テキスト' },
      suggestionForeground: '前景色だけを調整した候補です。', suggestionBackground: '背景色だけを調整した候補です。', suggestionBoth: '片方の色だけでは基準に届かないため、前景色と背景色の両方を調整した候補です。', suggestionLimit: '黒または白方向へ段階調整した一案であり、ブランドや見え方に最適な唯一の配色ではありません。', appliedSuggestion: '✓ 配色候補を入力欄へ反映しました', copiedSuggestion: '✓ 配色候補をクリップボードにコピーしました', copyPair: '前景色 {foreground} / 背景色 {background}'
    },
    en: {
      loadError: 'Failed to load this tab.', loading: 'Loading...', pass: 'Pass', fail: 'Fail', reached: '✓ Pass', missed: '× Fail', noPairs: 'No color pairs match this filter.',
      auditStatus: '{count} pairs checked: {aa} below 4.5:1 for normal text; {three} below 3:1.', invalidTokens: 'Not valid HEX values: {values}', paletteRange: 'Enter 2 to 8 unique HEX colors.',
      keywords: 'Keywords: ', purposeIntro: 'Color palettes for different website and app purposes. Each palette is tailored to its intended design context.', industryIntro: 'Color palettes for different industries, reflecting the tone commonly expected in each field.', seasonIntro: 'Seasonal palettes for campaigns and event designs.', moodIntro: 'Palettes organized by the mood or impression you want to express.',
      copyCode: '✓ Copied the {format} code to the clipboard', copyFailed: '❌ Copy failed', invalidHex: 'Enter HEX as #RGB or #RRGGBB.',
      targetLabel: { 'aa-normal': 'AA normal text', 'aaa-normal': 'AAA normal text', 'aa-large': 'AA large text', 'aaa-large': 'AAA large text', 'non-text': 'Non-text' },
      suggestionForeground: 'This candidate changes only the foreground.', suggestionBackground: 'This candidate changes only the background.', suggestionBoth: 'Changing only one color cannot reach the target, so this candidate changes both colors.', suggestionLimit: 'This is one calculated option adjusted toward black or white, not the only or necessarily best choice for a brand or a particular viewer.', appliedSuggestion: '✓ Applied the suggested pair', copiedSuggestion: '✓ Copied the suggested pair', copyPair: 'Foreground {foreground} / Background {background}'
    }
  };
  function t(key, variables = {}) {
    let value = catalog[language][key] ?? catalog.ja[key] ?? key;
    if (typeof value !== 'string') return value;
    Object.entries(variables).forEach(([name, replacement]) => { value = value.replaceAll(`{${name}}`, String(replacement)); });
    return value;
  }
  root.UiMessages = Object.freeze({ language, t, catalog });
})(typeof globalThis !== 'undefined' ? globalThis : this);
