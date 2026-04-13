import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { handler, validateIdeaInput } = require('../generate-idea.js');

const validBody = {
  subject: 'Fracciones',
  grade: '5to',
  challenge: 'Baja participación al resolver problemas'
};

describe('generate-idea function', () => {
  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns fallback idea on happy path without provider key', async () => {
    const response = await handler({ httpMethod: 'POST', body: JSON.stringify(validBody) });
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.idea.title.length).toBeGreaterThan(0);
    expect(Array.isArray(body.idea.activitySteps)).toBe(true);
  });

  it('rejects malformed input', async () => {
    const response = await handler({ httpMethod: 'POST', body: JSON.stringify({ challenge: 'corto' }) });
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(400);
    expect(body.ok).toBe(false);
  });

  it('rejects non-POST method', async () => {
    const response = await handler({ httpMethod: 'GET', body: '{}' });
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(405);
    expect(body.ok).toBe(false);
  });

  it('constrains oversized and hostile fields in validated input', () => {
    const validated = validateIdeaInput({
      subject: 'Matemática<script>alert(1)</script>',
      grade: '5to <b>A</b>',
      challenge: `${'x'.repeat(400)}<img src=x onerror=alert(1)>`
    });

    expect(typeof validated).toBe('object');
    expect(validated.subject.includes('<')).toBe(false);
    expect(validated.grade.includes('>')).toBe(false);
    expect(validated.challenge.length).toBe(280);
    expect(validated.challenge.includes('<')).toBe(false);
  });

  it('falls back when provider throws error', async () => {
    process.env.GEMINI_API_KEY = 'fake';
    global.fetch = vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) });

    const response = await handler({ httpMethod: 'POST', body: JSON.stringify(validBody) });
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.degraded).toBe(true);
  });
});
