(() => {
  document.addEventListener('keydown', event => {
    const menu = document.querySelector('.mobile-menu[open]');
    if (event.key === 'Escape' && menu) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });

  document.addEventListener('click', event => {
    const link = event.target.closest('.mobile-menu a[href]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const menu = link.closest('.mobile-menu');
    menu.open = false;
    const destination = new URL(link.href);
    if (destination.origin === location.origin && destination.pathname === location.pathname && destination.search === location.search) {
      const target = document.getElementById(destination.hash.slice(1));
      if (target) {
        if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
        target.focus({preventScroll: true});
      }
    }
  });

  function compare(section) {
    const selectors = section.querySelector('.model-selectors');
    if (!selectors || selectors.dataset.ready) return;
    const inputs = [...selectors.querySelectorAll('select')];
    const mobile = window.matchMedia('(max-width: 759px)');
    function update() {
      const selected = inputs.map(input => input.value);
      inputs.forEach((input, index) => {
        for (const option of input.options) option.disabled = option.value === inputs[1 - index].value;
      });
      for (const row of section.querySelectorAll('tr')) {
        const cells = [...row.querySelectorAll('[data-col]')];
        for (const cell of cells) cell.classList.toggle('mobile-hide', !selected.includes(cell.dataset.col));
        const order = mobile.matches ? selected : ['1', '2', '3'];
        for (const id of order) {
          const cell = cells.find(entry => entry.dataset.col === id);
          if (cell) row.append(cell);
        }
      }
    }
    selectors.dataset.ready = 'true';
    selectors.hidden = false;
    selectors.addEventListener('change', update);
    mobile.addEventListener('change', update);
    section.closest('.shopify-section')?.addEventListener('shopify:section:unload', () => {
      mobile.removeEventListener('change', update);
    }, { once: true });
    update();
  }

  function gallery(root) {
    if (root.dataset.ready) return;
    root.dataset.ready = 'true';
    const main = root.querySelector('.gallery-main');
    const dialog = root.querySelector('dialog');
    root.addEventListener('click', event => {
      const thumb = event.target.closest('[data-thumb]');
      if (thumb && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        const img = main.querySelector('img');
        img.sizes = thumb.dataset.sizes;
        img.srcset = thumb.dataset.srcset;
        img.src = thumb.href;
        img.alt = thumb.dataset.alt;
        main.href = thumb.href;
        root.querySelector('[data-thumb][aria-current]')?.removeAttribute('aria-current');
        thumb.setAttribute('aria-current', 'true');
      }
      if (event.target.closest('.gallery-main') && dialog.showModal && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        const zoom = new Image();
        zoom.alt = main.querySelector('img').alt;
        zoom.src = main.href;
        dialog.querySelector('[data-zoom]').replaceChildren(zoom);
        dialog.showModal();
      }
      if (event.target.closest('[data-close]') || event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => main.focus());
  }

  function setup(root) {
    root.querySelectorAll('[data-compare]').forEach(compare);
    root.querySelectorAll('[data-gallery]').forEach(gallery);
  }
  setup(document);
  document.addEventListener('shopify:section:load', event => setup(event.target));
  const inquiry = document.querySelector('[data-inquiry]');
  const query = new URLSearchParams(location.search);
  if (inquiry && !inquiry.value && query.get('model')) {
    inquiry.value = [query.get('model'), query.get('finish')].filter(Boolean).join(' / ') + '\n';
  }
  document.querySelector('[data-result]')?.focus();

  document.addEventListener('submit', async event => {
    const form = event.target;
    if (!form.matches('.buy-form, .line-form') || !window.fetch) return;
    event.preventDefault();
    if (form.dataset.sending) return;
    const button = form.querySelector('button[type="submit"], button');
    const error = form.querySelector('.form-error');
    const data = new FormData(form);
    form.dataset.sending = 'true';
    button.disabled = true;
    error.textContent = '';
    try {
      const url = new URL(form.action);
      url.pathname += '.js';
      const response = await fetch(url, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      const result = await response.json();
      if (!response.ok || result.status >= 400) throw new Error(result.description || 'Review the quantity and try again.');
      if (form.matches('.line-form')) {
        const line = result.items.find(item => item.key === data.get('id'));
        if (Number(data.get('quantity')) !== (line?.quantity || 0)) {
          location.assign(form.dataset.cartUrl + '?quantity_adjusted=1');
          return;
        }
      }
      location.assign(form.dataset.cartUrl);
    } catch (issue) {
      error.textContent = issue instanceof TypeError || issue instanceof SyntaxError
        ? 'The bag could not be confirmed. Check your bag before trying again.'
        : issue.message;
      error.focus();
      button.disabled = false;
      delete form.dataset.sending;
    }
  });
  if (query.get('quantity_adjusted') === '1') document.querySelector('[data-quantity-note]')?.removeAttribute('hidden');
})();
