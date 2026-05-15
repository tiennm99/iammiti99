// Loaded only when params.themeToggle = true.
// Persists user preference and overrides system color-scheme.
// Note: a sibling inline script in <head> applies the saved value pre-paint to avoid FOUC.
// We re-read here as a safety net (and the inline script may have failed under strict CSP).
(function () {
  const KEY = 'bonsai-theme';
  const root = document.documentElement;
  if (root.dataset.theme !== 'light' && root.dataset.theme !== 'dark') {
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
  }

  const btn = document.querySelector('[data-bonsai-theme-toggle]');
  if (!btn) return;

  function syncPressed() {
    const isDark = root.dataset.theme === 'dark'
      || (root.dataset.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    btn.setAttribute('aria-pressed', String(isDark));
  }

  syncPressed();

  btn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem(KEY, next);
    syncPressed();
  });
})();
