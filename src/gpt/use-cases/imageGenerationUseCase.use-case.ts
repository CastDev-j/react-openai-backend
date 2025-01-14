import { downloadBase64ImageAsPng } from '@/helpers/dowload-base64-image-as-png';
import { downloadImageAsPng } from '@/helpers/dowload-image-as-png';
import * as fs from 'fs';
import OpenAI from 'openai';
import * as path from 'path';

interface Options {
  prompt: string;
  originalImage?: string;
  maskImage?: string;
}

export const imageGenerationUseCase = async (
  openai: OpenAI,
  { prompt, maskImage, originalImage }: Options,
) => {
  // TODO: verificar originalImage y maskImage

  if (!originalImage || !maskImage) {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      quality: 'standard',
      response_format: 'url',
    });

    const fileName = await downloadImageAsPng(response.data[0].url);
    const url = `${process.env.SERVER_URL}/gpt/image-generation/${fileName}`;

    return {
      url, //TODO: http://localhost:3000/api/image/ + url
      localPath: response.data[0].url,
      revisedPrompt: response.data[0].revised_prompt,
    };
  }

  const spngImagePath = await downloadImageAsPng(originalImage, true);
  const maskPath = await downloadBase64ImageAsPng(maskImage, true);

  const response = await openai.images.edit({
    model: 'dall-e-2',
    prompt,
    image: fs.createReadStream(spngImagePath),
    mask: fs.createReadStream(maskPath),
    n: 1,
    response_format: 'url',
  });

  const localImagePath = await downloadImageAsPng(response.data[0].url);
  const fileName = path.basename(localImagePath);

  const url = `${process.env.SERVER_URL}/gpt/image-generation/${fileName}`;

  return {
    url,
    localPath: response.data[0].url,
    revisedPrompt: response.data[0].revised_prompt,
  };
};
