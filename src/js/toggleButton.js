export function hideButton(el) {
  if (!el.classList.contains('is-hidden')) {
    el.classList.add('is-hidden');
  }
}

export function showButton(el, fetch) {
  if (fetch.query === '') {
    return;
  }

  if (el.classList.contains('is-hidden')) {
    el.classList.remove('is-hidden');
  }
}
