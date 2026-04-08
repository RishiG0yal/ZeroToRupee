import { getTrendsData } from '@/lib/trends';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { idea } = await req.json();
  if (!idea) return Response.json({ error: 'Idea required' }, { status: 400 });

  const data = await getTrendsData(idea);
  return Response.json(data);
}
