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
      distanceNote = `ユークリッド距離 ${euclidean.toFixed(0)} は非常に近く、明るさも含めてほぼ同じ色です。`;
    } else if (euclidean < 150) {
      distanceNote = `ユークリッド距離 ${euclidean.toFixed(0)} はやや近い位置です。`;
    } else {
      distanceNote = `ユークリッド距離 ${euclidean.toFixed(0)} は離れた位置にあります。`;
    }

    if (magA === 0 || magB === 0) {
      message = '⚠️ 黒 (0,0,0) はゼロベクトルのため、コサイン類似度は定義できません。';
    } else if (cosineSim >= 0.95) {
      message = `📐 <strong>コサイン類似度 ${cosineSim.toFixed(3)}</strong>: 原点から見てほぼ<strong>同じ方向</strong>。色味（RGB比率）が同じで、明るさだけが異なる可能性があります。<br>📏 ${distanceNote}`;
    } else if (cosineSim >= 0.8) {
      message = `📐 <strong>コサイン類似度 ${cosineSim.toFixed(3)}</strong>: 原点から見て<strong>近い方向</strong>。色味が似ています。<br>📏 ${distanceNote}`;
    } else if (cosineSim >= 0.5) {
      message = `📐 <strong>コサイン類似度 ${cosineSim.toFixed(3)}</strong>: 原点から見て<strong>やや異なる方向</strong>。色味に違いがあります。<br>📏 ${distanceNote}`;
    } else if (cosineSim >= 0) {
      message = `📐 <strong>コサイン類似度 ${cosineSim.toFixed(3)}</strong>: 原点から見て<strong>かなり異なる方向</strong>。色味が大きく異なります。<br>📏 ${distanceNote}`;
    } else {
      message = `📐 <strong>コサイン類似度 ${cosineSim.toFixed(3)}</strong>: 反対方向の色です（RGB空間では珍しい）。<br>📏 ${distanceNote}`;
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

// 補色機能と類似色相機能、グレースケール機能、RGB機能の初期化
document.addEventListener('DOMContentLoaded', () => {
  initializeComplementaryWheel();
  initializeAnalogousWheel();
  initializeGrayscaleSlider();
  initializeRGBSliders();
  initializeRGBCube();
  initializeSimilarityCalculator();
});
