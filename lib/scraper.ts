export async function scrapeMarketData(idea: string): Promise<{
  competitors: Competitor[];
  gaps: string[];
  summary: string;
}> {
  try {
    const query = encodeURIComponent(`${idea} India startup product site:producthunt.com OR site:reddit.com OR site:indiehackers.com`);
    const url = `https://html.duckduckgo.com/html/?q=${query}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const html = await response.text();
    const competitors = parseCompetitors(html, idea);
    const gaps = extractGaps(competitors);

    return {
      competitors,
      gaps,
      summary: buildSummary(competitors, gaps, idea),
    };
  } catch {
    return { competitors: [], gaps: [], summary: 'Market research unavailable.' };
  }
}

export interface Competitor {
  name: string;
  url: string;
  description: string;
  source: string;
}

function parseCompetitors(html: string, idea: string): Competitor[] {
  const results: Competitor[] = [];
  const linkRegex = /<a[^>]+class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
  const snippetRegex = /<a[^>]+class="result__snippet"[^>]*>([^<]+)<\/a>/g;

  const links: string[][] = [];
  const snippets: string[] = [];

  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    links.push([match[1], match[2]]);
  }
  while ((match = snippetRegex.exec(html)) !== null) {
    snippets.push(match[1]);
  }

  for (let i = 0; i < Math.min(links.length, 5); i++) {
    const [url, name] = links[i];
    const description = snippets[i] || '';
    const source = url.includes('producthunt') ? 'ProductHunt' :
                   url.includes('reddit') ? 'Reddit' :
                   url.includes('indiehackers') ? 'IndieHackers' : 'Web';

    if (name && url) {
      results.push({ name: name.trim(), url, description: description.trim(), source });
    }
  }

  return results;
}

function extractGaps(competitors: Competitor[]): string[] {
  const gapKeywords = ['missing', 'lacks', 'no', 'without', 'need', 'wish', 'problem', 'issue', 'bad', 'poor', 'expensive', 'complicated'];
  const gaps: string[] = [];

  competitors.forEach(c => {
    const desc = c.description.toLowerCase();
    gapKeywords.forEach(keyword => {
      if (desc.includes(keyword)) {
        gaps.push(`${c.name}: "${c.description}"`);
      }
    });
  });

  return [...new Set(gaps)].slice(0, 3);
}

function buildSummary(competitors: Competitor[], gaps: string[], idea: string): string {
  if (competitors.length === 0) return `No direct competitors found for "${idea}" — this could be a blue ocean opportunity or a niche not yet indexed.`;

  return `Found ${competitors.length} related products/discussions. Key sources: ${competitors.map(c => c.source).join(', ')}. ${gaps.length > 0 ? `Potential gaps identified in ${gaps.length} areas.` : 'No obvious gaps from snippets — deeper analysis needed.'}`;
}
