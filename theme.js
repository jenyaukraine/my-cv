(function () {
  const KEY = 'cv_theme';

  function apply(theme) {
    const light = theme === 'light';
    document.body.classList.toggle('theme-light', light);
    const toggles = document.querySelectorAll('.theme-toggle-input');
    toggles.forEach(t => { t.checked = light; });
  }

  function init() {
    const saved = localStorage.getItem(KEY);
    apply(saved === 'light' ? 'light' : 'dark');

    document.querySelectorAll('.theme-toggle-input').forEach(input => {
      input.addEventListener('change', () => {
        const theme = input.checked ? 'light' : 'dark';
        localStorage.setItem(KEY, theme);
        apply(theme);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
