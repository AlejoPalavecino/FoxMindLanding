const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_ELAPSED_MS = 2500;

function json(statusCode, payload) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  };
}

function parseBody(event) {
  try {
    return JSON.parse(event.body || '{}');
  } catch {
    return null;
  }
}

function validate(payload) {
  if (!payload || typeof payload !== 'object') return 'Payload inválido.';

  const required = ['fullName', 'position', 'school', 'email'];
  for (const key of required) {
    if (!payload[key] || typeof payload[key] !== 'string' || payload[key].trim().length < 2) {
      return `Campo inválido: ${key}.`;
    }
  }

  if (!EMAIL_RE.test(payload.email.trim())) return 'Email inválido.';
  if (payload.website && String(payload.website).trim().length > 0) return 'Solicitud rechazada.';

  const submittedAt = Date.parse(payload.submittedAt || '');
  if (Number.isNaN(submittedAt)) return 'Marca temporal inválida.';

  const elapsed = Date.now() - submittedAt;
  if (elapsed < MIN_ELAPSED_MS || elapsed > 1000 * 60 * 60 * 24) return 'Tiempo de envío inválido.';

  if (payload.message && String(payload.message).length > 500) return 'Mensaje demasiado largo.';
  return null;
}

async function deliverLead(payload) {
  const destination = process.env.CONTACT_EMAIL || 'edufoxmind@gmail.com';
  console.log('New lead', {
    destination,
    fullName: payload.fullName,
    position: payload.position,
    school: payload.school,
    email: payload.email
  });
}

exports.validateContactPayload = validate;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, message: 'Method not allowed' });

  const payload = parseBody(event);
  const validationError = validate(payload);
  if (validationError) return json(400, { ok: false, message: validationError });

  try {
    await deliverLead(payload);
    return json(200, {
      ok: true,
      message: 'Recibimos tu solicitud. Te contactamos dentro de las próximas 24 horas hábiles.'
    });
  } catch (error) {
    console.error('submit-contact error', error);
    return json(500, { ok: false, message: 'No se pudo procesar la solicitud.' });
  }
};
