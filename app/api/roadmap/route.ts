import { groq, SYSTEM_PROMPT } from '@/lib/groq';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { idea, conversationSummary, trendsData, competitorData } = await req.json();

  const context = conversationSummary
    ? `Full conversation:\n${conversationSummary}\n\nCore idea: ${idea}`
    : `Idea: ${idea}`;

  const prompt = `Generate a detailed "Zero to ₹" roadmap using ALL details from the conversation. Be specific — use their exact features, pricing, and target customers.

${context}

Market Intelligence:
- Trends: ${trendsData?.summary || 'N/A'}
- Competitors: ${competitorData?.summary || 'N/A'}
- Gaps found: ${competitorData?.gaps?.join('; ') || 'N/A'}

Create a week-by-week action plan for the first 4 weeks to get their FIRST paying customer. Use their specific product/service details. Include exact platforms, pricing in ₹, and daily actions.

Format as:
WEEK 1: [Goal]
- Day 1-2: [specific action using their details]
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
