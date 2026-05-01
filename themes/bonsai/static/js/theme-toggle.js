// Optional: enable via params.themeToggle = true in hugo.toml
// Persists user preference and overrides system theme.
(function () {
  const KEY = 'bonsai-theme';
  const root = document.documentElement;
  const saved = localStorage.getItem(KEY);
  if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;

  const btn = document.querySelector('[data-bonsai-theme-toggle]');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = current;
    localStorage.setItem(KEY, current);
  });
})();
