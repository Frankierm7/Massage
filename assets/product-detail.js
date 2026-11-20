(() => {
  const originalTitle = document.title;
  let active = null;

  function showRoute() {
    const [id, search] = location.hash.slice(1).split('?');
    const candidate = document.getElementById(id);
    const next = candidate?.matches('[data-detail-page]') ? candidate : null;
    const previous = active;
    active = next;
    if (previous && previous !== next) previous.removeAttribute('data-active');

    if (!next) {
      if (id !== 'contact-us') document.title = originalTitle;
      if (previous && (id === 'chair-guide' || id === 'chair-comparison')) candidate?.scrollIntoView();
      return;
    }

    next.setAttribute('data-active', '');
    const finishes = [...next.querySelectorAll('input[data-color]')];
    const selected = new URLSearchParams(search).get('finish');
    const input = finishes.find(radio => radio.dataset.color === selected) || finishes[0];
    if (input) input.checked = true;
    const heading = next.querySelector('[data-detail-heading]');
    document.title = heading.textContent.trim() + ' Massage Chair | Dusk Arbor';
    if (next !== previous) {
      document.querySelector('.mobile-menu[open]')?.removeAttribute('open');
      heading.setAttribute('aria-level', '1');
      heading.focus({ preventScroll: true });
      next.scrollIntoView({ block: 'start' });
    }
  }

  document.querySelector('.skip')?.addEventListener('click', event => {
    const heading = active?.querySelector('[data-detail-heading]') ||
      (location.hash === '#contact-us' && document.querySelector('#contact-us h1'));
    if (!heading) return;
    event.preventDefault();
    heading.focus();
    heading.scrollIntoView({ block: 'start' });
  });

  function syncLink(card) {
    if (!card) return;
    const color = card.querySelector('input[data-color]:checked')?.dataset.color;
    for (const link of card.querySelectorAll('a[data-detail-link]')) {
      const hash = link.hash.split('?')[0];
      if (color && hash) link.setAttribute('href', hash + '?finish=' + encodeURIComponent(color));
    }
  }
  document.addEventListener('change', event => {
    const control = event.target;
    if (!control.matches('input[data-color]')) return;
    const page = control.closest('[data-detail-page]');
    if (page && page === active) {
      history.replaceState(history.state, '', '#' + page.id + '?finish=' + encodeURIComponent(control.dataset.color));
    } else {
      syncLink(control.closest('.guide-card'));
    }
  });

  // With JavaScript disabled, the default links still open CSS-targeted detail pages.
  window.addEventListener('hashchange', showRoute);
  window.addEventListener('pageshow', () => {
    document.querySelectorAll('.guide-card').forEach(syncLink);
    showRoute();
  });
  document.addEventListener('shopify:section:load', showRoute);
  showRoute();
})();
