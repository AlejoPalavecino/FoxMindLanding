# Configuración de Variables de Entorno - FoxMind

Este proyecto utiliza variables de entorno para mantener la configuración sensible de forma segura.

## 📋 Variables Requeridas

### EmailJS (para el formulario de contacto)
- `EMAILJS_PUBLIC_KEY`: Clave pública de tu cuenta EmailJS
- `EMAILJS_SERVICE_ID`: ID del servicio de email configurado
- `EMAILJS_TEMPLATE_ID`: ID del template de email
- `CONTACT_EMAIL`: Email donde recibir los formularios (default: edufoxmind@gmail.com)

### Gemini API (para el generador de ideas)
- `GEMINI_API_KEY`: API key de Google Gemini

## 🔧 Configuración Local

1. **Copia el archivo de ejemplo:**
   ```bash
   cp .env.example .env
   ```

2. **Edita el archivo `.env` con tus valores reales:**
   ```
   GEMINI_API_KEY=tu_api_key_real
   EMAILJS_PUBLIC_KEY=tu_public_key_real
   EMAILJS_SERVICE_ID=tu_service_id_real
   EMAILJS_TEMPLATE_ID=tu_template_id_real
   CONTACT_EMAIL=tu@email.com
   ```

## 🌐 Configuración en Netlify

1. **Ve a tu dashboard de Netlify**
2. **Selecciona tu sitio → Site settings → Environment variables**
3. **Agrega las siguientes variables:**
   - `EMAILJS_PUBLIC_KEY`
   - `EMAILJS_SERVICE_ID`
   - `EMAILJS_TEMPLATE_ID`
   - `CONTACT_EMAIL`
   - `GEMINI_API_KEY`

## 📧 Configuración de EmailJS

### Paso 1: Crear cuenta
1. Ve a [emailjs.com](https://www.emailjs.com/)
2. Crea una cuenta gratuita

### Paso 2: Configurar servicio de email
1. En el dashboard → "Email Services"
2. Agrega Gmail (recomendado)
3. Sigue las instrucciones para conectar tu cuenta

### Paso 3: Crear template
1. Ve a "Email Templates"
2. Crea un nuevo template con este contenido:

**Asunto:** `Nueva solicitud de acceso prioritario - FoxMind`

**Contenido:**
```
Nueva solicitud de acceso prioritario a FoxMind:

Nombre: {{from_name}}
Email: {{from_email}}
Cargo: {{position}}
Escuela: {{school}}

Mensaje adicional:
{{message}}

---
Email enviado desde: {{reply_to}}
Fecha: {{date}}
```

### Paso 4: Obtener las claves
1. **Public Key:** Account → General → Public Key
2. **Service ID:** Email Services → tu servicio → Service ID
3. **Template ID:** Email Templates → tu template → Template ID

## 🔒 Seguridad

- ✅ El archivo `.env` está en `.gitignore` (no se sube al repositorio)
- ✅ Las variables se sirven mediante Netlify Functions de forma segura
- ✅ No hay claves expuestas en el código frontend
- ✅ Fallback a configuración local para desarrollo

## 🚀 Cómo funciona

1. **En producción (Netlify):** Las variables se obtienen desde las Environment Variables de Netlify mediante la función `get-config`
2. **En desarrollo local:** Las variables se leen desde el archivo `.env` local
3. **Fallback:** Si no hay configuración disponible, se muestra un mensaje para contactar directamente por email

## ❗ Importante

- Nunca subas el archivo `.env` al repositorio
- Configura las variables en Netlify antes de hacer deploy
- Las claves de EmailJS pueden ser públicas (Public Key), pero es buena práctica mantenerlas en variables de entorno