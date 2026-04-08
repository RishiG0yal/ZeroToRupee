import { groq, SYSTEM_PROMPT } from '@/lib/groq';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { idea, trendsData, competitorData } = await req.json();

  const prompt = `Generate a detailed "Zero to ₹" roadmap for this idea: "${idea}"

Market Intelligence:
- Trends: ${trendsData?.summary || 'N/A'}
- Competitors: ${competitorData?.summary || 'N/A'}
- Gaps found: ${competitorData?.gaps?.join('; ') || 'N/A'}

Create a week-by-week action plan for the first 4 weeks to get their FIRST paying customer. Be extremely specific to India. Include exact platforms, pricing in ₹, and daily actions.

Format as:
WEEK 1: [Goal]
- Day 1-2: [specific action]
- Day 3-4: [specific action]  
- Day 5-7: [specific action]

(repeat for weeks 2-4)

END WITH: First ₹ Target: ₹[amount] by Day [X]`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.6,
    max_tokens: 1500,
  });

  return Response.json({ roadmap: completion.choices[0].message.content });
}
