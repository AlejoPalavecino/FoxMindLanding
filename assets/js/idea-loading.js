(function (global) {
  function createIdeaLoadingMarkup() {
    return [
      '<div class="idea-loading animate-fadeIn" role="status" aria-live="polite">',
      '  <div class="idea-loading__spinner" aria-hidden="true"></div>',
      '  <div class="idea-loading__content">',
      '    <p class="idea-loading__title">Generando una idea inclusiva</p>',
      '    <p class="idea-loading__copy">Esto puede tardar unos segundos mientras Gemini arma una propuesta util para el aula.</p>',
      '    <div class="idea-loading__steps" aria-hidden="true">',
      '      <span></span><span></span><span></span>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');
  }

  function getIdeaLoadingButtonLabel() {
    return 'GENERANDO IDEA...';
  }

  const api = {
    createIdeaLoadingMarkup,
    getIdeaLoadingButtonLabel,
  };

  global.FoxMindIdeaLoading = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
