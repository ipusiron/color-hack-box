(function () {
  'use strict';
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('lang');
  let stored = null;
  try { stored = localStorage.getItem('color-hack-language'); } catch (error) { stored = null; }
  const detected = navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en';
  const language = ['ja', 'en'].includes(requested) ? requested : (['ja', 'en'].includes(stored) ? stored : detected);
  try { localStorage.setItem('color-hack-language', language); } catch (error) { /* optional */ }
  const current = document.documentElement.lang === 'en' ? 'en' : 'ja';
  if (language !== current) {
    params.set('lang', language);
    const target = language === 'en' ? 'index.en.html' : 'index.html';
    window.location.replace(`${target}?${params.toString()}${window.location.hash}`);
  }
})();
