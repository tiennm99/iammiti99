// Loaded only when params.themeToggle = true.
// Persists user preference and overrides system color-scheme.
(function () {
  const KEY = 'bonsai-theme';
  const root = document.documentElement;
  const saved = localStorage.getItem(KEY);
  if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;

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
