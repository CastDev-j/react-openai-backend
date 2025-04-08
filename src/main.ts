import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: 'https://react-gpt-castdev.netlify.app',
  });

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PRODUCT_LINK = 'https://digitalandiia.systeme.io/megapackdigital'; // Link directo de compra
const PRODUCT_INFO = {
  nombre: 'Mega Pack Digital de Digitalandia',
  precio: '$19 USD (pago único)',
  contenido: [
    '1.5 millones+ de recursos digitales',
    'Plantillas editables para negocios',
    'eBooks y cursos de marketing digital',
    'Pack de gráficos profesionales',
    'Acceso a comunidad exclusiva',
  ],
  beneficios: [
    'Acceso vitalicio inmediato',
    'Actualizaciones mensuales gratuitas',
    'Bonos exclusivos (valorados en $500 USD)',
    'Soporte prioritario',
    'Garantía de 7 días',
  ],
  metodoPago: ['Tarjetas de crédito/débito', 'PayPal', 'Transferencias'],
};

const client = new Client({
  authStrategy: new LocalAuth(),
});

const userSessions = new Map();

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('🚀 Yahaira - Asesora de Ventas Digitalandia lista');
});

async function generateAIResponse(userMessage, context = {}) {
  try {
    const prompt = `
Eres Yahaira, la experta en ventas del Mega Pack Digital de Digitalandia. Tu misión es guiar al cliente hacia la compra sin ser intrusiva.

**Personalidad:**
- 👩‍💼 Profesional y conocedora del producto
- 💖 Amable pero enfocada en resultados
- 🤓 Domina todos los detalles técnicos
- 🎯 Orientada a objeciones y cierre de ventas

**Información del Producto (NO revelar todo de golpe):**
${JSON.stringify(PRODUCT_INFO, null, 2)}

**Estrategia de venta:**
1. Primero identifica la necesidad real del cliente
2. Responde preguntas específicas con detalles relevantes
3. Maneja objeciones con datos concretos
4. Solo comparte el link cuando haya interés claro
5. Usa preguntas abiertas para guiar la conversación

**Contexto actual:**
${JSON.stringify(context, null, 2)}

**Historial reciente:**
${(context as { lastMessages: string[] }).lastMessages?.join('\n') || 'Primer contacto'}

**Mensaje del cliente:**
"${userMessage}"

**Instrucciones:**
- NO menciones el link hasta que pregunten explícitamente
- Usa máximo 2 emojis por mensaje
- Sé concisa (máximo 3 oraciones)
- Mantén el enfoque en los beneficios
- Cierra siempre con una pregunta o llamado a acción

Genera la mejor respuesta de ventas:
`;

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent',
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        params: { key: GEMINI_API_KEY },
        headers: { 'Content-Type': 'application/json' },
      },
    );

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text.trim();
  } catch (error) {
    console.error('Error en IA:', error);
    return null;
  }
}

client.on('message', async (message) => {
  const user = message.from;
  const msgText = message.body.trim();
  const now = Date.now();

  // Inicializar sesión
  if (!userSessions.has(user)) {
    userSessions.set(user, {
      stage: 'inicio',
      interestLevel: 0,
      objections: [],
      lastMessages: [],
      messageCount: 0,
      lastInteraction: now,
    });
  }

  const session = userSessions.get(user);
  session.messageCount++;
  session.lastInteraction = now;
  session.lastMessages.push(msgText);
  if (session.lastMessages.length > 5) session.lastMessages.shift();

  // Control de mensajes excesivos
  if (session.messageCount > 15 && now - session.lastInteraction < 3600000) {
    await message.reply(
      '💖 Gracias por tu interés. Por calidad de servicio, te pido esperar unos minutos antes de continuar. ¿Te gustaría que reserve la oferta actual para ti?',
    );
    return;
  }

  // Contexto para la IA
  const context = {
    stage: session.stage,
    interestLevel: session.interestLevel,
    objections: session.objections,
    productInfo: PRODUCT_INFO,
    lastMessages: session.lastMessages,
  };

  // Generar respuesta
  let response = await generateAIResponse(msgText, context);

  // Fallback si la IA falla
  if (!response) {
    response = `¡Vaya! 😅 Mi sistema tuvo un pequeño fallo. ¿Podrías repetir tu última pregunta?`;
  }

  // Actualizar estadísticas de sesión basado en la interacción
  if (
    msgText.includes('precio') ||
    msgText.includes('cuesta') ||
    msgText.includes('valor')
  ) {
    session.interestLevel += 1;
  }
  if (
    msgText.includes('comprar') ||
    msgText.includes('pagar') ||
    msgText.includes('adquirir')
  ) {
    session.interestLevel += 2;
  }
  if (
    msgText.includes('link') ||
    msgText.includes('enlace') ||
    msgText.includes('dónde comprar')
  ) {
    session.stage = 'cierre';
    response = `¡Perfecto! 😊 Aquí tienes el enlace directo para adquirir el Mega Pack Digital:\n\n${PRODUCT_LINK}\n\n¿Necesitas ayuda con el proceso de pago?`;
  }

  await message.reply(response);

  // Guardar nuestra respuesta en el historial
  session.lastMessages.push(response);
  if (session.lastMessages.length > 5) session.lastMessages.shift();
});

// Limpieza de sesiones inactivas
setInterval(() => {
  const now = Date.now();
  for (const [user, session] of userSessions.entries()) {
    if (now - session.lastInteraction > 86400000) {
      userSessions.delete(user);
    }
  }
}, 3600000);

client.initialize();
