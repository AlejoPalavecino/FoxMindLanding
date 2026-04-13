import { initNavigation } from './modules/navigation.js';
import { initTabs } from './modules/tabs.js';
import { createModal } from './modules/modal.js';
import { initContactForm } from './modules/contact-form.js';
import { initIdeaDemo } from './modules/idea-demo.js';

document.addEventListener('DOMContentLoaded', () => {
  const modal = createModal({
    root: document.getElementById('notification-modal'),
    closeButton: document.getElementById('modal-close')
  });

  initNavigation({
    header: document.getElementById('site-header'),
    menuButton: document.getElementById('mobile-menu-button'),
    menu: document.getElementById('primary-navigation')
  });

  initTabs(document.querySelector('[data-tabs]'));

  const submittedAt = document.getElementById('submitted-at');
  if (submittedAt) submittedAt.value = new Date().toISOString();

  initContactForm({
    form: document.getElementById('contact-form'),
    feedback: document.getElementById('contact-feedback'),
    modal
  });

  initIdeaDemo({
    form: document.getElementById('idea-form'),
    result: document.getElementById('idea-result'),
    feedback: document.getElementById('idea-feedback'),
    modal
  });
});
