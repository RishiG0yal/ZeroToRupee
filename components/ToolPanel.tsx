'use client';
import { useState } from 'react';

interface Props {
  idea: string;
  onResearch: () => void;
  onTrends: () => void;
  onRoadmap: () => void;
  researchData: any;
  trendsData: any;
  roadmapData: string | null;
  loading: boolean;
}

export default function ToolPanel({ idea, onResearch, onTrends, onRoadmap, researchData, trendsData, roadmapData, loading }: Props) {
  const [activeTab, setActiveTab] = useState<'research' | 'trends' | 'roadmap' | null>(null);

  const tabs = [
    { id: 'research', label: '🔍 Competitors', action: onResearch },
    { id: 'trends', label: '📈 Trends', action: onTrends },
    { id: 'roadmap', label: '🗺️ Roadmap', action: onRoadmap },
  ] as const;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-sm font-semibold text-white mb-3">Market Intelligence</h2>
        <div className="flex flex-col gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); tab.action(); }}
              disabled={!idea || loading}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 ${
                activeTab === tab.id
                  ? 'bg-orange-500/20 border border-orange-500/40 text-orange-300'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {!idea && <p className="text-xs text-gray-600 mt-2">Chat first to unlock tools</p>}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
        {loading && activeTab && (
          <div className="text-center py-8 text-gray-500 text-sm">Analyzing...</div>
        )}

        {activeTab === 'research' && researchData && !loading && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400">{researchData.summary}</p>
            {researchData.competitors?.map((c: any, i: number) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium text-white truncate">{c.name}</span>
                  <span className="text-xs text-orange-400 ml-2 flex-shrink-0">{c.source}</span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">{c.description}</p>
              </div>
            ))}
            {researchData.gaps?.length > 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-400 mb-2">🎯 Gaps to exploit</p>
                {researchData.gaps.map((g: string, i: number) => (
                  <p key={i} className="text-xs text-gray-300 mb-1">• {g}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'trends' && trendsData && !loading && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400">{trendsData.summary}</p>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400">Interest in India</span>
                <span className={`text-xs font-bold ${trendsData.trend === 'rising' ? 'text-green-400' : trendsData.trend === 'falling' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {trendsData.trend === 'rising' ? '📈 Rising' : trendsData.trend === 'falling' ? '📉 Falling' : '➡️ Stable'}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{ width: `${trendsData.interest}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">{trendsData.interest}/100</p>
            </div>
            {trendsData.relatedQueries?.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-xs font-semibold text-white mb-2">Related searches</p>
                {trendsData.relatedQueries.map((q: string, i: number) => (
                  <span key={i} className="inline-block bg-white/10 text-xs text-gray-300 px-2 py-1 rounded-full mr-1 mb-1">{q}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'roadmap' && roadmapData && !loading && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">{roadmapData}</p>
          </div>
        )}

        {activeTab && !loading && !researchData && !trendsData && !roadmapData && (
          <p className="text-xs text-gray-600 text-center py-8">No data yet</p>
        )}
      </div>
    </div>
  );
}
