interface Options {
  prompt: string;
}

import { Options } from '@nestjs/common';
import OpenAI from 'openai';

interface Options {
  prompt: string;
}

export const prosConsDicusserStreamUseCase = async (
  openai: OpenAI,
  { prompt }: Options,
) => {
  return await openai.chat.completions.create({
    stream: true,
    messages: [
      {
        role: 'system',
        content: `
        Tu nombre es ProsCons-GPT.
        Responde a las preguntas con pros y contras en formato markdown.
        Presenta los pros y contras en listas claras, cortas y concisas.
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
