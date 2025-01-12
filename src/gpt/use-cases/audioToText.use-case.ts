import OpenAI from 'openai';
import * as fs from 'fs';

interface Options {
  prompt?: string;
  audio: Express.Multer.File;
}

export const audioToTextUseCase = async (
  openai: OpenAI,
  { audio, prompt }: Options,
) => {
  console.log({ audio });
  console.log({ prompt });

  const response = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: fs.createReadStream(audio.path),
    prompt,
    language: 'es',
    response_format: 'json',

  });


  
  return response;
};
