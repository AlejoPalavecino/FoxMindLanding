import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { handler } = require('../submit-contact.js');

const validPayload = {
  fullName: 'Lucia Dominguez',
  position: 'docente',
  school: 'Escuela 123',
  email: 'lucia@example.com',
  message: 'Interesados en demo.',
  website: '',
  submittedAt: new Date(Date.now() - 7000).toISOString()
};

describe('submit-contact function', () => {
  it('returns success for valid payload', async () => {
    const response = await handler({ httpMethod: 'POST', body: JSON.stringify(validPayload) });
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
  });

  it('rejects invalid fields', async () => {
    const payload = { ...validPayload, email: 'bad-email' };
    const response = await handler({ httpMethod: 'POST', body: JSON.stringify(payload) });
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(400);
    expect(body.ok).toBe(false);
  });

  it('rejects honeypot submission', async () => {
    const payload = { ...validPayload, website: 'https://spam.example' };
    const response = await handler({ httpMethod: 'POST', body: JSON.stringify(payload) });
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(400);
    expect(body.ok).toBe(false);
  });
});
