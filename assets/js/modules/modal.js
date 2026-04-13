export function createModal({ root, closeButton }) {
  if (!root || !closeButton) return { show: () => {}, hide: () => {} };

  const card = root.querySelector('.modal-card');
  const titleNode = root.querySelector('#modal-title');
  const messageNode = root.querySelector('#modal-message');
  let previousFocus = null;

  const onKeyDown = (event) => {
    if (event.key === 'Escape') hide();
  };

  const hide = () => {
    root.hidden = true;
    root.removeEventListener('keydown', onKeyDown);
    previousFocus?.focus?.();
  };

  const show = ({ title = 'Notificación', message = '' }) => {
    previousFocus = document.activeElement;
    if (titleNode) titleNode.textContent = title;
    if (messageNode) messageNode.textContent = message;
    root.hidden = false;
    root.addEventListener('keydown', onKeyDown);
    card?.focus();
  };

  root.addEventListener('click', (event) => {
    if (event.target === root) hide();
  });
  closeButton.addEventListener('click', hide);

  return { show, hide };
}
