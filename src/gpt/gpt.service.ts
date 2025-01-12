import { Injectable, NotFoundException } from '@nestjs/common';
import { orthographyCheckUseCase } from '@gpt/use-cases/orthography.use-case';
import { prosConsDicusserUseCase } from '@gpt/use-cases/prosConsDiscusser.usecase';
import { OrthographyDto } from './dtos/orthography.dto';
import OpenAI from 'openai';
import { ProConDiscusserDto } from './dtos/proscons.dto';
import { prosConsDicusserStreamUseCase } from './use-cases/prosConsDiscusserStream.usecase';
import { TranslatorUseCase } from './use-cases/translator.use-case';
import { TranslatorDto } from './dtos/translator.dto';
import { TextToAudioDto } from './dtos/text-to-audio.dto';
import { textToAudioUseCase } from './use-cases/textToAudio.use-case';
import * as path from 'path';
import * as fs from 'fs';
import { audioToTextUseCase } from './use-cases/audioToText.use-case';
import { AudioToTextDto } from './dtos/AudioToTextDto';

@Injectable()
export class GptService {
  // Solo va a llamar casos de uso

  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async orthographyCheck({ prompt, maxTokens }: OrthographyDto) {
    return await orthographyCheckUseCase(this.openai, { prompt });
  }

  async prosConsDicusser({ prompt }: ProConDiscusserDto) {
    return await prosConsDicusserUseCase(this.openai, { prompt });
  }

  async prosConsDicusserStream({ prompt }: ProConDiscusserDto) {
    return await prosConsDicusserStreamUseCase(this.openai, { prompt });
  }

  async translator({ prompt }: TranslatorDto) {
    return await TranslatorUseCase(this.openai, { prompt });
  }

  async textToAudio({ prompt, voice }: TextToAudioDto) {
    return await textToAudioUseCase(this.openai, { prompt, voice });
  }

  async textToAudioGetter(fileId: string) {
    const filePath = path.resolve(
      __dirname,
      `../../generated/audios/${fileId}.mp3`,
    );

    const wasFileFound = fs.existsSync(filePath);

    if (!wasFileFound) throw new NotFoundException(`File ${fileId} not found`);

    return filePath;
  }

  async audioToText(
    audioDile: Express.Multer.File,
    audioToTextDto?: AudioToTextDto,
  ) {
    const { prompt } = audioToTextDto;

    return await audioToTextUseCase(this.openai, { audio: audioDile, prompt });
  }
}
