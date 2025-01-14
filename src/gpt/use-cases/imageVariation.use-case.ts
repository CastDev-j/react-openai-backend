import { downloadImageAsPng } from '@/helpers/dowload-image-as-png';
import * as fs from 'fs';
import OpenAI from 'openai';
import * as path from 'path';

interface Options {
  baseImage: string;
}

export const imageVariationUseCase = async (
  openai: OpenAI,
  { baseImage }: Options,
) => {
  const pngImagePath = await downloadImageAsPng(baseImage, true);

  const response = await openai.images.createVariation({
    model: 'dall-e-2',
    image: fs.createReadStream(pngImagePath),
    n: 1,
    response_format: 'url',
  });

  const newImagePath = await downloadImageAsPng(response.data[0].url);
  const fileName = path.basename(newImagePath);
  const url = `${process.env.SERVER_URL}/gpt/image-generation/${fileName}`;


  return {
    url,
    localPath: response.data[0].url,
    revisedPrompt: response.data[0].revised_prompt,
  };
};
