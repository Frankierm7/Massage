(() => {
  if (!document.documentElement.hasAttribute('data-standalone')) return;
  const bag = document.getElementById('shopping-bag');
  if (!bag || typeof bag.showModal !== 'function') return;
  document.documentElement.classList.add('catalog-bag-ready');

  // The hosted shop uses Shopify's cart. Only the downloadable storefront uses browser storage.
  const storageKey = 'dusk-arbor.catalog-bag.v1';
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const lines = bag.querySelector('[data-bag-lines]');
  const status = bag.querySelector('[data-bag-status]');
  let items = [];
  let restoreFocus = null;
  let memoryOnly = false;

  function validLine(item) {
    return item && typeof item.key === 'string' && typeof item.title === 'string'
      && typeof item.color === 'string' && Number.isSafeInteger(item.cents) && item.cents > 0
      && Number.isSafeInteger(item.quantity) && item.quantity > 0;
  }

  function load() {
    if (memoryOnly) return;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(saved)) items = saved.filter(validLine);
    } catch {
      memoryOnly = true;
    }
  }

  function save() {
    if (memoryOnly) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      memoryOnly = true;
    }
  }

  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  function lineButton(item, action, text) {
    const button = node('button', text, action === 'remove' ? 'bag-remove' : '');
    button.type = 'button';
    button.dataset.action = action;
    const label = { subtract: 'Decrease quantity of', add: 'Increase quantity of', remove: 'Remove' };
    button.setAttribute('aria-label', label[action] + ' ' + item.title + ', ' + item.color);
    return button;
  }

  function draw() {
    const rendered = [];
    let count = 0;
    let subtotal = 0;
    for (const item of items) {
      const row = node('li');
      row.dataset.lineKey = item.key;
      row.dataset.lineColor = item.color;
      const heading = node('p', undefined, 'bag-line-head');
      heading.append(node('strong', item.title), node('span', money.format(item.cents * item.quantity / 100)));
      const controls = node('div', undefined, 'bag-quantity');
      controls.append(
        lineButton(item, 'subtract', '−'),
        node('span', 'Quantity ' + item.quantity),
        lineButton(item, 'add', '+'),
        lineButton(item, 'remove', 'Remove')
      );
      row.append(heading, node('p', item.color, 'bag-finish'), controls);
      rendered.push(row);
      count += item.quantity;
      subtotal += item.cents * item.quantity;
    }
    lines.replaceChildren(...rendered);
    const summary = items.map(item => item.quantity + ' × ' + item.title + ' (' + item.color + ')');
    const inquiry = bag.querySelector('[data-bag-inquiry]');
    if (inquiry) inquiry.dataset.inquiryContext = 'I have a question about these chairs:\n' + summary.join('\n');
    bag.querySelector('[data-bag-empty]').hidden = items.length > 0;
    bag.querySelector('[data-bag-totals]').hidden = !items.length;
    bag.querySelector('[data-bag-subtotal]').textContent = money.format(subtotal / 100);
    for (const link of document.querySelectorAll('.bag, [data-open-bag]')) {
      const countLabel = link.querySelector('[data-bag-count]');
      if (countLabel) countLabel.textContent = String(count);
      else {
        let text = [...link.childNodes].find(child => child.nodeType === Node.TEXT_NODE && child.textContent.includes('Bag'));
        if (!text) { text = document.createTextNode(''); link.append(text); }
        text.textContent = ' Bag (' + count + ')';
      }
      link.setAttribute('aria-label', 'Open bag, ' + count + (count === 1 ? ' item' : ' items'));
    }
  }

  function show(trigger) {
    draw();
    restoreFocus = trigger;
    if (!bag.open) bag.showModal();
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-catalog-add], .bag, [data-open-bag], [href="#shopping-bag"]');
    if (!trigger) return;
    event.preventDefault();
    load();
    if (trigger.hasAttribute('data-catalog-add')) {
      const selected = trigger.closest('[data-catalog-product]')?.querySelector('input[data-color]:checked');
      const color = selected?.dataset.color || trigger.dataset.color;
      const line = {
        key: trigger.dataset.productKey, title: trigger.dataset.title,
        cents: Number(trigger.dataset.priceCents), color, quantity: 1
      };
      if (!validLine(line) || !line.color) return;
      const existing = items.find(item => item.key === line.key && item.color === line.color);
      if (existing) {
        existing.quantity++;
        existing.cents = line.cents;
        existing.title = line.title;
      } else items.push(line);
      save();
      show(trigger);
      status.textContent = line.title + ', ' + line.color + ' added to bag.';
    } else {
      show(trigger);
      status.textContent = '';
    }
  });

  bag.addEventListener('click', event => {
    if (event.target.closest('[data-bag-inquiry]')) {
      restoreFocus = null;
      bag.close();
      return;
    }
    if (event.target === bag || event.target.closest('[data-bag-close]')) {
      bag.close();
      return;
    }
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const row = button.closest('[data-line-key]');
    load();
    const index = items.findIndex(item => item.key === row.dataset.lineKey && item.color === row.dataset.lineColor);
    if (index < 0) { draw(); return; }
    const item = items[index];
    const action = button.dataset.action;
    if (action === 'add') item.quantity++;
    if (action === 'subtract') item.quantity--;
    const removed = action === 'remove' || item.quantity === 0;
    if (removed) items.splice(index, 1);
    save();
    draw();
    const focusRow = lines.children[Math.min(index, items.length - 1)];
    (focusRow?.querySelector('button[data-action="' + action + '"]') || bag.querySelector('[data-bag-close]')).focus();
    status.textContent = item.title + ', ' + item.color + (removed ? ' removed.' : ' quantity ' + item.quantity + '.');
  });

  bag.addEventListener('close', () => restoreFocus?.focus());
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) { load(); draw(); }
  });
  window.addEventListener('pageshow', () => { load(); draw(); });
  load();
  draw();
})();
