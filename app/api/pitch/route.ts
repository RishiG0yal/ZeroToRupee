import { groq, SYSTEM_PROMPT } from '@/lib/groq';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { idea, conversationSummary } = await req.json();

  const context = conversationSummary
    ? `Full conversation:\n${conversationSummary}\n\nCore idea: ${idea}`
    : `Idea: ${idea}`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Generate marketing copy based on the FULL conversation. Use all specific details the student has shared (features, pricing, target audience, etc).

${context}

Respond in this exact JSON format:
{
  "coldDm": "A 3-sentence cold DM using specific details from the conversation",
  "landingHeadline": "Punchy headline using their specific product/service (max 10 words)",
  "landingSubheadline": "Supporting line with specific value prop (max 20 words)",
  "instagramCaption": "Instagram caption with relevant hashtags based on their specific idea",
  "elevatorPitch": "30-second pitch using their exact features and pricing"
}` }
    ],
    temperature: 0.7,
    max_tokens: 800,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  return Response.json(result);
}
