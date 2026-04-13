# Landing V2 QA Checklist

## Funnel and CTA
- [x] Hero carga con CTA principal visible en mobile y desktop. _(evidencia: `assets/js/modules/__tests__/landing-static.test.js`)_
- [x] El orden de secciones se mantiene: hero > beneficios > capacidades > cómo funciona > demo IA > FAQ > contacto. _(evidencia: `assets/js/modules/__tests__/landing-static.test.js`)_
- [x] CTA del header y hero llevan al formulario final. _(evidencia: `assets/js/modules/__tests__/landing-static.test.js`)_
- [x] Baseline mobile evita desborde horizontal y mantiene layout de una columna. _(evidencia: `assets/js/modules/__tests__/landing-static.test.js`)_

## Contact Lifecycle
- [x] Validaciones client-side muestran mensajes por campo. _(evidencia: `assets/js/modules/__tests__/interactive-modules.test.js`)_
- [x] Honeypot bloquea envío si se completa. _(evidencia: `netlify/functions/__tests__/submit-contact.test.js`)_
- [x] Envío válido muestra feedback de éxito y modal. _(evidencia: `assets/js/modules/__tests__/interactive-modules.test.js` + `netlify/functions/__tests__/submit-contact.test.js`)_
- [x] Envío válido muestra estado explícito pendiente antes de resolver. _(evidencia: `assets/js/modules/__tests__/interactive-modules.test.js`)_
- [x] Error de red muestra feedback de error y no rompe la UI. _(evidencia: `assets/js/modules/__tests__/interactive-modules.test.js`)_

## AI Demo Recovery
- [x] Demo rechaza desafío vacío. _(evidencia: `assets/js/modules/__tests__/interactive-modules.test.js`)_
- [x] Demo exitoso renderiza título, resumen, pasos y adaptaciones. _(evidencia: `assets/js/modules/__tests__/interactive-modules.test.js`)_
- [x] Contenido malicioso no se inyecta como HTML ejecutable. _(evidencia: `assets/js/modules/__tests__/idea-demo.test.js`)_
- [x] Si falla proveedor, el sistema responde con fallback seguro. _(evidencia: `netlify/functions/__tests__/generate-idea.test.js`)_
- [x] Si backend responde en modo degradado, UI comunica warning sin romper interacción. _(evidencia: `assets/js/modules/__tests__/interactive-modules.test.js`)_
- [x] Entradas abusivas quedan contenidas al área de preview sin alterar header/footer. _(evidencia: `assets/js/modules/__tests__/interactive-modules.test.js`)_

## Accessibility Smoke
- [x] Existe skip link funcional. _(evidencia: `assets/js/modules/__tests__/landing-static.test.js`)_
- [x] Navegación móvil respeta `aria-expanded`. _(evidencia: `assets/js/modules/__tests__/interactive-modules.test.js`)_
- [x] Tabs permiten teclado (ArrowLeft/ArrowRight/Home/End). _(evidencia: `assets/js/modules/__tests__/interactive-modules.test.js`)_
- [x] Formularios tienen labels y regiones `aria-live`. _(evidencia: `assets/js/modules/__tests__/landing-static.test.js`)_
- [x] Imágenes incluyen texto alternativo no vacío. _(evidencia: `assets/js/modules/__tests__/landing-static.test.js`)_

## SEO and Metadata
- [x] Solo un H1 en la página. _(evidencia: `assets/js/modules/__tests__/landing-static.test.js`)_
- [x] Title y meta description presentes y descriptivos. _(evidencia: `assets/js/modules/__tests__/landing-static.test.js`)_
- [x] Canonical, Open Graph y Twitter tags presentes. _(evidencia: `assets/js/modules/__tests__/landing-static.test.js`)_

## Performance Basics
- [x] No se usa Tailwind CDN en runtime. _(evidencia: `assets/js/modules/__tests__/landing-static.test.js`)_
- [x] CSS compilado desde `assets/css/source.css`. _(evidencia: `npm run build:css` + `assets/js/modules/__tests__/landing-static.test.js`)_
- [x] Imágenes no críticas usan `loading=lazy`. _(evidencia: `assets/js/modules/__tests__/landing-static.test.js`)_
- [x] Cobertura ejecutable habilitada con provider v8 para regresiones. _(evidencia: `npm run test:coverage`)_
