import { groq, SYSTEM_PROMPT } from '@/lib/groq';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { idea, trendsData, competitorData } = await req.json();

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Validate this student business idea for the Indian market: "${idea}"

Market context:
- Trends: ${trendsData?.summary || 'N/A'}
- Competitors: ${competitorData?.summary || 'N/A'}

Give a validation score out of 10 and respond in this exact JSON format:
{
  "score": 7,
  "verdict": "Worth pursuing",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "biggestRisk": "The single biggest risk in one sentence",
  "recommendation": "2-3 sentence specific recommendation for an Indian student"
}` }
    ],
    temperature: 0.5,
    max_tokens: 600,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  return Response.json(result);
}
