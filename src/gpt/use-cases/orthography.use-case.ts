import { Options } from '@nestjs/common';
import OpenAI from 'openai';

interface Options {
  prompt: string;
}

export const orthographyCheckUseCase = async (
  openai: OpenAI,
  { prompt }: Options,
) => {

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `
        Tu nombre es Orthography-GPT,
        Te serán proveídos textos en español con posibles errores ortográficos y gramaricales.
        Las palabras usadas deben existir en el diccionario de la RAE.
        Debes de responder en formato JSON,
        tu tarea es corregirlos y retornar información soluciones,
        también debes de dar un porcentaje de acierto por el usuario,
        
        Si no hay errores, debes retornar un mensaje de felicitaciones.

        Ejemplo de sdalida: {
          userScore: number,
          errors: string[], // ['error -> solución'],
          message: string, // usa emojis y textos para felicitar al usuario
        }
        `,
      },{
        role: 'user',
        content: prompt, 
      },
    ],
    model: 'gpt-4o-mini',
  });

  const jsonResponse = JSON.parse(completion.choices[0].message.content);

  return jsonResponse;
};
