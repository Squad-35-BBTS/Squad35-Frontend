(function () {
  let observer;

  function positionButton() {
    const widget = window.VLibrasWidget;

    const container =
      widget?.access ||
      document
        .getElementById('vlibras-access-wrapper')
        ?.shadowRoot?.querySelector('#vlibras-access') ||
      document.querySelector('[vw]');

    if (!container?.style) return;

    container.style.setProperty('right', '0px', 'important');
    container.style.setProperty('margin-right', '0px', 'important');
    container.style.setProperty('left', 'auto', 'important');

    const button = widget?.initBtn;

    if (button?.style) {
      button.style.setProperty('right', '0px', 'important');
      button.style.setProperty('margin-right', '0px', 'important');
    }

    observer?.disconnect();
    window.removeEventListener('load', positionButton);
  }

  observer = new MutationObserver(positionButton);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  window.addEventListener('load', positionButton, {
    once: true,
  });

  positionButton();
})();