interface Options {
  prompt: string;
}

import { Options } from '@nestjs/common';
import OpenAI from 'openai';

interface Options {
  prompt: string;
}

export const TranslatorUseCase = async (
  openai: OpenAI,
  { prompt }: Options,
) => {
  return await openai.chat.completions.create({
    stream: true,
    messages: [
      {
        role: 'system',
        content: `
        Tu nombre es Translator-GPT.
        Traduce el texto al idioma deseado.
        Tus respuestas deben ser de calidad y coherentes.
        Por defecto, traduce el texto de otros idiomas al español.
        Por defecto, sí el texto está en español y no especifica una traducción, tradúcelo al inglés.
        Si te piden traducir a otro idioma, asegúrate de hacerlo.
        Tu respuesta es en formato markdown.
        Al inicio de cada respuesta coloca el idioma al que se tradujo con este formato:
        **Idioma Original** -> **Idioma de Traducción**
        
        Texto Original ->
        Traduccion ->

        `,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: 'gpt-4o-mini',
  });
};
