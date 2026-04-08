import { getTrendsData } from '@/lib/trends';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { idea, conversationSummary } = await req.json();
  // Extract most specific product/service from conversation
  const query = conversationSummary
    ? `${idea} ${conversationSummary.slice(-3000)}`
    : idea;
  if (!query) return Response.json({ error: 'Idea required' }, { status: 400 });
  const data = await getTrendsData(query);
  return Response.json(data);
}
