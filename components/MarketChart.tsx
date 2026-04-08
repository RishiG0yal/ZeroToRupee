'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  trendsData: { interest: number; trend: string; relatedQueries: string[] } | null;
  researchData: { competitors: { name: string; source: string }[]; gaps: string[] } | null;
}

export default function MarketChart({ trendsData, researchData }: Props) {
  if (!trendsData && !researchData) return (
    <p className="text-xs text-gray-600 text-center py-8">Run Trends + Competitors first to see charts</p>
  );

  const interestData = trendsData ? [
    { name: 'Now', value: trendsData.interest },
    { name: 'Potential', value: Math.min(100, trendsData.interest + (trendsData.trend === 'rising' ? 20 : trendsData.trend === 'falling' ? -10 : 5)) },
  ] : [];

  const competitorData = researchData?.competitors?.map((c, i) => ({
    name: c.name.slice(0, 12),
    strength: Math.max(20, 90 - i * 15), // estimated relative strength
  })) || [];

  return (
    <div className="space-y-4">
      {trendsData && (
        <div className="bg-white/4 border border-white/8 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-white mb-3">📈 India Market Interest</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={interestData} barSize={40}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                formatter={(v: number) => [`${v}/100`, 'Interest']}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {interestData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#f97316' : '#22c55e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-3 mt-2">
            <span className="flex items-center gap-1 text-[10px] text-gray-400"><span className="w-2 h-2 rounded-sm bg-orange-500 inline-block" /> Current</span>
            <span className="flex items-center gap-1 text-[10px] text-gray-400"><span className="w-2 h-2 rounded-sm bg-green-500 inline-block" /> Projected</span>
          </div>
        </div>
      )}

      {competitorData.length > 0 && (
        <div className="bg-white/4 border border-white/8 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-white mb-3">🎯 Competitor Strength</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={competitorData} barSize={24} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={70} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                formatter={(v: number) => [`${v}/100`, 'Est. Strength']}
              />
              <Bar dataKey="strength" radius={[0, 4, 4, 0]}>
                {competitorData.map((_, i) => (
                  <Cell key={i} fill={`hsl(${220 + i * 30}, 70%, 60%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-gray-600 mt-1">Lower = easier to beat</p>
        </div>
      )}

      {researchData?.gaps && researchData.gaps.length > 0 && (
        <div className="bg-green-500/8 border border-green-500/15 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-green-400 mb-2">🎯 Your Opportunity Gaps</p>
          {researchData.gaps.map((g, i) => (
            <p key={i} className="text-[11px] text-gray-300 mb-1">• {g}</p>
          ))}
        </div>
      )}
    </div>
  );
}
