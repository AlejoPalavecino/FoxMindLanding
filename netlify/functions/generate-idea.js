function json(statusCode, payload) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  };
}

function sanitizeText(value, max) {
  return String(value || '').trim().replace(/[<>]/g, '').slice(0, max);
}

function validateInput(payload) {
  if (!payload || typeof payload !== 'object') return 'Solicitud inválida.';

  const subject = sanitizeText(payload.subject, 80);
  const grade = sanitizeText(payload.grade, 60);
  const challenge = sanitizeText(payload.challenge, 280);

  if (!challenge || challenge.length < 8) return 'El desafío debe tener al menos 8 caracteres.';
  return { subject, grade, challenge };
}

function fallbackIdea(parsed) {
  return {
    title: 'Rueda de opciones inclusivas',
    summary: `Actividad sugerida para ${parsed.grade || 'tu curso'} sobre ${parsed.subject || 'el tema propuesto'}.`,
    activitySteps: [
      `Presentar el desafío: ${parsed.challenge}.`,
      'Ofrecer tres formas de acceso al contenido: visual, oral y manipulativa.',
      'Trabajar en parejas con roles rotativos y cierre colaborativo.'
    ],
    adaptations: {
      representation: 'Usar apoyos visuales, ejemplos concretos y explicación oral breve.',
      expression: 'Permitir respuesta escrita, oral o mediante esquema gráfico.',
      engagement: 'Incluir elección de roles y metas cortas con feedback positivo.'
    }
  };
}

async function callGemini(parsed, apiKey) {
  const prompt = `Sos especialista en educación inclusiva. Devolvé SOLO JSON con keys: title, summary, activitySteps (max 3), adaptations{representation,expression,engagement}. Tema: ${parsed.subject || 'General'}. Grado: ${parsed.grade || 'No especificado'}. Desafío: ${parsed.challenge}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  if (!response.ok) throw new Error('Gemini request failed');

  const payload = await response.json();
  const raw = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error('No content from provider');

  const idea = JSON.parse(raw);
  return {
    title: sanitizeText(idea.title, 120),
    summary: sanitizeText(idea.summary, 320),
    activitySteps: (idea.activitySteps || []).slice(0, 3).map((x) => sanitizeText(x, 180)).filter(Boolean),
    adaptations: {
      representation: sanitizeText(idea?.adaptations?.representation, 220),
      expression: sanitizeText(idea?.adaptations?.expression, 220),
      engagement: sanitizeText(idea?.adaptations?.engagement, 220)
    }
  };
}

exports.validateIdeaInput = validateInput;
exports.fallbackIdea = fallbackIdea;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, message: 'Method not allowed' });

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { ok: false, message: 'Body inválido.' });
  }

  const parsed = validateInput(payload);
  if (typeof parsed === 'string') return json(400, { ok: false, message: parsed });

  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const idea = apiKey ? await callGemini(parsed, apiKey) : fallbackIdea(parsed);
    return json(200, { ok: true, idea });
  } catch (error) {
    console.error('generate-idea error', error);
    return json(200, { ok: true, idea: fallbackIdea(parsed), degraded: true });
  }
};
