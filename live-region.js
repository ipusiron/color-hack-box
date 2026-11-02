(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.LiveRegion = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Writes text into a live region only when it differs from what is already there,
  // so that screen readers are not asked to announce the same sentence again.
  function writeIfChanged(element, text) {
    if (!element) return false;
    const next = text == null ? '' : String(text);
    if (element.textContent === next) return false;
    element.textContent = next;
    return true;
  }

  // Decides whether an error live region should be written.
  // While typing (committed = false), only a change in the kind of error
  // (none, invalid tokens, range...) is announced; on commit (change, blur,
  // submit) the current full text is announced (writeIfChanged still skips
  // an identical sentence).
  function shouldWriteError(previousKind, nextKind, committed) {
    if (committed) return true;
    return (previousKind || '') !== (nextKind || '');
  }

  return Object.freeze({ writeIfChanged, shouldWriteError });
});
