/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { renderIdeaSafely } from '../idea-demo.js';

describe('idea demo safe renderer', () => {
  it('renders structured content without injecting html', () => {
    const container = document.createElement('section');
    const malicious = {
      title: '<img src=x onerror=alert(1)>',
      summary: '<script>alert(1)</script>',
      activitySteps: ['Paso 1', '<b>Paso 2</b>'],
      adaptations: {
        representation: '<svg onload=alert(1)>',
        expression: 'Texto',
        engagement: 'Texto'
      }
    };

    renderIdeaSafely(container, malicious);

    expect(container.querySelector('script')).toBeNull();
    expect(container.innerHTML.includes('<img')).toBe(false);
    expect(container.textContent).toContain('Paso 1');
    expect(container.textContent).toContain('Representación');
  });
});
