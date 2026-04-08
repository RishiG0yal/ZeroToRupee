import { groq, SYSTEM_PROMPT } from '@/lib/groq';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { idea } = await req.json();

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Generate marketing copy for this Indian student's business idea: "${idea}"

Respond in this exact JSON format:
{
  "coldDm": "A 3-sentence cold DM to send on LinkedIn/Instagram to potential customers. Casual, not salesy.",
  "landingHeadline": "A punchy landing page headline (max 10 words)",
  "landingSubheadline": "Supporting line that explains the value (max 20 words)",
  "instagramCaption": "An Instagram caption with relevant hashtags to attract first customers",
  "elevatorPitch": "A 30-second verbal pitch for college events or networking"
}` }
    ],
    temperature: 0.7,
    max_tokens: 800,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  return Response.json(result);
}
