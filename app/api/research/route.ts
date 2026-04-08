import { scrapeMarketData } from '@/lib/scraper';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { idea, conversationSummary } = await req.json();
  const query = conversationSummary
    ? `${idea} ${conversationSummary.slice(-5000)}`
    : idea;
  if (!query) return Response.json({ error: 'Idea required' }, { status: 400 });
  const data = await scrapeMarketData(query);
  return Response.json(data);
}
