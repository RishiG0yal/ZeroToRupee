// @ts-ignore
import googleTrends from 'google-trends-api';

export interface TrendsData {
  interest: number; // 0-100
  trend: 'rising' | 'falling' | 'stable';
  relatedQueries: string[];
  topCities: string[];
  summary: string;
}

export async function getTrendsData(idea: string): Promise<TrendsData> {
  try {
    const keyword = extractKeyword(idea);

    const [interestRes, relatedRes] = await Promise.allSettled([
      googleTrends.interestOverTime({
        keyword,
        geo: 'IN',
        startTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      }),
      googleTrends.relatedQueries({ keyword, geo: 'IN' }),
    ]);

    let interest = 50;
    let trend: 'rising' | 'falling' | 'stable' = 'stable';
    let relatedQueries: string[] = [];
    let topCities: string[] = [];

    if (interestRes.status === 'fulfilled') {
      const data = JSON.parse(interestRes.value);
      const timeline = data?.default?.timelineData || [];
      if (timeline.length > 0) {
        const values = timeline.map((t: { value: number[] }) => t.value[0]);
        interest = values[values.length - 1] || 50;
        const avg = values.slice(0, -10).reduce((a: number, b: number) => a + b, 0) / Math.max(values.slice(0, -10).length, 1);
        const recent = values.slice(-10).reduce((a: number, b: number) => a + b, 0) / 10;
        trend = recent > avg * 1.1 ? 'rising' : recent < avg * 0.9 ? 'falling' : 'stable';
      }
    }

    if (relatedRes.status === 'fulfilled') {
      const data = JSON.parse(relatedRes.value);
      const rising = data?.default?.rankedList?.[0]?.rankedKeyword || [];
      relatedQueries = rising.slice(0, 5).map((k: { query: string }) => k.query);
    }

    return {
      interest,
      trend,
      relatedQueries,
      topCities,
      summary: buildTrendSummary(keyword, interest, trend, relatedQueries),
    };
  } catch {
    return {
      interest: 50,
      trend: 'stable',
      relatedQueries: [],
      topCities: [],
      summary: 'Trend data unavailable — proceeding with market analysis.',
    };
  }
}

function extractKeyword(idea: string): string {
  const stopWords = ['i', 'want', 'to', 'build', 'create', 'make', 'a', 'an', 'the', 'for', 'that', 'which', 'helps', 'app', 'website'];
  const words = idea.toLowerCase().split(' ').filter(w => !stopWords.includes(w) && w.length > 2);
  return words.slice(0, 3).join(' ') || idea.slice(0, 30);
}

function buildTrendSummary(keyword: string, interest: number, trend: string, related: string[]): string {
  const trendEmoji = trend === 'rising' ? '📈' : trend === 'falling' ? '📉' : '➡️';
  const interestLabel = interest > 70 ? 'HIGH' : interest > 40 ? 'MODERATE' : 'LOW';
  return `${trendEmoji} "${keyword}" in India: ${interestLabel} interest (${interest}/100), trend is ${trend}. ${related.length > 0 ? `Related searches: ${related.slice(0, 3).join(', ')}` : ''}`;
}
