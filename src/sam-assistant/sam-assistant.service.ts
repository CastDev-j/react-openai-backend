import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { createThreadUseCase } from './use-cases/create-thread.use-case';
import { QuestionDto } from './dtos/question.dto';
import { createMessageUseCase } from './use-cases/create-message.use-case';
import { createRunUseCase } from './use-cases/create-run.use-case';
import { getMessageListUseCase } from './use-cases/get-message-list.use-case';
import { checkCompleteStatusUseCase } from './use-cases/check-complete-status.use-case';
import { MessageListDto } from './dtos/MessageListDto';

@Injectable()
export class SamAssistantService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async creatThread() {
    return await createThreadUseCase(this.openai);
  }

  async userQuestion(questionDto: QuestionDto) {
    const { question, threadId } = questionDto;
    const message = await createMessageUseCase(this.openai, {
      question,
      threadId,
    });

    const run = await createRunUseCase(this.openai, { threadId });

    await checkCompleteStatusUseCase(this.openai, { runId: run.id, threadId });

    const messages = await getMessageListUseCase(this.openai, { threadId });

    return { messages: messages.reverse() };
  }

  async getMessageList({ threadId }: MessageListDto) {
    const messages = await getMessageListUseCase(this.openai, { threadId });

    return { messages: messages.reverse() };
  }
}
