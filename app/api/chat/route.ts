import { groq, SYSTEM_PROMPT } from '@/lib/groq';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { messages, context } = await req.json();

  const systemWithContext = context
    ? `${SYSTEM_PROMPT}\n\n## REAL MARKET DATA — YOU MUST USE THIS IN YOUR RESPONSE\nThis is live data about the student's idea. Reference it directly. Don't ignore it.\n\n${context}`
    : SYSTEM_PROMPT;

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'system', content: systemWithContext }, ...messages],
    stream: true,
    temperature: 0.85,
    max_tokens: 2048,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
