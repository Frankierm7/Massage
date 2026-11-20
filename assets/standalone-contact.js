(() => {
  if (!document.documentElement.hasAttribute('data-standalone')) return;
  const view = document.getElementById('contact-us');
  const template = view?.querySelector('template');
  if (!template) return;

  const content = template.content;
  const form = content.querySelector('[data-inquiry-draft]');
  const status = form?.querySelector('[data-download-status]');
  const heading = content.querySelector('h1');
  // Mount only the active view; moving its nodes preserves draft input across navigation.
  const nodes = [...content.childNodes];
  let previousSummary = '';

  function enterContact() {
    if (location.hash !== '#contact-us') {
      if (heading.isConnected) content.append(...nodes);
      return;
    }
    if (!heading.isConnected) view.append(...nodes);
    document.title = heading.textContent + ' – Dusk Arbor';
    document.querySelector('.mobile-menu[open]')?.removeAttribute('open');
    heading.focus({ preventScroll: true });
    view.scrollIntoView();
  }
  window.addEventListener('hashchange', enterContact);
  enterContact();
  if (!form) return;
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-contact-link]');
    const summary = link?.dataset.inquiryContext;
    if (!summary) return;
    const field = form.elements.message;
    if (previousSummary && field.value.includes(previousSummary)) {
      field.value = field.value.replace(previousSummary, () => summary);
    } else {
      const oldLines = new Set(previousSummary.split('\n'));
      const notes = previousSummary
        ? field.value.split('\n').filter(line => !oldLines.has(line)).join('\n')
        : field.value;
      field.value = notes ? notes + '\n\n' + summary : summary;
    }
    previousSummary = summary;
    status.hidden = true;
  });
  form.addEventListener('input', () => { status.hidden = true; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const fields = new FormData(form);
    const lines = [
      'Dusk Arbor inquiry', '',
      'Reason: ' + fields.get('reason'),
      'Name: ' + fields.get('name'),
      'Email: ' + fields.get('email')
    ];
    if (fields.get('order')) lines.push('Order number: ' + fields.get('order'));
    lines.push('', fields.get('message'));
    const file = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const download = document.createElement('a');
    download.href = url;
    download.download = 'dusk-arbor-inquiry.txt';
    document.body.append(download);
    download.click();
    download.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.hidden = false;
  });
})();
