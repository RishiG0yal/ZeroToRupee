import { groq, SYSTEM_PROMPT } from '@/lib/groq';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { idea } = await req.json();

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Create a Lean Business Canvas for this Indian student's idea: "${idea}"

Respond in this exact JSON format:
{
  "problem": ["top problem 1", "top problem 2", "top problem 3"],
  "customerSegments": ["segment 1", "segment 2"],
  "uniqueValue": "One clear sentence on what makes this different",
  "solution": ["solution 1", "solution 2", "solution 3"],
  "channels": ["channel 1", "channel 2", "channel 3"],
  "revenueStreams": ["stream 1 with ₹ pricing", "stream 2 with ₹ pricing"],
  "costStructure": ["cost 1", "cost 2"],
  "keyMetrics": ["metric 1", "metric 2", "metric 3"],
  "unfairAdvantage": "What competitors cannot easily copy"
}` }
    ],
    temperature: 0.6,
    max_tokens: 800,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  return Response.json(result);
}
