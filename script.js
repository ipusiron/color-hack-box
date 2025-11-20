// スライダー要素取得
const hueSlider        = document.getElementById('hue-slider');
const lightnessSlider  = document.getElementById('lightness-slider');
const saturationSlider = document.getElementById('saturation-slider');

const hueValueDisplay        = document.getElementById('hue-value');
const lightnessValueDisplay  = document.getElementById('lightness-value');
const saturationValueDisplay = document.getElementById('saturation-value');

const colorChip   = document.getElementById('color-chip');
const hexCode     = document.getElementById('hex-code');
const rgbCode     = document.getElementById('rgb-code');
const hslCode     = document.getElementById('hsl-code');

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

  document.getElementById('btn-random').addEventListener('click', () => {
    hue        = Math.floor(Math.random()*361);
    lightness  = Math.floor(Math.random()*101);
    saturation = Math.floor(Math.random()*101);
    // スライダーの値を直接更新（イベントリスナーを再追加しない）
    hueSlider.value = hue;
    lightnessSlider.value = lightness;
    saturationSlider.value = saturation;
    updateColor();
  });
  document.getElementById('btn-reset').addEventListener('click', () => {
    hue        = 0;
    lightness  = 50;
    saturation = 50;
    // スライダーの値を直接更新（イベントリスナーを再追加しない）
    hueSlider.value = hue;
    lightnessSlider.value = lightness;
    saturationSlider.value = saturation;
    updateColor();
  });
  // 実験モードへの遷移ボタンは別タブ／別モード用実装を後で
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

// 初期化実行
if (hueSlider && lightnessSlider && saturationSlider && colorChip) {
  initializeSliders();
  updateColor();
  console.log('Color Hack Box initialized successfully');
} else {
  console.error('Failed to find slider or color chip elements');
  console.log('hueSlider:', hueSlider);
  console.log('lightnessSlider:', lightnessSlider);
  console.log('saturationSlider:', saturationSlider);
  console.log('colorChip:', colorChip);
}

// タブ切り替え機能
function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      // すべてのタブボタンとコンテンツから active クラスを削除
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // クリックされたタブボタンと対応するコンテンツに active クラスを追加
      button.classList.add('active');
      document.getElementById(targetTab).classList.add('active');

      // アクティブなタブボタンを中央にスクロール
      button.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    });
  });
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
      }

      try {
        await navigator.clipboard.writeText(textToCopy);

        // コピー成功のフィードバック
        const originalText = button.textContent;
        button.textContent = '✓';
        button.classList.add('copied');

        // トースト通知を表示
        showToast(`✓ ${formatName}コードをクリップボードにコピーしました`);

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
          showToast(`✓ ${formatName}コードをクリップボードにコピーしました`);

          setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
          }, 2000);
        } catch (fallbackErr) {
          console.error('フォールバックコピーも失敗しました:', fallbackErr);
          showToast('❌ コピーに失敗しました');
        }
      }
    });
  });
}

// コピーボタン初期化実行
initializeCopyButtons();

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

// 補色機能と類似色相機能、グレースケール機能の初期化
document.addEventListener('DOMContentLoaded', () => {
  initializeComplementaryWheel();
  initializeAnalogousWheel();
  initializeGrayscaleSlider();
});
