// Función de Netlify para servir configuración de EmailJS de forma segura
exports.handler = async (event, context) => {
  // Solo permitir requests GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Obtener variables de entorno de Netlify
    const config = {
      EMAILJS_PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY,
      EMAILJS_SERVICE_ID: process.env.EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID,
      CONTACT_EMAIL: process.env.CONTACT_EMAIL || 'edufoxmind@gmail.com'
    };

    // Verificar que las variables estén configuradas
    if (!config.EMAILJS_PUBLIC_KEY || !config.EMAILJS_SERVICE_ID || !config.EMAILJS_TEMPLATE_ID) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'EmailJS configuration not properly set up. Please configure environment variables in Netlify.' 
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: JSON.stringify(config)
    };
  } catch (error) {
    console.error('Error getting config:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};