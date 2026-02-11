import { verifyToken } from '../utils/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);

    const { patientName, context, mood } = req.body;

    // Use Anthropic API if available, otherwise use fallback messages
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

    if (ANTHROPIC_API_KEY) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 300,
            messages: [{
              role: 'user',
              content: `Eres un terapeuta profesional especializado en recuperación de adicciones.

Genera un mensaje de ánimo corto (2-3 frases) y personalizado para ${patientName || 'un paciente'}.

Contexto: ${context || 'Paciente en proceso de rehabilitación'}
Estado de ánimo reciente: ${mood || 'variable'}

El mensaje debe ser:
- Cálido y empático
- Motivador pero realista
- Enfocado en el progreso, no en la perfección
- En español
- Sin usar emojis

Solo responde con el mensaje, sin introducción.`
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const generatedMessage = data.content[0].text;

          return res.status(200).json({
            success: true,
            message: generatedMessage,
            source: 'ai'
          });
        }
      } catch (aiError) {
        console.error('AI generation error:', aiError);
        // Fall through to fallback messages
      }
    }

    // Fallback motivational messages
    const fallbackMessages = [
      `Hola ${patientName || 'amigo/a'}, quiero que sepas que estoy muy orgulloso de tu progreso. Cada día que avanzas es una victoria, sin importar lo pequeña que parezca. Sigue adelante.`,
      `${patientName || 'Estimado/a'}, recuerda que la recuperación no es una línea recta. Los altibajos son parte del proceso. Lo importante es que sigues intentándolo. Estás haciendo un trabajo increíble.`,
      `Hola ${patientName || 'querido/a paciente'}, tu esfuerzo diario no pasa desapercibido. La constancia que muestras es admirable. Confío en tu capacidad de seguir creciendo. Un paso a la vez.`,
      `${patientName || 'Amigo/a'}, en este camino de recuperación, recuerda ser amable contigo mismo/a. Celebra tus pequeños logros y aprende de los tropiezos. Estás construyendo una nueva vida.`,
      `Hola ${patientName || 'valiente'}, quiero recordarte que pedir ayuda es señal de fortaleza, no de debilidad. Estás rodeado/a de personas que creen en ti. Sigue confiando en el proceso.`
    ];

    const randomMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

    return res.status(200).json({
      success: true,
      message: randomMessage,
      source: 'fallback'
    });

  } catch (error) {
    console.error('Error generating message:', error);
    return res.status(500).json({ error: 'Failed to generate message' });
  }
}
