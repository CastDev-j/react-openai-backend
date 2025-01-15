import OpenAI from 'openai';

interface Options {
  threadId: string;
  assistantId?: string;
}

export const createRunUseCase = async (
  openai: OpenAI,
  { threadId, assistantId = "asst_JYZY5Loy2Ualg7PulmYSbxg6" }: Options,
) => {

    const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
    });

    return run;
};
