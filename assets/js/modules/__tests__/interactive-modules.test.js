/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initNavigation } from '../navigation.js';
import { initTabs } from '../tabs.js';
import { initContactForm } from '../contact-form.js';
import { initIdeaDemo } from '../idea-demo.js';

function createModalSpy() {
  return { show: vi.fn(), hide: vi.fn() };
}

describe('interactive module behavior', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('updates mobile navigation aria-expanded and closes on link click', () => {
    document.body.innerHTML = `
      <header id="site-header"></header>
      <button id="mobile-menu-button" aria-expanded="false">Menú</button>
      <nav id="primary-navigation"><a href="#contacto">Contacto</a></nav>
    `;

    const header = document.getElementById('site-header');
    const menuButton = document.getElementById('mobile-menu-button');
    const menu = document.getElementById('primary-navigation');
    initNavigation({ header, menuButton, menu });

    menuButton.click();
    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
    expect(menu.classList.contains('is-open')).toBe(true);

    menu.querySelector('a').click();
    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    expect(menu.classList.contains('is-open')).toBe(false);
  });

  it('supports keyboard tab navigation with arrow and home/end keys', () => {
    document.body.innerHTML = `
      <section data-tabs>
        <div role="tablist">
          <button id="tab-a" role="tab" aria-controls="panel-a" aria-selected="true">A</button>
          <button id="tab-b" role="tab" aria-controls="panel-b" aria-selected="false" tabindex="-1">B</button>
          <button id="tab-c" role="tab" aria-controls="panel-c" aria-selected="false" tabindex="-1">C</button>
        </div>
        <article id="panel-a" role="tabpanel"></article>
        <article id="panel-b" role="tabpanel" hidden></article>
        <article id="panel-c" role="tabpanel" hidden></article>
      </section>
    `;

    const container = document.querySelector('[data-tabs]');
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    initTabs(container);

    tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');

    tabs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');

    tabs[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
  });

  it('shows client validation feedback on invalid contact submit', async () => {
    document.body.innerHTML = `
      <form id="contact-form" novalidate>
        <input id="full-name" name="fullName" value="Li" />
        <select id="position" name="position"><option value="">Seleccioná</option></select>
        <input id="school" name="school" value="Es" />
        <input id="email" name="email" value="email-invalido" />
        <textarea id="message" name="message"></textarea>
        <input id="website" name="website" value="" />
        <input id="submitted-at" name="submittedAt" value="${new Date().toISOString()}" />
        <button id="contact-submit" type="submit">Quiero ser de los primeros</button>
        <p id="contact-feedback" class="feedback" aria-live="polite"></p>
        <p data-error-for="full-name"></p>
        <p data-error-for="position"></p>
        <p data-error-for="school"></p>
        <p data-error-for="email"></p>
      </form>
    `;

    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('contact-feedback');
    const modal = createModalSpy();
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    initContactForm({ form, feedback, modal });
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(feedback.textContent).toContain('Revisá los campos marcados');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows success flow for contact submit and opens success modal', async () => {
    document.body.innerHTML = `
      <form id="contact-form" novalidate>
        <input id="full-name" name="fullName" value="Lucia Dominguez" />
        <select id="position" name="position"><option value="docente" selected>Docente</option></select>
        <input id="school" name="school" value="Escuela 123" />
        <input id="email" name="email" value="lucia@example.com" />
        <textarea id="message" name="message">Interesados en demo.</textarea>
        <input id="website" name="website" value="" />
        <input id="submitted-at" name="submittedAt" value="${new Date(Date.now() - 7000).toISOString()}" />
        <button id="contact-submit" type="submit">Quiero ser de los primeros</button>
        <p id="contact-feedback" class="feedback" aria-live="polite"></p>
        <p data-error-for="full-name"></p>
        <p data-error-for="position"></p>
        <p data-error-for="school"></p>
        <p data-error-for="email"></p>
      </form>
    `;

    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('contact-feedback');
    const modal = createModalSpy();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, message: 'Todo bien.' })
    }));

    initContactForm({ form, feedback, modal });
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(feedback.textContent).toContain('Enviando solicitud...');
    expect(feedback.classList.contains('is-pending')).toBe(true);
    await Promise.resolve();
    await Promise.resolve();

    expect(feedback.textContent).toContain('Todo bien.');
    expect(modal.show).toHaveBeenCalled();
  });

  it('shows degraded-mode warning when idea demo returns fallback response', async () => {
    document.body.innerHTML = `
      <form id="idea-form" novalidate>
        <input id="idea-subject" name="subject" value="Matemática" />
        <input id="idea-grade" name="grade" value="5to" />
        <textarea id="idea-challenge" name="challenge">Baja participación al resolver problemas.</textarea>
        <button id="idea-submit" type="submit">Generar idea segura</button>
        <p id="idea-feedback" class="feedback" aria-live="polite"></p>
      </form>
      <section id="idea-result"></section>
      <div id="hero-copy">Hero no cambia</div>
    `;

    const form = document.getElementById('idea-form');
    const feedback = document.getElementById('idea-feedback');
    const result = document.getElementById('idea-result');
    const modal = createModalSpy();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        degraded: true,
        idea: {
          title: 'Fallback seguro',
          summary: 'Resumen fallback',
          activitySteps: ['Paso 1'],
          adaptations: { representation: 'Visual', expression: 'Oral', engagement: 'Juego' }
        }
      })
    }));

    initIdeaDemo({ form, result, feedback, modal });
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();
    await Promise.resolve();

    expect(feedback.classList.contains('is-warning')).toBe(true);
    expect(feedback.textContent).toContain('modo degradado');
    expect(result.textContent).toContain('Fallback seguro');
    expect(document.getElementById('hero-copy').textContent).toBe('Hero no cambia');
  });

  it('contains abusive-input render impact to preview area only', async () => {
    document.body.innerHTML = `
      <header id="safe-header">FoxMind Header</header>
      <form id="idea-form" novalidate>
        <input id="idea-subject" name="subject" value="<script>bad()</script>" />
        <input id="idea-grade" name="grade" value="5to" />
        <textarea id="idea-challenge" name="challenge">${'A'.repeat(280)}</textarea>
        <button id="idea-submit" type="submit">Generar idea segura</button>
        <p id="idea-feedback" class="feedback" aria-live="polite"></p>
      </form>
      <section id="idea-result"></section>
      <footer id="safe-footer">Footer estable</footer>
    `;

    const form = document.getElementById('idea-form');
    const feedback = document.getElementById('idea-feedback');
    const result = document.getElementById('idea-result');
    const modal = createModalSpy();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        idea: {
          title: '<img src=x onerror=alert(1)>',
          summary: '<script>alert(1)</script>',
          activitySteps: ['<b>uno</b>'],
          adaptations: { representation: '<svg onload=1>', expression: 'Oral', engagement: 'Roles' }
        }
      })
    }));

    initIdeaDemo({ form, result, feedback, modal });
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();
    await Promise.resolve();

    expect(result.querySelector('script')).toBeNull();
    expect(result.textContent).toContain('Representación');
    expect(document.getElementById('safe-header').textContent).toBe('FoxMind Header');
    expect(document.getElementById('safe-footer').textContent).toBe('Footer estable');
  });

  it('shows network error feedback for contact submit', async () => {
    document.body.innerHTML = `
      <form id="contact-form" novalidate>
        <input id="full-name" name="fullName" value="Lucia Dominguez" />
        <select id="position" name="position"><option value="docente" selected>Docente</option></select>
        <input id="school" name="school" value="Escuela 123" />
        <input id="email" name="email" value="lucia@example.com" />
        <textarea id="message" name="message">Interesados en demo.</textarea>
        <input id="website" name="website" value="" />
        <input id="submitted-at" name="submittedAt" value="${new Date(Date.now() - 7000).toISOString()}" />
        <button id="contact-submit" type="submit">Quiero ser de los primeros</button>
        <p id="contact-feedback" class="feedback" aria-live="polite"></p>
        <p data-error-for="full-name"></p>
        <p data-error-for="position"></p>
        <p data-error-for="school"></p>
        <p data-error-for="email"></p>
      </form>
    `;

    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('contact-feedback');
    const modal = createModalSpy();

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')));

    initContactForm({ form, feedback, modal });
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();
    await Promise.resolve();

    expect(feedback.textContent).toContain('Network down');
    expect(modal.show).toHaveBeenCalled();
  });

  it('rejects empty challenge in idea demo before request', () => {
    document.body.innerHTML = `
      <form id="idea-form" novalidate>
        <input id="idea-subject" name="subject" value="Matemática" />
        <input id="idea-grade" name="grade" value="5to" />
        <textarea id="idea-challenge" name="challenge"></textarea>
        <button id="idea-submit" type="submit">Generar idea segura</button>
        <p id="idea-feedback" class="feedback" aria-live="polite"></p>
      </form>
      <section id="idea-result"></section>
    `;

    const form = document.getElementById('idea-form');
    const feedback = document.getElementById('idea-feedback');
    const result = document.getElementById('idea-result');
    const modal = createModalSpy();
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    initIdeaDemo({ form, result, feedback, modal });
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(feedback.textContent).toContain('Describí un desafío');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('renders demo response and reports success', async () => {
    document.body.innerHTML = `
      <form id="idea-form" novalidate>
        <input id="idea-subject" name="subject" value="Matemática" />
        <input id="idea-grade" name="grade" value="5to" />
        <textarea id="idea-challenge" name="challenge">Baja participación al resolver problemas.</textarea>
        <button id="idea-submit" type="submit">Generar idea segura</button>
        <p id="idea-feedback" class="feedback" aria-live="polite"></p>
      </form>
      <section id="idea-result"></section>
    `;

    const form = document.getElementById('idea-form');
    const feedback = document.getElementById('idea-feedback');
    const result = document.getElementById('idea-result');
    const modal = createModalSpy();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        idea: {
          title: 'Idea inclusiva',
          summary: 'Resumen breve',
          activitySteps: ['Paso 1', 'Paso 2'],
          adaptations: { representation: 'Visual', expression: 'Oral', engagement: 'Roles' }
        }
      })
    }));

    initIdeaDemo({ form, result, feedback, modal });
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();
    await Promise.resolve();

    expect(feedback.textContent).toContain('Idea generada con éxito');
    expect(result.textContent).toContain('Idea inclusiva');
    expect(result.querySelector('script')).toBeNull();
  });

  it('shows demo error modal when provider request fails', async () => {
    document.body.innerHTML = `
      <form id="idea-form" novalidate>
        <input id="idea-subject" name="subject" value="Matemática" />
        <input id="idea-grade" name="grade" value="5to" />
        <textarea id="idea-challenge" name="challenge">Baja participación al resolver problemas.</textarea>
        <button id="idea-submit" type="submit">Generar idea segura</button>
        <p id="idea-feedback" class="feedback" aria-live="polite"></p>
      </form>
      <section id="idea-result"></section>
    `;

    const form = document.getElementById('idea-form');
    const feedback = document.getElementById('idea-feedback');
    const result = document.getElementById('idea-result');
    const modal = createModalSpy();

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Provider unavailable')));

    initIdeaDemo({ form, result, feedback, modal });
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();
    await Promise.resolve();

    expect(feedback.textContent).toContain('Provider unavailable');
    expect(modal.show).toHaveBeenCalled();
  });
});
