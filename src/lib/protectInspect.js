/**
 * Anti-Inspect and Anti-Tamper Protection for S2 Teespoint
 * Disables context menu (right click), DevTools keyboard shortcuts,
 * and drag events to protect site layout and pricing from inspection/editing.
 */
export function initInspectProtection() {
  if (typeof window === 'undefined') return;

  // 1. Disable right-click context menu
  document.addEventListener(
    'contextmenu',
    (e) => {
      e.preventDefault();
      return false;
    },
    { capture: true }
  );

  // 2. Block DevTools keyboard shortcuts
  document.addEventListener(
    'keydown',
    (e) => {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // Ctrl + Shift + I (Inspect)
      // Ctrl + Shift + J (Console)
      // Ctrl + Shift + C (Inspect Element)
      // Ctrl + Shift + K (Firefox Console)
      if (
        isCtrlOrMeta &&
        e.shiftKey &&
        ['I', 'i', 'J', 'j', 'C', 'c', 'K', 'k'].includes(e.key)
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + U (View Source)
      if (isCtrlOrMeta && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + S (Save Page)
      if (isCtrlOrMeta && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    },
    { capture: true }
  );

  // 3. Disable image dragging
  document.addEventListener('dragstart', (e) => {
    if (e.target.nodeName === 'IMG') {
      e.preventDefault();
      return false;
    }
  });
}
