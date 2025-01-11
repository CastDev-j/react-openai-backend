import { Injectable } from '@nestjs/common';
import { orthographyCheckUseCase } from '@gpt/use-cases/orthography.use-case';
import { prosConsDicusserUseCase } from '@gpt/use-cases/prosConsDiscusser.usecase';
import { OrthographyDto } from './dtos/orthography.dto';
import OpenAI from 'openai';
import { ProConDiscusserDto } from './dtos/proscons.dto';
import { prosConsDicusserStreamUseCase } from './use-cases/prosConsDiscusserStream.usecase';
import { TranslatorUseCase } from './use-cases/translator.useCase';
import { TranslatorDto } from './dtos/translator.dto';

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
}
