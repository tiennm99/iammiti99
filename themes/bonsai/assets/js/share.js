// Bonsai page-share button.
// Tries navigator.share first; falls back to clipboard.writeText with a toast.
// Loaded only when params.share = true.
(function () {
  var btn = document.querySelector('[data-bonsai-share]');
  if (!btn) return;
  var toast = document.querySelector('.bio__share-toast');
  var toastTimer;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 2000);
  }

  btn.addEventListener('click', async function () {
    var url = btn.getAttribute('data-share-url');
    var title = btn.getAttribute('data-share-title');
    var copiedMsg = btn.getAttribute('data-toast-copied') || 'Link copied';
    var failedMsg = btn.getAttribute('data-toast-failed') || 'Could not share';
    try {
      if (navigator.share) {
        await navigator.share({ title: title, url: url });
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        showToast(copiedMsg);
        return;
      }
      window.prompt('Copy link:', url);
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      showToast(failedMsg);
    }
  });
})();
