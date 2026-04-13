const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setFieldError(form, id, message) {
  const node = form.querySelector(`[data-error-for="${id}"]`);
  if (node) node.textContent = message;
}

function clearFeedback(feedback) {
  feedback.textContent = '';
  feedback.classList.remove('is-success', 'is-error');
}

function setFeedback(feedback, type, message) {
  feedback.textContent = message;
  feedback.classList.remove('is-success', 'is-error', 'is-pending', 'is-warning');

  if (type === 'success') {
    feedback.classList.add('is-success');
    return;
  }

  if (type === 'pending') {
    feedback.classList.add('is-pending');
    return;
  }

  if (type === 'warning') {
    feedback.classList.add('is-warning');
    return;
  }

  feedback.classList.add('is-error');
}

function validate(form) {
  const fullName = form.querySelector('#full-name');
  const position = form.querySelector('#position');
  const school = form.querySelector('#school');
  const email = form.querySelector('#email');

  const values = {
    fullName: fullName.value.trim(),
    position: position.value.trim(),
    school: school.value.trim(),
    email: email.value.trim()
  };

  let valid = true;
  setFieldError(form, 'full-name', '');
  setFieldError(form, 'position', '');
  setFieldError(form, 'school', '');
  setFieldError(form, 'email', '');

  if (values.fullName.length < 3) {
    setFieldError(form, 'full-name', 'Ingresá un nombre válido (mín. 3).');
    valid = false;
  }
  if (!values.position) {
    setFieldError(form, 'position', 'Seleccioná tu cargo.');
    valid = false;
  }
  if (values.school.length < 3) {
    setFieldError(form, 'school', 'Ingresá institución (mín. 3).');
    valid = false;
  }
  if (!EMAIL_RE.test(values.email)) {
    setFieldError(form, 'email', 'Ingresá un email válido.');
    valid = false;
  }

  return valid;
}

export function initContactForm({ form, feedback, modal }) {
  if (!form || !feedback) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFeedback(feedback);

    if (!validate(form)) {
      setFeedback(feedback, 'error', 'Revisá los campos marcados para continuar.');
      return;
    }

    const submitButton = form.querySelector('#contact-submit');
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';
    setFeedback(feedback, 'pending', 'Enviando solicitud...');

    const payload = {
      fullName: form.querySelector('#full-name').value.trim(),
      position: form.querySelector('#position').value,
      school: form.querySelector('#school').value.trim(),
      email: form.querySelector('#email').value.trim(),
      message: form.querySelector('#message').value.trim(),
      website: form.querySelector('#website').value,
      submittedAt: form.querySelector('#submitted-at').value || new Date().toISOString()
    };

    try {
      const response = await fetch('/.netlify/functions/submit-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'No se pudo enviar la solicitud.');

      setFeedback(feedback, 'success', data.message || '¡Listo! Te contactamos pronto.');
      form.reset();
      form.querySelector('#submitted-at').value = new Date().toISOString();
      modal?.show({ title: 'Solicitud enviada', message: data.message || 'Gracias por tu interés.' });
    } catch (error) {
      setFeedback(feedback, 'error', error.message || 'No pudimos enviar. Probá de nuevo.');
      modal?.show({ title: 'No se pudo enviar', message: 'Intentá nuevamente o escribinos a edufoxmind@gmail.com.' });
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Quiero ser de los primeros';
    }
  });
}
