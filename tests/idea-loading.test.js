const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createIdeaLoadingMarkup,
  getIdeaLoadingButtonLabel,
} = require('../assets/js/idea-loading.js');

test('createIdeaLoadingMarkup includes reassuring loading copy', () => {
  const markup = createIdeaLoadingMarkup();

  assert.match(markup, /Generando una idea inclusiva/i);
  assert.match(markup, /Esto puede tardar unos segundos/i);
  assert.match(markup, /idea-loading/i);
});

test('getIdeaLoadingButtonLabel returns pending label', () => {
  assert.equal(getIdeaLoadingButtonLabel(), 'GENERANDO IDEA...');
});
