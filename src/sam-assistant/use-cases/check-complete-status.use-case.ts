import { InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';

interface Options {
  threadId: string;
  runId: string;
}

export const checkCompleteStatusUseCase = async (
  openai: OpenAI,
  { threadId, runId }: Options,
) => {
  const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);

  console.log({ status: runStatus.status });

  if (runStatus.status === 'completed') {
    return runStatus;
  }else if (runStatus.status === 'failed') {
    throw new InternalServerErrorException('Run failed');
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return await checkCompleteStatusUseCase(openai, { threadId, runId });
};
