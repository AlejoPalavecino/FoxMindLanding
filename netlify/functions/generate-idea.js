// Netlify Functions corre en Node 18+, fetch está disponible globalmente.
// Si tu entorno no tuviera fetch, podrías usar undici: npm i undici y luego: const { fetch } = require('undici');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: { 'Allow': 'POST' },
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    const { prompt } = JSON.parse(event.body || '{}');
    if (!prompt || typeof prompt !== 'string' || prompt.length > 8000) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Prompt inválido.' }) };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'API key no configurada.' }) };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };

    const r = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await r.text();
    if (!r.ok) {
      return { statusCode: r.status, body: JSON.stringify({ error: 'Gemini API error', details: text }) };
    }

    const data = JSON.parse(text);
    const html = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html })
    };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ error: 'Error interno del servidor.' }) };
  }
};
