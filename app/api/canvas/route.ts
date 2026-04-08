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
      { role: 'user', content: `Create a Lean Business Canvas using ALL details from the conversation. Be specific — use their exact features, pricing, and target customers they've mentioned.

${context}

Respond in this exact JSON format:
{
  "problem": ["specific problem 1", "specific problem 2", "specific problem 3"],
  "customerSegments": ["specific segment 1", "specific segment 2"],
  "uniqueValue": "One clear sentence using their specific differentiators",
  "solution": ["their specific feature 1", "their specific feature 2", "their specific feature 3"],
  "channels": ["specific channel 1", "specific channel 2", "specific channel 3"],
  "revenueStreams": ["stream 1 with ₹ pricing from conversation", "stream 2 with ₹ pricing"],
  "costStructure": ["cost 1", "cost 2"],
  "keyMetrics": ["metric 1", "metric 2", "metric 3"],
  "unfairAdvantage": "What competitors cannot easily copy based on their specific idea"
}` }
    ],
    temperature: 0.6,
    max_tokens: 800,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  return Response.json(result);
}
