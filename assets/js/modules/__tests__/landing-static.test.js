/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const cssSource = readFileSync(resolve(process.cwd(), 'assets/css/source.css'), 'utf8');
const doc = new DOMParser().parseFromString(html, 'text/html');

describe('landing static structure and metadata', () => {
  it('keeps conversion section order and CTA anchors', () => {
    const orderedIds = ['inicio', 'beneficios', 'capacidades', 'como-funciona', 'demo-ia', 'faq', 'contacto'];
    const sections = Array.from(doc.querySelectorAll('main > section[id]')).map((node) => node.id);

    expect(sections).toEqual(orderedIds);
    expect(doc.querySelector('header a.cta-link')?.getAttribute('href')).toBe('#contacto');
    expect(doc.querySelector('#inicio .btn.btn-primary')?.getAttribute('href')).toBe('#contacto');
  });

  it('has accessibility and SEO baseline tags', () => {
    expect(doc.querySelectorAll('h1')).toHaveLength(1);
    expect(doc.querySelector('.skip-link')?.getAttribute('href')).toBe('#main-content');
    expect(doc.querySelector('title')?.textContent?.length).toBeGreaterThan(10);
    expect(doc.querySelector('meta[name="description"]')?.getAttribute('content')?.length).toBeGreaterThan(30);
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://foxmind.ar/');
    expect(doc.querySelector('meta[property="og:title"]')).toBeTruthy();
    expect(doc.querySelector('meta[name="twitter:title"]')).toBeTruthy();
  });

  it('uses compiled css and avoids runtime tailwind cdn', () => {
    const htmlLower = html.toLowerCase();
    expect(doc.querySelector('link[href="assets/css/main.css"]')).toBeTruthy();
    expect(htmlLower.includes('cdn.tailwindcss.com')).toBe(false);
  });

  it('lazy-loads non critical imagery in capabilities and footer', () => {
    const lazyImages = Array.from(doc.querySelectorAll('img[loading="lazy"]')).map((img) => img.getAttribute('src'));
    expect(lazyImages).toContain('assets/Imagen 01.png');
    expect(lazyImages).toContain('assets/Imagen 02.png');
    expect(lazyImages).toContain('assets/Imagen 03.png');
    expect(lazyImages).toContain('assets/FoxMindBlanco.png');
  });

  it('supports mobile readability baseline without horizontal scroll', () => {
    expect(doc.querySelector('meta[name="viewport"]')?.getAttribute('content')).toContain('width=device-width');
    expect(cssSource).toContain('body { overflow-x: clip; }');
    expect(cssSource).toContain('@media (max-width: 980px)');
    expect(cssSource).toContain('.hero-grid,.tab-panel,.card-grid,.faq-grid,.form-grid,.steps-grid,.footer-grid { grid-template-columns: 1fr; }');
  });

  it('enforces deeper accessibility evidence for images and form controls', () => {
    const images = Array.from(doc.querySelectorAll('img'));
    expect(images.length).toBeGreaterThan(0);
    images.forEach((img) => {
      expect((img.getAttribute('alt') || '').trim().length).toBeGreaterThan(0);
    });

    const controls = Array.from(doc.querySelectorAll('form input, form textarea, form select'));
    controls.forEach((control) => {
      const id = control.getAttribute('id');
      const type = (control.getAttribute('type') || '').toLowerCase();
      if (type === 'hidden' || id === 'website') return;
      if (!id) return;
      const label = doc.querySelector(`label[for="${id}"]`);
      expect(label).toBeTruthy();
    });

    expect(doc.querySelector('#contact-feedback')?.getAttribute('aria-live')).toBe('polite');
    expect(doc.querySelector('#idea-feedback')?.getAttribute('aria-live')).toBe('polite');
  });

  it('keeps constrained-network critical path free of blocking third-party scripts', () => {
    const scripts = Array.from(doc.querySelectorAll('script[src]')).map((node) => node.getAttribute('src') || '');
    expect(scripts).toEqual(['assets/js/main.js']);
    expect(doc.querySelector('#inicio img')?.getAttribute('loading')).not.toBe('lazy');
  });

  it('includes trust/objection handling content before final CTA', () => {
    const faqSection = doc.getElementById('faq');
    const contactSection = doc.getElementById('contacto');
    const mainSections = Array.from(doc.querySelectorAll('main section[id]'));
    const faqIndex = mainSections.findIndex((node) => node.id === 'faq');
    const contactIndex = mainSections.findIndex((node) => node.id === 'contacto');

    expect(faqSection?.textContent).toContain('Señales de confianza');
    expect(faqSection?.textContent).toContain('¿FoxMind reemplaza al docente?');
    expect(contactSection).toBeTruthy();
    expect(faqIndex).toBeGreaterThan(-1);
    expect(contactIndex).toBeGreaterThan(faqIndex);
  });
});
