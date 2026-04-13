function activateTab(tabs, panels, index, focus = false) {
  tabs.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    panels[i].hidden = !selected;
    if (focus && selected) tab.focus();
  });
}

export function initTabs(container) {
  if (!container) return;
  const tabs = Array.from(container.querySelectorAll('[role="tab"]'));
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
  if (!tabs.length) return;

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tabs, panels, index));
    tab.addEventListener('keydown', (event) => {
      const current = tabs.indexOf(tab);
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        activateTab(tabs, panels, (current + 1) % tabs.length, true);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        activateTab(tabs, panels, (current - 1 + tabs.length) % tabs.length, true);
      } else if (event.key === 'Home') {
        event.preventDefault();
        activateTab(tabs, panels, 0, true);
      } else if (event.key === 'End') {
        event.preventDefault();
        activateTab(tabs, panels, tabs.length - 1, true);
      }
    });
  });

  activateTab(tabs, panels, 0);
}
