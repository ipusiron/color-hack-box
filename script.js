// ===== TabLoader モジュール =====
// タブコンテンツを動的に読み込むためのモジュール
const appLanguage = UiMessages.language;
const translateUi = UiMessages.t;

const TabLoader = {
  cache: new Map(),
  loadingTabs: new Set(),

  // タブHTMLを読み込み（キャッシュあり）
  async load(tabId) {
    const cacheKey = `${appLanguage}:${tabId}`;
    // キャッシュにあればそれを返す
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // 既に読み込み中なら待機
    if (this.loadingTabs.has(cacheKey)) {
      return new Promise((resolve) => {
        const checkCache = setInterval(() => {
          if (this.cache.has(cacheKey)) {
            clearInterval(checkCache);
            resolve(this.cache.get(cacheKey));
          }
        }, 50);
      });
    }

    this.loadingTabs.add(cacheKey);

    try {
      const tabFileName = this.getTabFileName(tabId);
      const directory = appLanguage === 'en' ? 'tabs/en' : 'tabs';
      const response = await fetch(`${directory}/${tabFileName}`);
      if (!response.ok) {
        throw new Error(`Failed to load tab: ${tabFileName}`);
      }
      const html = await response.text();
      this.cache.set(cacheKey, html);
      return html;
    } catch (error) {
      console.error(`Error loading ${tabId}:`, error);
      return `<p class="error">${translateUi('loadError')}</p>`;
    } finally {
      this.loadingTabs.delete(cacheKey);
    }
  },

  // タブIDからファイル名を取得
  getTabFileName(tabId) {
    const tabMap = {
      'tab1': 'tab1-rgb.html',
      'tab2': 'tab2-basics.html',
      'tab3': 'tab3-grayscale.html',
      'tab4': 'tab4-psychology.html',
      'tab5': 'tab5-tone.html',
      'tab6': 'tab6-ratio.html',
      'tab7': 'tab7-palettes.html',
      'tab8': 'tab8-misc.html'
    };
    return tabMap[tabId] || `${tabId}.html`;
  },

  // タブをコンテナにレンダリング
  async renderTab(tabId, container) {
    // 既に読み込み済みならスキップ
    if (container.getAttribute('data-loaded') === 'true') {
      return;
    }

    // ローディング表示
    container.innerHTML = `<div class="tab-loading"><div class="loading-spinner"></div><p>${translateUi('loading')}</p></div>`;

    const html = await this.load(tabId);
    container.innerHTML = html;
    container.setAttribute('data-loaded', 'true');

    // タブ固有のコンポーネントを初期化
    await this.initializeTabComponents(tabId);
  },

  // タブ固有のコンポーネントを初期化
  async initializeTabComponents(tabId) {
    switch (tabId) {
      case 'tab1':
        initializeRGBSliders();
        initializeRGBCube();
        initializeSimilarityCalculator();
        initializeCopyButtons();
        break;
      case 'tab2':
        initializeSliders();
        updateColor();
        initializeComplementaryWheel();
        initializeAnalogousWheel();
        initializeCopyButtons();
        break;
      case 'tab3':
        initializeGrayscaleSlider();
        initializeContrastChecker();
        break;
      case 'tab7':
        await PaletteRenderer.renderAll();
        break;
      case 'tab8':
        initializeColorAccessibilityLab();
        break;
      default:
        // 他のタブは特別な初期化不要
        break;
    }
  }
};

// ===== 色覚シミュレーション・パレット一括検査 =====
function initializeColorAccessibilityLab() {
  const input = document.getElementById('cvd-palette-input');
  const typeSelect = document.getElementById('cvd-type');
  const filterSelect = document.getElementById('cvd-pair-filter');
  const originalContainer = document.getElementById('cvd-original-palette');
  const simulatedContainer = document.getElementById('cvd-simulated-palette');
  const tableBody = document.getElementById('cvd-audit-body');
  const status = document.getElementById('cvd-audit-status');
  const error = document.getElementById('cvd-input-error');
  if (!input || !typeSelect || !filterSelect || !originalContainer || !simulatedContainer || !tableBody || !status || !error) return;

  let latestAudit = null;

  function renderSwatches(container, colors) {
    container.replaceChildren();
    colors.forEach((color, index) => {
      const item = document.createElement('div');
      item.className = 'cvd-swatch';
      item.style.backgroundColor = color;
      item.style.color = ColorCore.bestTextColor(color);
      const marker = document.createElement('span');
      marker.className = 'cvd-swatch-marker';
      marker.textContent = String(index + 1);
      const code = document.createElement('code');
      code.textContent = color;
      item.append(marker, code);
      container.append(item);
    });
  }

  function pairLabel(pair, simulated = false) {
    const first = simulated ? pair.simulatedFirst : pair.first;
    const second = simulated ? pair.simulatedSecond : pair.second;
    const wrapper = document.createElement('span');
    wrapper.className = 'cvd-pair-label';
    [first, second].forEach((color) => {
      const chip = document.createElement('span');
      chip.className = 'cvd-pair-chip';
      chip.style.backgroundColor = color;
      chip.setAttribute('aria-hidden', 'true');
      wrapper.append(chip);
    });
    const text = document.createElement('code');
    text.textContent = `${first} / ${second}`;
    wrapper.append(text);
    return wrapper;
  }

  function renderTable() {
    if (!latestAudit) return;
    const filter = filterSelect.value;
    const visiblePairs = latestAudit.pairs.filter((pair) => {
      if (filter === 'aa-fail') return !pair.aaNormal;
      if (filter === 'three-fail') return !pair.threeToOne;
      return true;
    });
    tableBody.replaceChildren();

    visiblePairs.forEach((pair) => {
      const row = document.createElement('tr');
      const pairCell = document.createElement('td');
      pairCell.append(pairLabel(pair));
      const ratioCell = document.createElement('td');
      ratioCell.textContent = `${pair.ratio.toFixed(2)}:1`;
      const aaCell = document.createElement('td');
      aaCell.className = pair.aaNormal ? 'audit-pass' : 'audit-fail';
      aaCell.textContent = translateUi(pair.aaNormal ? 'reached' : 'missed');
      const threeCell = document.createElement('td');
      threeCell.className = pair.threeToOne ? 'audit-pass' : 'audit-fail';
      threeCell.textContent = translateUi(pair.threeToOne ? 'reached' : 'missed');
      const simulatedCell = document.createElement('td');
      simulatedCell.append(pairLabel(pair, true), document.createElement('br'));
      simulatedCell.append(`${pair.simulatedRatio.toFixed(2)}:1`);
      row.append(pairCell, ratioCell, aaCell, threeCell, simulatedCell);
      tableBody.append(row);
    });

    if (visiblePairs.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.textContent = translateUi('noPairs');
      row.append(cell);
      tableBody.append(row);
    }

    const aaFailures = latestAudit.pairs.filter((pair) => !pair.aaNormal).length;
    const threeFailures = latestAudit.pairs.filter((pair) => !pair.threeToOne).length;
    status.textContent = translateUi('auditStatus', { count: latestAudit.pairs.length, aa: aaFailures, three: threeFailures });
  }

  function update() {
    const parsed = AccessibilityCore.parsePaletteInput(input.value);
    if (parsed.invalid.length > 0) {
      error.textContent = translateUi('invalidTokens', { values: parsed.invalid.join(', ') });
      return;
    }
    if (parsed.colors.length < 2 || parsed.colors.length > 8) {
      error.textContent = translateUi('paletteRange');
      return;
    }
    error.textContent = '';
    latestAudit = AccessibilityCore.auditPalette(parsed.colors, typeSelect.value);
    renderSwatches(originalContainer, latestAudit.colors);
    renderSwatches(simulatedContainer, latestAudit.simulatedColors);
    renderTable();
  }

  document.querySelectorAll('[data-cvd-palette]').forEach((button) => {
    button.addEventListener('click', () => {
      input.value = button.getAttribute('data-cvd-palette');
      update();
    });
  });
  input.addEventListener('input', update);
  typeSelect.addEventListener('change', update);
  filterSelect.addEventListener('change', renderTable);
  update();
}

// ===== PaletteRenderer モジュール =====
// パレットデータをJSONから読み込み、HTMLを生成するモジュール
const PaletteRenderer = {
  data: null,

  // パレットデータを読み込み
  async loadData() {
    if (this.data) {
      return this.data;
    }

    try {
      const response = await fetch(appLanguage === 'en' ? 'data/palettes.en.json' : 'data/palettes.json');
      if (!response.ok) {
        throw new Error('Failed to load palettes.json');
      }
      this.data = await response.json();
      return this.data;
    } catch (error) {
      console.error('Error loading palette data:', error);
      return null;
    }
  },

  // 単一パレットのHTMLを生成
  createPaletteHTML(palette) {
    const colorsHTML = palette.colors.map(color => {
      const textColor = this.getContrastColor(color.hex);
      const borderStyle = color.hex.toUpperCase() === '#FFFFFF' ? 'border: 2px solid #e9ecef;' : '';
      return `
        <div class="palette-chip" style="background: ${color.hex}; ${borderStyle}">
          <span class="chip-code" style="color: ${textColor};">${color.hex}</span>
          ${color.role ? `<span class="chip-role">${color.role}</span>` : ''}
        </div>
      `;
    }).join('');

    let html = '<div class="palette-example">';
    if (palette.name) {
      html += `<div class="palette-header">${palette.name}</div>`;
    }
    html += `<div class="palette-colors">${colorsHTML}</div>`;
    if (palette.usage) {
      html += `<p class="palette-usage">${palette.usage}</p>`;
    }
    html += '</div>';

    return html;
  },

  // パレットセクションのHTMLを生成
  createSectionHTML(section) {
    let html = `<div class="palette-section">`;
    html += `<h4>${section.icon} ${section.title}</h4>`;
    if (section.description) {
      html += `<p>${section.description}</p>`;
    }
    section.palettes.forEach(palette => {
      html += this.createPaletteHTML(palette);
    });
    html += '</div>';
    return html;
  },

  // 季節カードのHTMLを生成
  createSeasonalCardHTML(season) {
    const colorsHTML = season.colors.map(color => {
      const textColor = this.getContrastColor(color);
      return `<div class="palette-chip" style="background: ${color};"><span class="chip-code" style="color: ${textColor};">${color}</span></div>`;
    }).join('');

    return `
      <div class="seasonal-card">
        <h4>${season.icon} ${season.name}</h4>
        <p class="season-desc">${season.description}</p>
        <div class="palette-colors">${colorsHTML}</div>
        <p class="season-keyword"><strong>${translateUi('keywords')}</strong>${season.keywords}</p>
      </div>
    `;
  },

  // ムードカードのHTMLを生成
  createMoodCardHTML(mood) {
    const chipsHTML = mood.colors.map(color =>
      `<div class="mini-chip" style="background: ${color};"></div>`
    ).join('');

    return `
      <div class="mood-card">
        <h4>${mood.icon} ${mood.name}</h4>
        <div class="palette-colors-mini">${chipsHTML}</div>
        <p>${mood.description}</p>
      </div>
    `;
  },

  // 背景色に対するコントラスト色を取得
  getContrastColor(hex) {
    return ColorCore.bestTextColor(hex);
  },

  // 全パレットをレンダリング
  async renderAll() {
    const data = await this.loadData();
    if (!data) return;

    // 目的別パレット
    const purposeContainer = document.getElementById('palette-purpose');
    if (purposeContainer && data.purpose) {
      let html = `<p>${translateUi('purposeIntro')}</p>`;
      data.purpose.forEach((section, index) => {
        html += this.createSectionHTML(section);
        if (index < data.purpose.length - 1) {
          html += '<hr style="margin: 3rem 0; border: none; border-top: 2px solid #e9ecef;">';
        }
      });
      purposeContainer.innerHTML = html;
    }

    // 業種別パレット
    const industryContainer = document.getElementById('palette-industry');
    if (industryContainer && data.industry) {
      let html = `<p>${translateUi('industryIntro')}</p>`;
      data.industry.forEach(section => {
        html += this.createSectionHTML(section);
      });
      industryContainer.innerHTML = html;
    }

    // 季節別パレット
    const seasonContainer = document.getElementById('palette-season');
    if (seasonContainer && data.seasons) {
      let html = `<p>${translateUi('seasonIntro')}</p>`;
      html += '<div class="seasonal-grid">';
      data.seasons.forEach(season => {
        html += this.createSeasonalCardHTML(season);
      });
      html += '</div>';
      seasonContainer.innerHTML = html;
    }

    // 感情・雰囲気別
    const moodContainer = document.getElementById('palette-mood');
    if (moodContainer && data.moods) {
      let html = `<p>${translateUi('moodIntro')}</p>`;
      html += '<div class="mood-grid">';
      data.moods.forEach(mood => {
        html += this.createMoodCardHTML(mood);
      });
      html += '</div>';
      moodContainer.innerHTML = html;
    }
  }
};

// ===== スライダー要素取得（遅延初期化対応） =====
let hueSlider, lightnessSlider, saturationSlider;
let hueValueDisplay, lightnessValueDisplay, saturationValueDisplay;
let colorChip, hexCode, rgbCode, hslCode;

function initializeHSLElements() {
  hueSlider = document.getElementById('hue-slider');
  lightnessSlider = document.getElementById('lightness-slider');
  saturationSlider = document.getElementById('saturation-slider');
  hueValueDisplay = document.getElementById('hue-value');
  lightnessValueDisplay = document.getElementById('lightness-value');
  saturationValueDisplay = document.getElementById('saturation-value');
  colorChip = document.getElementById('color-chip');
  hexCode = document.getElementById('hex-code');
  rgbCode = document.getElementById('rgb-code');
  hslCode = document.getElementById('hsl-code');
}

// 初期設定値
let hue        = 0;
let lightness  = 50;
let saturation = 50;

function updateColor() {
  const h   = hue;
  const s   = saturation;
  const l   = lightness;

  // CSS用（度記号なし）
  const hslStrForCSS = `hsl(${h}, ${s}%, ${l}%)`;

  const rgbArr = hslToRgb(h, s/100, l/100);

  // 見やすい表記に変更
  const hexStr = rgbToHex(rgbArr[0], rgbArr[1], rgbArr[2]);
  const rgbStr = `R: ${rgbArr[0]}  G: ${rgbArr[1]}  B: ${rgbArr[2]}`;
  const hslStrForDisplay = `H: ${h}°  S: ${s}%  L: ${l}%`;

  // 表示更新
  if (colorChip) {
    colorChip.style.backgroundColor = hslStrForCSS;
    console.log('Color updated:', hslStrForCSS);
  } else {
    console.error('colorChip element not found');
  }

  if (hueValueDisplay) hueValueDisplay.textContent = `${h}°`;
  if (lightnessValueDisplay) lightnessValueDisplay.textContent = `${l}%`;
  if (saturationValueDisplay) saturationValueDisplay.textContent = `${s}%`;
  if (hexCode) hexCode.textContent = hexStr;
  if (rgbCode) rgbCode.textContent = rgbStr;
  if (hslCode) hslCode.textContent = hslStrForDisplay;
}

function initializeSliders() {
  // 要素を取得（遅延読み込み対応）
  initializeHSLElements();

  if (!hueSlider || !lightnessSlider || !saturationSlider) {
    console.log('HSL sliders not found - tab may not be loaded yet');
    return;
  }

  hueSlider.value        = hue;
  lightnessSlider.value  = lightness;
  saturationSlider.value = saturation;

  hueSlider.addEventListener('input', () => {
    hue = parseInt(hueSlider.value, 10);
    updateColor();
  });
  lightnessSlider.addEventListener('input', () => {
    lightness = parseInt(lightnessSlider.value, 10);
    updateColor();
  });
  saturationSlider.addEventListener('input', () => {
    saturation = parseInt(saturationSlider.value, 10);
    updateColor();
  });

  const btnRandom = document.getElementById('btn-random');
  const btnReset = document.getElementById('btn-reset');

  if (btnRandom) {
    btnRandom.addEventListener('click', () => {
      hue        = Math.floor(Math.random()*361);
      lightness  = Math.floor(Math.random()*101);
      saturation = Math.floor(Math.random()*101);
      hueSlider.value = hue;
      lightnessSlider.value = lightness;
      saturationSlider.value = saturation;
      updateColor();
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      hue        = 0;
      lightness  = 50;
      saturation = 50;
      hueSlider.value = hue;
      lightnessSlider.value = lightness;
      saturationSlider.value = saturation;
      updateColor();
    });
  }
}

function hslToRgb(h, s, l) {
  // 引用：hsl→RGB変換アルゴリズム :contentReference[oaicite:0]{index=0}
  h = h / 360;
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // 無彩色
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [ Math.round(r * 255), Math.round(g * 255), Math.round(b * 255) ];
}

function rgbToHex(r, g, b) {
  const toHex = (c) => {
    const hex = c.toString(16).toUpperCase();
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// 初期化実行（遅延読み込みのため削除 - TabLoaderが担当）
// HSLスライダーはtab2読み込み時にTabLoader.initializeTabComponents()で初期化される

// タブ切り替え機能（遅延読み込み対応）
function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  async function activateTab(button, moveFocus = false) {
    const targetTab = button.getAttribute('data-tab');
    const targetContent = document.getElementById(targetTab);

    tabButtons.forEach(btn => {
      const selected = btn === button;
      btn.classList.toggle('active', selected);
      btn.setAttribute('aria-selected', String(selected));
      btn.tabIndex = selected ? 0 : -1;
    });
    tabContents.forEach(content => {
      const selected = content === targetContent;
      content.classList.toggle('active', selected);
      content.hidden = !selected;
    });

    await TabLoader.renderTab(targetTab, targetContent);
    if (moveFocus) button.focus();
    button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  tabButtons.forEach((button, index) => {
    button.addEventListener('click', async () => {
      await activateTab(button);
    });

    button.addEventListener('keydown', async (event) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabButtons.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabButtons.length - 1;
      await activateTab(tabButtons[nextIndex], true);
    });
  });

  // 初期表示タブ（tab1）を読み込み
  const activeTab = document.querySelector('.tab-btn.active');
  if (activeTab) {
    const tabId = activeTab.getAttribute('data-tab');
    const container = document.getElementById(tabId);
    if (container) {
      TabLoader.renderTab(tabId, container);
    }
  }
}

// タブ初期化実行
initializeTabs();

// トースト通知を表示する関数
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

// コピーボタン機能
function initializeCopyButtons() {
  const copyButtons = document.querySelectorAll('.copy-btn');

  copyButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const type = button.getAttribute('data-copy');
      let textToCopy = '';
      let formatName = '';

      switch(type) {
        case 'hex':
          textToCopy = hexCode.textContent;
          formatName = 'HEX';
          break;
        case 'rgb':
          textToCopy = rgbCode.textContent;
          formatName = 'RGB';
          break;
        case 'hsl':
          textToCopy = hslCode.textContent;
          formatName = 'HSL';
          break;
        case 'rgb-hex':
          textToCopy = document.getElementById('rgb-hex-code').textContent;
          formatName = 'HEX';
          break;
        case 'rgb-rgb':
          textToCopy = document.getElementById('rgb-rgb-code').textContent;
          formatName = 'RGB';
          break;
        case 'rgb-hsl':
          textToCopy = document.getElementById('rgb-hsl-code').textContent;
          formatName = 'HSL';
          break;
      }

      try {
        await navigator.clipboard.writeText(textToCopy);

        // コピー成功のフィードバック
        const originalText = button.textContent;
        button.textContent = '✓';
        button.classList.add('copied');

        // トースト通知を表示
        showToast(translateUi('copyCode', { format: formatName }));

        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('コピーに失敗しました:', err);
        // フォールバック: 古い方法
        try {
          const textArea = document.createElement('textarea');
          textArea.value = textToCopy;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);

          const originalText = button.textContent;
          button.textContent = '✓';
          button.classList.add('copied');

          // トースト通知を表示
          showToast(translateUi('copyCode', { format: formatName }));

          setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
          }, 2000);
        } catch (fallbackErr) {
          console.error('フォールバックコピーも失敗しました:', fallbackErr);
          showToast(translateUi('copyFailed'));
        }
      }
    });
  });
}

// コピーボタン初期化はTabLoader.initializeTabComponents()から呼び出される

// 補色の色相環インタラクティブ機能
function initializeComplementaryWheel() {
  const wheelWrapper = document.querySelector('.complementary-wheel-wrapper');
  const segments = document.querySelectorAll('.wheel-segment');

  if (!wheelWrapper || segments.length === 0) return;

  // 補色を計算（色相環で180度反対）
  function getComplementaryHue(hue) {
    return (parseInt(hue) + 180) % 360;
  }

  // セグメントをハイライト
  function highlightComplementaryPair(hue1, hue2) {
    // すべてのセグメントをリセット
    segments.forEach(segment => {
      segment.classList.remove('highlighted', 'dimmed');
    });

    // 該当するセグメントを見つけてハイライト
    segments.forEach(segment => {
      const segmentHue = parseInt(segment.getAttribute('data-hue'));
      if (segmentHue === hue1 || segmentHue === hue2) {
        segment.classList.add('highlighted');
      } else {
        segment.classList.add('dimmed');
      }
    });
  }

  // ハイライトをリセット
  function resetHighlight() {
    segments.forEach(segment => {
      segment.classList.remove('highlighted', 'dimmed');
    });
  }

  // 各セグメントにホバーイベント
  segments.forEach(segment => {
    segment.addEventListener('mouseenter', () => {
      const hue = parseInt(segment.getAttribute('data-hue'));
      const complementaryHue = getComplementaryHue(hue);
      highlightComplementaryPair(hue, complementaryHue);
    });
  });

  // ラッパーからマウスアウト
  wheelWrapper.addEventListener('mouseleave', resetHighlight);

  // 補色例のホバー
  const examples = document.querySelectorAll('.complementary-example');
  examples.forEach(example => {
    example.addEventListener('mouseenter', () => {
      const hue1 = parseInt(example.getAttribute('data-hue1'));
      const hue2 = parseInt(example.getAttribute('data-hue2'));
      highlightComplementaryPair(hue1, hue2);
    });

    example.addEventListener('mouseleave', resetHighlight);
  });
}

// 類似色相の色相環インタラクティブ機能
function initializeAnalogousWheel() {
  const wheelWrapper = document.querySelector('.analogous-wheel-wrapper');
  const segments = document.querySelectorAll('.analogous-segment');

  if (!wheelWrapper || segments.length === 0) return;

  // 類似色相を計算（隣接する色：±30度）
  function getAnalogousHues(hue) {
    const h = parseInt(hue);
    const prev = (h - 30 + 360) % 360;
    const next = (h + 30) % 360;
    return [prev, h, next];
  }

  // セグメントをハイライト（類似色相：本体+前後）
  function highlightAnalogousColors(hues) {
    // すべてのセグメントをリセット
    segments.forEach(segment => {
      segment.classList.remove('highlighted', 'dimmed');
    });

    // 該当するセグメントを見つけてハイライト
    segments.forEach(segment => {
      const segmentHue = parseInt(segment.getAttribute('data-hue'));
      if (hues.includes(segmentHue)) {
        segment.classList.add('highlighted');
      } else {
        segment.classList.add('dimmed');
      }
    });
  }

  // ハイライトをリセット
  function resetHighlight() {
    segments.forEach(segment => {
      segment.classList.remove('highlighted', 'dimmed');
    });
  }

  // 各セグメントにホバーイベント
  segments.forEach(segment => {
    segment.addEventListener('mouseenter', () => {
      const hue = parseInt(segment.getAttribute('data-hue'));
      const analogousHues = getAnalogousHues(hue);
      highlightAnalogousColors(analogousHues);
    });
  });

  // ラッパーからマウスアウト
  wheelWrapper.addEventListener('mouseleave', resetHighlight);

  // 類似色相例のホバー
  const examples = document.querySelectorAll('.analogous-example');
  examples.forEach(example => {
    example.addEventListener('mouseenter', () => {
      const huesStr = example.getAttribute('data-hues');
      const hues = huesStr.split(',').map(h => parseInt(h.trim()));
      highlightAnalogousColors(hues);
    });

    example.addEventListener('mouseleave', resetHighlight);
  });
}

// グレースケールスライダーの機能
function initializeGrayscaleSlider() {
  const slider = document.getElementById('grayscale-slider');
  const chip = document.getElementById('grayscale-chip');
  const lightnessDisplay = document.getElementById('grayscale-lightness');
  const hexDisplay = document.getElementById('grayscale-hex');
  const rgbDisplay = document.getElementById('grayscale-rgb');
  const presetButtons = document.querySelectorAll('.preset-btn');

  if (!slider || !chip) return;

  function updateGrayscale(lightness) {
    const l = parseInt(lightness);

    // HSL形式でグレーを設定
    chip.style.background = `hsl(0, 0%, ${l}%)`;

    // RGB値を計算（グレーなのでR=G=B）
    const rgbValue = Math.round((l / 100) * 255);

    // HEX値を計算
    const hexValue = rgbValue.toString(16).padStart(2, '0').toUpperCase();
    const hexCode = `#${hexValue}${hexValue}${hexValue}`;

    // 表示を更新
    if (lightnessDisplay) lightnessDisplay.textContent = `${l}%`;
    if (hexDisplay) hexDisplay.textContent = hexCode;
    if (rgbDisplay) rgbDisplay.textContent = `rgb(${rgbValue}, ${rgbValue}, ${rgbValue})`;

    // スライダーの値を更新
    slider.value = l;
  }

  // スライダーのイベントリスナー
  slider.addEventListener('input', (e) => {
    updateGrayscale(e.target.value);
  });

  // プリセットボタンのイベントリスナー
  presetButtons.forEach(button => {
    button.addEventListener('click', () => {
      const lightness = button.getAttribute('data-lightness');
      updateGrayscale(lightness);
    });
  });

  // 初期表示
  updateGrayscale(50);
}

function initializeContrastChecker() {
  const foregroundPicker = document.getElementById('contrast-foreground-picker');
  const foregroundText = document.getElementById('contrast-foreground-text');
  const backgroundPicker = document.getElementById('contrast-background-picker');
  const backgroundText = document.getElementById('contrast-background-text');
  const swapButton = document.getElementById('contrast-swap');
  const preview = document.getElementById('contrast-preview');
  const ratioOutput = document.getElementById('contrast-ratio');
  const error = document.getElementById('contrast-error');
  const targetSelect = document.getElementById('contrast-target');
  const targetStatus = document.getElementById('contrast-target-status');
  const suggestion = document.getElementById('contrast-suggestion');
  const suggestionPreview = document.getElementById('contrast-suggestion-preview');
  const suggestionForeground = document.getElementById('contrast-suggestion-foreground');
  const suggestionBackground = document.getElementById('contrast-suggestion-background');
  const suggestionRatio = document.getElementById('contrast-suggestion-ratio');
  const suggestionNote = document.getElementById('contrast-suggestion-note');
  const applySuggestion = document.getElementById('contrast-apply-suggestion');
  const copySuggestion = document.getElementById('contrast-copy-suggestion');
  let currentSuggestion = null;

  if (!foregroundPicker || !foregroundText || !backgroundPicker || !backgroundText || !preview || !ratioOutput || !targetSelect) return;

  function setResult(id, passed) {
    const element = document.getElementById(`contrast-${id}`);
    if (!element) return;
    element.classList.toggle('pass', passed);
    element.classList.toggle('fail', !passed);
    element.textContent = `${element.dataset.label}: ${translateUi(passed ? 'pass' : 'fail')}`;
  }

  function render() {
    const foreground = ColorCore.normalizeHex(foregroundText.value);
    const background = ColorCore.normalizeHex(backgroundText.value);
    if (!foreground || !background) {
      error.textContent = translateUi('invalidHex');
      if (targetStatus) targetStatus.textContent = '';
      if (suggestion) suggestion.hidden = true;
      currentSuggestion = null;
      return false;
    }

    error.textContent = '';
    foregroundText.value = foreground;
    backgroundText.value = background;
    foregroundPicker.value = foreground;
    backgroundPicker.value = background;

    const result = ColorCore.evaluateContrast(foreground, background);
    preview.style.color = foreground;
    preview.style.backgroundColor = background;
    ratioOutput.textContent = `${result.ratio.toFixed(3)}:1`;
    setResult('aa-normal', result.aaNormal);
    setResult('aa-large', result.aaLarge);
    setResult('aaa-normal', result.aaaNormal);
    setResult('aaa-large', result.aaaLarge);
    setResult('non-text', result.ratio >= 3);

    const target = ColorCore.getContrastTarget(targetSelect.value);
    if (!target) return true;
    const passed = result.ratio >= target.ratio;
    if (targetStatus) {
      targetStatus.classList.toggle('pass', passed);
      targetStatus.classList.toggle('fail', !passed);
      const labels = translateUi('targetLabel');
      targetStatus.textContent = `${labels[targetSelect.value]} (${target.ratio}:1): ${translateUi(passed ? 'pass' : 'fail')}`;
    }

    currentSuggestion = passed ? null : ColorCore.suggestContrastPair(foreground, background, target.ratio);
    if (suggestion) suggestion.hidden = passed;
    if (currentSuggestion && suggestionPreview && suggestionForeground && suggestionBackground && suggestionRatio && suggestionNote) {
      suggestionPreview.style.color = currentSuggestion.foreground;
      suggestionPreview.style.backgroundColor = currentSuggestion.background;
      suggestionForeground.textContent = currentSuggestion.foreground;
      suggestionBackground.textContent = currentSuggestion.background;
      suggestionRatio.textContent = `${currentSuggestion.ratio.toFixed(3)}:1`;
      const changeLabels = { foreground: translateUi('suggestionForeground'), background: translateUi('suggestionBackground'), both: translateUi('suggestionBoth') };
      suggestionNote.textContent = `${changeLabels[currentSuggestion.changed]} ${translateUi('suggestionLimit')}`;
    }
    return true;
  }

  function bindPair(picker, text) {
    picker.addEventListener('input', () => {
      text.value = picker.value.toUpperCase();
      render();
    });
    text.addEventListener('change', render);
    text.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') render();
    });
  }

  bindPair(foregroundPicker, foregroundText);
  bindPair(backgroundPicker, backgroundText);
  targetSelect.addEventListener('change', render);
  swapButton?.addEventListener('click', () => {
    const previousForeground = foregroundText.value;
    foregroundText.value = backgroundText.value;
    backgroundText.value = previousForeground;
    render();
  });
  applySuggestion?.addEventListener('click', () => {
    if (!currentSuggestion) return;
    foregroundText.value = currentSuggestion.foreground;
    backgroundText.value = currentSuggestion.background;
    render();
    showToast(translateUi('appliedSuggestion'));
  });
  copySuggestion?.addEventListener('click', async () => {
    if (!currentSuggestion) return;
    const text = translateUi('copyPair', currentSuggestion);
    try {
      await navigator.clipboard.writeText(text);
      showToast(translateUi('copiedSuggestion'));
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const copied = document.execCommand('copy');
      textArea.remove();
      showToast(copied ? translateUi('copiedSuggestion') : translateUi('copyFailed'));
    }
  });

  render();
}

// ===== RGB Tab Functionality =====

// RGB state
let rgbRed = 128;
let rgbGreen = 128;
let rgbBlue = 128;

// Cube rotation state
let cubeRotateX = -20;
let cubeRotateY = 45;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

// RGB to HSL conversion
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// Update RGB color display
function updateRGBColor() {
  const r = rgbRed;
  const g = rgbGreen;
  const b = rgbBlue;

  const hexStr = rgbToHex(r, g, b);
  const rgbStr = `R: ${r}  G: ${g}  B: ${b}`;
  const [h, s, l] = rgbToHsl(r, g, b);
  const hslStr = `H: ${h}°  S: ${s}%  L: ${l}%`;

  // Update displays
  const colorChip = document.getElementById('rgb-color-chip');
  const rValue = document.getElementById('r-value');
  const gValue = document.getElementById('g-value');
  const bValue = document.getElementById('b-value');
  const hexCodeEl = document.getElementById('rgb-hex-code');
  const rgbCodeEl = document.getElementById('rgb-rgb-code');
  const hslCodeEl = document.getElementById('rgb-hsl-code');

  if (colorChip) colorChip.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  if (rValue) rValue.textContent = r;
  if (gValue) gValue.textContent = g;
  if (bValue) bValue.textContent = b;
  if (hexCodeEl) hexCodeEl.textContent = hexStr;
  if (rgbCodeEl) rgbCodeEl.textContent = rgbStr;
  if (hslCodeEl) hslCodeEl.textContent = hslStr;

  // Update 3D cube point position
  updateCubePoint();
}

// Update cube point position based on RGB values
function updateCubePoint() {
  const point = document.getElementById('cube-point');
  if (!point) return;

  // Map RGB (0-255) to cube coordinates (-75 to 75px for 150px cube)
  const x = (rgbRed / 255) * 150 - 75;
  const y = -((rgbGreen / 255) * 150 - 75); // Invert Y for CSS
  const z = (rgbBlue / 255) * 150 - 75;

  point.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;

  // Set color for 3D sphere wireframe
  const color = `rgb(${rgbRed}, ${rgbGreen}, ${rgbBlue})`;
  point.style.color = color;

  // Set core sphere background
  const core = point.querySelector('.sphere-core');
  if (core) {
    core.style.background = `radial-gradient(
      circle at 35% 35%,
      rgba(255,255,255,0.6) 0%,
      ${color} 40%,
      rgb(${Math.floor(rgbRed*0.4)}, ${Math.floor(rgbGreen*0.4)}, ${Math.floor(rgbBlue*0.4)}) 100%
    )`;
  }
}

// Initialize RGB sliders and controls
function initializeRGBSliders() {
  const rSlider = document.getElementById('r-slider');
  const gSlider = document.getElementById('g-slider');
  const bSlider = document.getElementById('b-slider');

  if (!rSlider || !gSlider || !bSlider) return;

  rSlider.value = rgbRed;
  gSlider.value = rgbGreen;
  bSlider.value = rgbBlue;

  rSlider.addEventListener('input', () => {
    rgbRed = parseInt(rSlider.value, 10);
    updateRGBColor();
  });

  gSlider.addEventListener('input', () => {
    rgbGreen = parseInt(gSlider.value, 10);
    updateRGBColor();
  });

  bSlider.addEventListener('input', () => {
    rgbBlue = parseInt(bSlider.value, 10);
    updateRGBColor();
  });

  // Preset buttons
  const presetBtns = document.querySelectorAll('.rgb-preset-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      rgbRed = parseInt(btn.getAttribute('data-r'), 10);
      rgbGreen = parseInt(btn.getAttribute('data-g'), 10);
      rgbBlue = parseInt(btn.getAttribute('data-b'), 10);
      rSlider.value = rgbRed;
      gSlider.value = rgbGreen;
      bSlider.value = rgbBlue;
      updateRGBColor();
    });
  });

  // Random button
  const randomBtn = document.getElementById('btn-rgb-random');
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      rgbRed = Math.floor(Math.random() * 256);
      rgbGreen = Math.floor(Math.random() * 256);
      rgbBlue = Math.floor(Math.random() * 256);
      rSlider.value = rgbRed;
      gSlider.value = rgbGreen;
      bSlider.value = rgbBlue;
      updateRGBColor();
    });
  }

  // Reset button
  const resetBtn = document.getElementById('btn-rgb-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      rgbRed = 128;
      rgbGreen = 128;
      rgbBlue = 128;
      rSlider.value = rgbRed;
      gSlider.value = rgbGreen;
      bSlider.value = rgbBlue;
      updateRGBColor();
    });
  }

  updateRGBColor();
}

// Initialize RGB 3D cube with drag rotation
function initializeRGBCube() {
  const cube = document.getElementById('rgb-cube');
  const scene = document.querySelector('.rgb-cube-scene');

  if (!cube || !scene) return;

  function updateCubeRotation() {
    cube.style.transform = `rotateX(${cubeRotateX}deg) rotateY(${cubeRotateY}deg)`;
  }

  scene.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    scene.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;
    cubeRotateY += deltaX * 0.5;
    cubeRotateX -= deltaY * 0.5;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    updateCubeRotation();
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    if (scene) scene.style.cursor = 'grab';
  });

  // Touch support
  scene.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
    }
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - lastMouseX;
    const deltaY = e.touches[0].clientY - lastMouseY;
    cubeRotateY += deltaX * 0.5;
    cubeRotateX -= deltaY * 0.5;
    lastMouseX = e.touches[0].clientX;
    lastMouseY = e.touches[0].clientY;
    updateCubeRotation();
  }, { passive: true });

  document.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Corner buttons - click to set RGB
  const cornerBtns = document.querySelectorAll('.corner-btn');
  cornerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const r = parseInt(btn.getAttribute('data-r'), 10);
      const g = parseInt(btn.getAttribute('data-g'), 10);
      const b = parseInt(btn.getAttribute('data-b'), 10);
      setRGBValues(r, g, b);
    });
  });

  // Set cube point button - sync from sliders
  const setCubeBtn = document.getElementById('btn-set-cube-point');
  if (setCubeBtn) {
    setCubeBtn.addEventListener('click', () => {
      updateCubePoint();
      // Visual feedback
      const point = document.getElementById('cube-point');
      if (point) {
        point.style.boxShadow = '0 0 20px rgba(255, 255, 255, 1), 0 0 40px rgba(255, 255, 255, 0.8)';
        setTimeout(() => {
          point.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.8)';
        }, 500);
      }
    });
  }

  updateCubeRotation();
  updateCubePoint();
}

// Helper function to set RGB values and update all displays
function setRGBValues(r, g, b) {
  rgbRed = r;
  rgbGreen = g;
  rgbBlue = b;

  const rSlider = document.getElementById('r-slider');
  const gSlider = document.getElementById('g-slider');
  const bSlider = document.getElementById('b-slider');

  if (rSlider) rSlider.value = r;
  if (gSlider) gSlider.value = g;
  if (bSlider) bSlider.value = b;

  updateRGBColor();
}

// ===== Color Similarity Calculator =====

// Compare cube rotation state
let compareCubeRotateX = -20;
let compareCubeRotateY = 45;
let isCompareDragging = false;
let lastCompareMouseX = 0;
let lastCompareMouseY = 0;

function initializeSimilarityCalculator() {
  const sliders = {
    rA: document.getElementById('compare-r-a'),
    gA: document.getElementById('compare-g-a'),
    bA: document.getElementById('compare-b-a'),
    rB: document.getElementById('compare-r-b'),
    gB: document.getElementById('compare-g-b'),
    bB: document.getElementById('compare-b-b')
  };

  // Check if elements exist
  if (!sliders.rA) return;

  // Update compare cube point position
  function updateComparePoint(pointEl, r, g, b) {
    if (!pointEl) return;

    // Map RGB to cube coordinates (120px cube, centered at origin which is at corner)
    // Origin (0,0,0) is at back-bottom-left corner
    const x = (r / 255) * 120 - 60;
    const y = -((g / 255) * 120 - 60);
    const z = (b / 255) * 120 - 60;

    pointEl.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;

    const color = `rgb(${r}, ${g}, ${b})`;
    pointEl.style.color = color;

    const core = pointEl.querySelector('.sphere-core');
    if (core) {
      core.style.background = `radial-gradient(
        circle at 35% 35%,
        rgba(255,255,255,0.6) 0%,
        ${color} 40%,
        rgb(${Math.floor(r*0.4)}, ${Math.floor(g*0.4)}, ${Math.floor(b*0.4)}) 100%
      )`;
    }

    return { x, y, z };
  }

  // Update distance line between two points
  function updateDistanceLine(posA, posB) {
    const line = document.getElementById('distance-line');
    if (!line || !posA || !posB) return;

    const dx = posB.x - posA.x;
    const dy = posB.y - posA.y;
    const dz = posB.z - posA.z;

    const length = Math.sqrt(dx*dx + dy*dy + dz*dz);

    // Calculate rotation angles
    const rotateZ = Math.atan2(dy, dx) * (180 / Math.PI);
    const rotateY = -Math.atan2(dz, Math.sqrt(dx*dx + dy*dy)) * (180 / Math.PI);

    line.style.width = `${length}px`;
    line.style.left = `${60 + posA.x}px`;
    line.style.top = `${60 + posA.y}px`;
    line.style.transform = `translateZ(${posA.z}px) rotateZ(${rotateZ}deg) rotateY(${rotateY}deg)`;
  }

  // Update legend colors
  function updateLegend(rA, gA, bA, rB, gB, bB) {
    const dotA = document.querySelector('.dot-a');
    const dotB = document.querySelector('.dot-b');
    if (dotA) dotA.style.background = `rgb(${rA}, ${gA}, ${bA})`;
    if (dotB) dotB.style.background = `rgb(${rB}, ${gB}, ${bB})`;
  }

  function updateSimilarity() {
    const rA = parseInt(sliders.rA.value);
    const gA = parseInt(sliders.gA.value);
    const bA = parseInt(sliders.bA.value);
    const rB = parseInt(sliders.rB.value);
    const gB = parseInt(sliders.gB.value);
    const bB = parseInt(sliders.bB.value);

    // Update value displays
    document.getElementById('compare-r-a-val').textContent = rA;
    document.getElementById('compare-g-a-val').textContent = gA;
    document.getElementById('compare-b-a-val').textContent = bA;
    document.getElementById('compare-r-b-val').textContent = rB;
    document.getElementById('compare-g-b-val').textContent = gB;
    document.getElementById('compare-b-b-val').textContent = bB;

    // Update color previews
    document.getElementById('compare-color-a').style.background = `rgb(${rA}, ${gA}, ${bA})`;
    document.getElementById('compare-color-b').style.background = `rgb(${rB}, ${gB}, ${bB})`;

    // Update 3D cube points
    const pointA = document.getElementById('compare-point-a');
    const pointB = document.getElementById('compare-point-b');
    const posA = updateComparePoint(pointA, rA, gA, bA);
    const posB = updateComparePoint(pointB, rB, gB, bB);

    // Update distance line
    updateDistanceLine(posA, posB);

    // Update legend colors
    updateLegend(rA, gA, bA, rB, gB, bB);

    // Calculate dot product
    const dotProduct = rA * rB + gA * gB + bA * bB;

    // Calculate magnitudes
    const magA = Math.sqrt(rA * rA + gA * gA + bA * bA);
    const magB = Math.sqrt(rB * rB + gB * gB + bB * bB);
    const magProduct = magA * magB;

    // Calculate cosine similarity
    let cosineSim = 0;
    if (magProduct > 0) {
      cosineSim = dotProduct / magProduct;
    }

    // Calculate Euclidean distance
    const euclidean = Math.sqrt(
      Math.pow(rA - rB, 2) + Math.pow(gA - gB, 2) + Math.pow(bA - bB, 2)
    );

    // Update displays
    document.getElementById('vector-a-display').textContent = `(${rA}, ${gA}, ${bA})`;
    document.getElementById('vector-b-display').textContent = `(${rB}, ${gB}, ${bB})`;
    document.getElementById('dot-product-display').textContent = dotProduct.toLocaleString();
    document.getElementById('magnitude-display').textContent = magProduct.toFixed(1);
    document.getElementById('cosine-similarity-display').textContent = cosineSim.toFixed(3);
    document.getElementById('euclidean-display').textContent = euclidean.toFixed(1);

    // Interpretation with cube context
    const interpretation = document.getElementById('similarity-interpretation');
    let message = '';
    let distanceNote = '';

    // Distance interpretation
    if (euclidean < 50) {
      distanceNote = appLanguage === 'en'
        ? `The Euclidean distance of ${euclidean.toFixed(0)} is very small; the colors are nearly identical, including lightness.`
        : `ユークリッド距離 ${euclidean.toFixed(0)} は非常に近く、明るさも含めてほぼ同じ色です。`;
    } else if (euclidean < 150) {
      distanceNote = appLanguage === 'en'
        ? `The Euclidean distance of ${euclidean.toFixed(0)} places the colors relatively close together.`
        : `ユークリッド距離 ${euclidean.toFixed(0)} はやや近い位置です。`;
    } else {
      distanceNote = appLanguage === 'en'
        ? `The Euclidean distance of ${euclidean.toFixed(0)} places the colors far apart.`
        : `ユークリッド距離 ${euclidean.toFixed(0)} は離れた位置にあります。`;
    }

    if (magA === 0 || magB === 0) {
      message = appLanguage === 'en'
        ? '⚠️ Cosine similarity is undefined for black (0,0,0), because it is the zero vector.'
        : '⚠️ 黒 (0,0,0) はゼロベクトルのため、コサイン類似度は定義できません。';
    } else if (cosineSim >= 0.95) {
      message = appLanguage === 'en'
        ? `📐 <strong>Cosine similarity ${cosineSim.toFixed(3)}</strong>: The vectors point in almost the <strong>same direction</strong>. Their RGB proportions are similar, so they may differ mainly in lightness.<br>📏 ${distanceNote}`
        : `📐 <strong>コサイン類似度 ${cosineSim.toFixed(3)}</strong>: 原点から見てほぼ<strong>同じ方向</strong>。色味（RGB比率）が同じで、明るさだけが異なる可能性があります。<br>📏 ${distanceNote}`;
    } else if (cosineSim >= 0.8) {
      message = appLanguage === 'en'
        ? `📐 <strong>Cosine similarity ${cosineSim.toFixed(3)}</strong>: The vectors point in <strong>similar directions</strong>, indicating similar RGB proportions.<br>📏 ${distanceNote}`
        : `📐 <strong>コサイン類似度 ${cosineSim.toFixed(3)}</strong>: 原点から見て<strong>近い方向</strong>。色味が似ています。<br>📏 ${distanceNote}`;
    } else if (cosineSim >= 0.5) {
      message = appLanguage === 'en'
        ? `📐 <strong>Cosine similarity ${cosineSim.toFixed(3)}</strong>: The vectors point in <strong>somewhat different directions</strong>, indicating different RGB proportions.<br>📏 ${distanceNote}`
        : `📐 <strong>コサイン類似度 ${cosineSim.toFixed(3)}</strong>: 原点から見て<strong>やや異なる方向</strong>。色味に違いがあります。<br>📏 ${distanceNote}`;
    } else if (cosineSim >= 0) {
      message = appLanguage === 'en'
        ? `📐 <strong>Cosine similarity ${cosineSim.toFixed(3)}</strong>: The vectors point in <strong>substantially different directions</strong>.<br>📏 ${distanceNote}`
        : `📐 <strong>コサイン類似度 ${cosineSim.toFixed(3)}</strong>: 原点から見て<strong>かなり異なる方向</strong>。色味が大きく異なります。<br>📏 ${distanceNote}`;
    } else {
      message = appLanguage === 'en'
        ? `📐 <strong>Cosine similarity ${cosineSim.toFixed(3)}</strong>: The vectors point in opposite directions, which is unusual in RGB space.<br>📏 ${distanceNote}`
        : `📐 <strong>コサイン類似度 ${cosineSim.toFixed(3)}</strong>: 反対方向の色です（RGB空間では珍しい）。<br>📏 ${distanceNote}`;
    }
    interpretation.innerHTML = `<p>${message}</p>`;
  }

  // Compare cube rotation
  const compareCube = document.getElementById('compare-cube');
  const compareScene = document.getElementById('compare-cube-scene');

  if (compareCube && compareScene) {
    function updateCompareCubeRotation() {
      compareCube.style.transform = `rotateX(${compareCubeRotateX}deg) rotateY(${compareCubeRotateY}deg)`;
    }

    compareScene.addEventListener('mousedown', (e) => {
      isCompareDragging = true;
      lastCompareMouseX = e.clientX;
      lastCompareMouseY = e.clientY;
      compareScene.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isCompareDragging) return;
      const deltaX = e.clientX - lastCompareMouseX;
      const deltaY = e.clientY - lastCompareMouseY;
      compareCubeRotateY += deltaX * 0.5;
      compareCubeRotateX -= deltaY * 0.5;
      lastCompareMouseX = e.clientX;
      lastCompareMouseY = e.clientY;
      updateCompareCubeRotation();
    });

    document.addEventListener('mouseup', () => {
      if (isCompareDragging) {
        isCompareDragging = false;
        if (compareScene) compareScene.style.cursor = 'grab';
      }
    });

    // Touch support
    compareScene.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isCompareDragging = true;
        lastCompareMouseX = e.touches[0].clientX;
        lastCompareMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!isCompareDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - lastCompareMouseX;
      const deltaY = e.touches[0].clientY - lastCompareMouseY;
      compareCubeRotateY += deltaX * 0.5;
      compareCubeRotateX -= deltaY * 0.5;
      lastCompareMouseX = e.touches[0].clientX;
      lastCompareMouseY = e.touches[0].clientY;
      updateCompareCubeRotation();
    }, { passive: true });

    document.addEventListener('touchend', () => {
      isCompareDragging = false;
    });

    updateCompareCubeRotation();
  }

  // Add event listeners to all sliders
  Object.values(sliders).forEach(slider => {
    slider.addEventListener('input', updateSimilarity);
  });

  // Initial calculation
  updateSimilarity();
}

// DOMContentLoaded - 遅延読み込みのため初期化はTabLoaderが担当
// 各機能はタブ読み込み時にTabLoader.initializeTabComponents()から呼び出される
document.addEventListener('DOMContentLoaded', () => {
  console.log('Color Hack Box initialized - tabs will be loaded on demand');
});
