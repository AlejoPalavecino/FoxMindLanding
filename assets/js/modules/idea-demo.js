function createTextElement(tag, text) {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}

export function renderIdeaSafely(container, idea) {
  container.replaceChildren();

  const fragment = document.createDocumentFragment();
  fragment.appendChild(createTextElement('h3', idea.title || 'Idea sugerida'));
  fragment.appendChild(createTextElement('p', idea.summary || 'Sin resumen.'));

  fragment.appendChild(createTextElement('h3', 'Actividad paso a paso'));
  const list = document.createElement('ul');
  for (const step of idea.activitySteps || []) list.appendChild(createTextElement('li', step));
  fragment.appendChild(list);

  fragment.appendChild(createTextElement('h3', 'Adaptaciones DUA'));
  const adaptationList = document.createElement('ul');
  const map = idea.adaptations || {};
  adaptationList.appendChild(createTextElement('li', `Representación: ${map.representation || 'No especificada.'}`));
  adaptationList.appendChild(createTextElement('li', `Expresión: ${map.expression || 'No especificada.'}`));
  adaptationList.appendChild(createTextElement('li', `Compromiso: ${map.engagement || 'No especificada.'}`));
  fragment.appendChild(adaptationList);

  container.appendChild(fragment);
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

export function initIdeaDemo({ form, result, feedback, modal }) {
  if (!form || !result || !feedback) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const subject = form.querySelector('#idea-subject').value.trim();
    const grade = form.querySelector('#idea-grade').value.trim();
    const challenge = form.querySelector('#idea-challenge').value.trim();

    if (!challenge) {
      setFeedback(feedback, 'error', 'Describí un desafío para continuar.');
      return;
    }

    const submitButton = form.querySelector('#idea-submit');
    submitButton.disabled = true;
    submitButton.textContent = 'Generando...';
    setFeedback(feedback, 'pending', 'Generando sugerencia pedagógica...');

    try {
      const response = await fetch('/.netlify/functions/generate-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, grade, challenge })
      });

      const data = await response.json();
      if (!response.ok || !data.ok || !data.idea) throw new Error(data.message || 'No pudimos generar la idea.');

      renderIdeaSafely(result, data.idea);
      if (data.degraded) {
        setFeedback(feedback, 'warning', 'Generamos una sugerencia segura en modo degradado por conectividad limitada.');
      } else {
        setFeedback(feedback, 'success', 'Idea generada con éxito.');
      }
    } catch (error) {
      setFeedback(feedback, 'error', error.message || 'Error al generar la idea.');
      modal?.show({ title: 'Error en demo IA', message: 'No se pudo generar la idea en este momento.' });
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Generar idea segura';
    }
  });
}
