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
