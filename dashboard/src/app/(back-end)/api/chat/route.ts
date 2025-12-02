import myToolSet from '@/src/AI/tools/myTools';
import { google } from '@ai-sdk/google';
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google('gemini-2.5-pro'),
    system: 'vc es uma assistente virtual de secretario da usuarios deste sistema o teu nome e ipikk, responde as perguntas acima descritos',
    messages: convertToModelMessages(messages),
    tools: myToolSet,
    toolChoice: 'auto',
    // stopWhen: stepCountIs(5),
    onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
      console.log(toolCalls)
    },
  });

  return result.toUIMessageStreamResponse();
}