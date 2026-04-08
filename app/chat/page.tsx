'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import RevenueCalculator from '@/components/RevenueCalculator';
import MarketChart from '@/components/MarketChart';

interface Message { role: 'user' | 'assistant'; content: string; }
type Panel = 'research' | 'trends' | 'roadmap' | 'validate' | 'pitch' | 'canvas' | 'calculator' | 'chart' | null;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('ztr_messages') || '[]'); } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [idea, setIdea] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('ztr_idea') || '';
  });
  const [marketContext, setMarketContext] = useState('');
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [panelData, setPanelData] = useState<Record<string, any>>({});
  const [toolLoading, setToolLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; content: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => { if (messages.length) localStorage.setItem('ztr_messages', JSON.stringify(messages.slice(-50))); }, [messages]);
  useEffect(() => { if (idea) localStorage.setItem('ztr_idea', idea); }, [idea]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const isFirstIdea = text.length > 30 && !idea;
    if (isFirstIdea) {
      const newIdea = text.slice(0, 200);
      setIdea(newIdea);
      // Auto-run market analysis in background
      setTimeout(() => {
        fetch('/api/research', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idea: newIdea }) })
          .then(r => r.json()).then(data => {
            setPanelData(prev => ({ ...prev, research: data }));
            setMarketContext(prev => prev + '\nCompetitor data: ' + data.summary);
          });
        fetch('/api/trends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idea: newIdea }) })
          .then(r => r.json()).then(data => {
            setPanelData(prev => ({ ...prev, trends: data }));
            setMarketContext(prev => prev + '\nTrends data: ' + data.summary);
          });
      }, 500);
    }
    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const context = [
        marketContext,
        uploadedFiles.length > 0 ? `## Uploaded Files\n${uploadedFiles.map(f => `### ${f.name}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n')}` : ''
      ].filter(Boolean).join('\n\n');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, context }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantMsg += decoder.decode(value);
        setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'assistant', content: assistantMsg }; return u; });
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Connection error. Please try again.' }]);
    } finally { setLoading(false); }
  }, [messages, marketContext, idea, uploadedFiles]);

  const handleUpload = async (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('files', f));
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    setUploadedFiles(prev => [...prev, ...data.files]);

    // Build file content inline so it's available immediately (don't rely on state update)
    const fileContext = data.files.map((f: { name: string; content: string }) =>
      `### ${f.name}\n\`\`\`\n${f.content}\n\`\`\``
    ).join('\n\n');

    const userMsg = `I've uploaded the following file(s): ${data.files.map((f: { name: string }) => f.name).join(', ')}\n\nHere is the content:\n\n${fileContext}\n\nAnalyze this, tell me what it does, what's missing, and exactly how I can monetize it as an Indian student.`;
    sendMessage(userMsg);
  };

  const runTool = async (tool: NonNullable<Panel>) => {
    if (tool === 'calculator') { setActivePanel('calculator'); return; }
    if (tool === 'chart') { setActivePanel('chart'); return; }
    if (!idea && tool !== 'canvas') return;
    setActivePanel(tool);
    setToolLoading(true);
    try {
      const body = JSON.stringify({ idea, trendsData: panelData.trends, competitorData: panelData.research });
      const endpoints: Record<string, string> = {
        research: '/api/research', trends: '/api/trends', roadmap: '/api/roadmap',
        validate: '/api/validate', pitch: '/api/pitch', canvas: '/api/canvas',
      };
      const res = await fetch(endpoints[tool], { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      const data = await res.json();
      setPanelData(prev => ({ ...prev, [tool]: data }));
      if (tool === 'research') setMarketContext(prev => prev + '\n' + data.summary);
      if (tool === 'trends') setMarketContext(prev => prev + '\n' + data.summary);
    } finally { setToolLoading(false); }
  };

  const tools = [
    { id: 'research', icon: '🔍', label: 'Competitors' },
    { id: 'trends', icon: '📈', label: 'Trends' },
    { id: 'chart', icon: '📊', label: 'Market Chart' },
    { id: 'validate', icon: '✅', label: 'Validate Idea' },
    { id: 'roadmap', icon: '🗺️', label: 'Roadmap' },
    { id: 'pitch', icon: '📣', label: 'Pitch Kit' },
    { id: 'canvas', icon: '🎨', label: 'Business Canvas' },
    { id: 'calculator', icon: '💰', label: 'Revenue Calc' },
  ] as const;

  const starters = [
    "I want to sell notes to college students",
    "I can design logos and posters",
    "I want to build a fitness app",
    "I know how to code in Python",
  ];

  return (
    <div className="flex h-screen bg-[#0d0d14] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-52 flex-shrink-0 border-r border-white/8 flex flex-col bg-[#0a0a10]">
        <div className="p-4 border-b border-white/8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-black text-sm">₹</div>
              <div>
                <div className="text-sm font-bold">ZeroToRupee</div>
                <div className="text-[10px] text-gray-500">Idea → Income</div>
              </div>
            </div>
            <button
              onClick={() => {
                if (!confirm('Start a new chat? Current conversation will be cleared.')) return;
                setMessages([]); setIdea(''); setMarketContext(''); setPanelData({});
                setUploadedFiles([]); setActivePanel(null);
                localStorage.removeItem('ztr_messages'); localStorage.removeItem('ztr_idea');
              }}
              title="New Chat"
              className="text-gray-600 hover:text-white transition-colors text-sm"
            >✏️</button>
          </div>
        </div>

        <div className="p-3 flex flex-col gap-1 flex-1">
          <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2 px-1">Tools</p>
          {tools.map(t => (
            <button key={t.id} onClick={() => runTool(t.id)}
              disabled={!idea && t.id !== 'calculator' && t.id !== 'chart'}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-25 text-left ${
                activePanel === t.id ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-white/8">
          <input ref={fileInputRef} type="file" multiple accept=".txt,.md,.js,.ts,.py,.jsx,.tsx,.json,.csv" className="hidden"
            onChange={e => e.target.files && handleUpload(e.target.files)} />
          <button onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all border border-white/8 border-dashed">
            <span>📎</span> Upload code / files
          </button>
          {uploadedFiles.map((f, i) => (
            <div key={i} className="mt-1 flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 px-2 py-1 rounded truncate">
              ✓ {f.name}
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">Zero → ₹</div>
                  <p className="text-gray-400 text-sm">Tell me your idea. I'll tell you exactly how to make money from it.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                  {starters.map((s, i) => (
                    <button key={i} onClick={() => sendMessage(s)}
                      className="text-left text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-gray-300 transition-all hover:border-orange-500/30">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : messages.map((m, i) => (
              <div key={i} className={`fade-in flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">₹</div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-orange-500/15 border border-orange-500/25 text-white rounded-tr-sm'
                    : 'bg-white/5 border border-white/10 text-gray-100 rounded-tl-sm prose prose-invert prose-sm max-w-none'
                }`}>
                  {m.role === 'assistant' ? (
                    <>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="text-orange-300 font-semibold">{children}</strong>,
                          ul: ({ children }) => <ul className="my-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="my-2 space-y-1 list-decimal list-inside">{children}</ol>,
                          li: ({ node, ...props }) => {
                            const isOrdered = node?.parent?.type === 'element' && (node.parent as any).tagName === 'ol';
                            return isOrdered
                              ? <li className="text-gray-100 list-item" {...props} />
                              : <li className="flex gap-2" {...props}><span className="text-orange-400 flex-shrink-0">•</span><span>{(props as any).children}</span></li>;
                          },
                          code: ({ children }) => <code className="bg-white/10 px-1.5 py-0.5 rounded text-orange-200 text-xs font-mono">{children}</code>,
                          h1: ({ children }) => <h1 className="text-base font-bold text-white mb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-bold text-white mb-1">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-semibold text-orange-300 mb-1">{children}</h3>,
                          blockquote: ({ children }) => <blockquote className="border-l-2 border-orange-500 pl-3 text-gray-300 italic">{children}</blockquote>,
                        }}>
                        {m.content}
                      </ReactMarkdown>
                      <CopyButton text={m.content} />
                    </>
                  ) : m.content}
                </div>
                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">👤</div>
                )}
              </div>
            ))}
            {loading && (
              <div className="fade-in flex gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xs font-black flex-shrink-0">₹</div>
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                  <div className="pulse-dot w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <div className="pulse-dot w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <div className="pulse-dot w-1.5 h-1.5 rounded-full bg-orange-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-6 pb-4 pt-2 border-t border-white/8">
            {idea && !marketContext && (
              <div className="mb-2 px-3 py-1.5 bg-orange-500/8 border border-orange-500/15 rounded-lg text-[11px] text-orange-400 flex items-center gap-2">
                <div className="pulse-dot w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                Analyzing market in background...
              </div>
            )}
            {marketContext && (
              <div className="mb-2 px-3 py-1.5 bg-green-500/8 border border-green-500/15 rounded-lg text-[11px] text-green-400">
                📊 Market data loaded — responses are now data-backed
              </div>
            )}
            <div className="flex gap-2 items-end bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 focus-within:border-orange-500/40 transition-colors">
              <textarea ref={textareaRef} value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 120) + 'px'; }}
                placeholder="What's your idea? Even a rough thought works..."
                rows={1} className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 resize-none outline-none max-h-28" />
              <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-30 hover:opacity-90 transition-opacity flex-shrink-0">
                →
              </button>
            </div>
          </div>
        </div>

        {/* Tool Panel */}
        {activePanel && (
          <div className="w-80 flex-shrink-0 border-l border-white/8 flex flex-col bg-[#0a0a10] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <span className="text-xs font-semibold text-white">
                {tools.find(t => t.id === activePanel)?.icon} {tools.find(t => t.id === activePanel)?.label}
              </span>
              <button onClick={() => setActivePanel(null)} className="text-gray-600 hover:text-white text-xs">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
              {toolLoading ? (
                <div className="text-center py-12 text-gray-600 text-xs">Analyzing your idea...</div>
              ) : (
                <PanelContent panel={activePanel} data={panelData[activePanel]} allData={panelData} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PanelContent({ panel, data, allData }: { panel: NonNullable<Panel>; data: any; allData: Record<string, any> }) {
  const [copied, setCopied] = useState('');
  if (!data) return <p className="text-xs text-gray-600 text-center py-8">No data yet</p>;

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  if (panel === 'calculator') return <RevenueCalculator />;
  if (panel === 'chart') return <MarketChart trendsData={allData.trends} researchData={allData.research} />;
  if (panel === 'validate') return (
    <div className="space-y-3">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
        <div className={`text-4xl font-black mb-1 ${data.score >= 7 ? 'text-green-400' : data.score >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>{data.score}/10</div>
        <div className="text-sm font-semibold text-white">{data.verdict}</div>
      </div>
      <Section title="✅ Strengths" items={data.strengths} color="green" />
      <Section title="⚠️ Weaknesses" items={data.weaknesses} color="yellow" />
      <div className="bg-red-500/8 border border-red-500/15 rounded-lg p-3">
        <p className="text-[11px] font-semibold text-red-400 mb-1">🚨 Biggest Risk</p>
        <p className="text-[11px] text-gray-300">{data.biggestRisk}</p>
      </div>
      <div className="bg-orange-500/8 border border-orange-500/15 rounded-lg p-3">
        <p className="text-[11px] font-semibold text-orange-400 mb-1">💡 Recommendation</p>
        <p className="text-[11px] text-gray-300">{data.recommendation}</p>
      </div>
    </div>
  );

  if (panel === 'pitch') return (
    <div className="space-y-3">
      {[
        { key: 'landingHeadline', label: '🎯 Headline', value: data.landingHeadline },
        { key: 'landingSubheadline', label: '📝 Subheadline', value: data.landingSubheadline },
        { key: 'coldDm', label: '💬 Cold DM', value: data.coldDm },
        { key: 'instagramCaption', label: '📱 Instagram Caption', value: data.instagramCaption },
        { key: 'elevatorPitch', label: '🎤 Elevator Pitch', value: data.elevatorPitch },
      ].map(({ key, label, value }) => (
        <div key={key} className="bg-white/4 border border-white/8 rounded-lg p-3">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-[11px] font-semibold text-orange-300">{label}</p>
            <button onClick={() => copy(value, key)} className="text-[10px] text-gray-500 hover:text-white transition-colors">
              {copied === key ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-[11px] text-gray-300 leading-relaxed">{value}</p>
        </div>
      ))}
    </div>
  );

  if (panel === 'canvas') return (
    <div className="space-y-2">
      {[
        { key: 'problem', label: '❗ Problem', color: 'red' },
        { key: 'customerSegments', label: '👥 Customers', color: 'blue' },
        { key: 'uniqueValue', label: '⭐ Unique Value', color: 'yellow' },
        { key: 'solution', label: '💡 Solution', color: 'green' },
        { key: 'channels', label: '📢 Channels', color: 'purple' },
        { key: 'revenueStreams', label: '💰 Revenue', color: 'green' },
        { key: 'costStructure', label: '💸 Costs', color: 'orange' },
        { key: 'keyMetrics', label: '📊 Metrics', color: 'pink' },
        { key: 'unfairAdvantage', label: '🛡️ Unfair Advantage', color: 'purple' },
      ].map(({ key, label }) => (
        <div key={key} className="bg-white/4 border border-white/8 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-orange-300 mb-1">{label}</p>
          {Array.isArray(data[key])
            ? data[key].map((item: string, i: number) => <p key={i} className="text-[11px] text-gray-300">• {item}</p>)
            : <p className="text-[11px] text-gray-300">{data[key]}</p>}
        </div>
      ))}
    </div>
  );

  if (panel === 'research') return (
    <div className="space-y-3">
      <p className="text-[11px] text-gray-400">{data.summary}</p>
      {data.competitors?.map((c: any, i: number) => (
        <div key={i} className="bg-white/4 border border-white/8 rounded-lg p-3">
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-white truncate">{c.name}</span>
            <span className="text-[10px] text-orange-400 ml-1">{c.source}</span>
          </div>
          <p className="text-[11px] text-gray-500 line-clamp-2">{c.description}</p>
        </div>
      ))}
      {data.gaps?.length > 0 && <Section title="🎯 Gaps to exploit" items={data.gaps} color="green" />}
    </div>
  );

  if (panel === 'trends') return (
    <div className="space-y-3">
      <p className="text-[11px] text-gray-400">{data.summary}</p>
      <div className="bg-white/4 border border-white/8 rounded-lg p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] text-gray-400">India Interest</span>
          <span className={`text-xs font-bold ${data.trend === 'rising' ? 'text-green-400' : data.trend === 'falling' ? 'text-red-400' : 'text-yellow-400'}`}>
            {data.trend === 'rising' ? '📈 Rising' : data.trend === 'falling' ? '📉 Falling' : '➡️ Stable'}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 h-1.5 rounded-full" style={{ width: `${data.interest}%` }} />
        </div>
        <p className="text-[10px] text-gray-600 mt-1">{data.interest}/100</p>
      </div>
      {data.relatedQueries?.length > 0 && (
        <div className="bg-white/4 border border-white/8 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-white mb-2">Related searches</p>
          <div className="flex flex-wrap gap-1">
            {data.relatedQueries.map((q: string, i: number) => (
              <span key={i} className="bg-white/8 text-[10px] text-gray-300 px-2 py-0.5 rounded-full">{q}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (panel === 'roadmap') return (
    <div className="bg-white/4 border border-white/8 rounded-lg p-3">
      <ReactMarkdown remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="text-[11px] text-gray-300 mb-2">{children}</p>,
          strong: ({ children }) => <strong className="text-orange-300">{children}</strong>,
          li: ({ children }) => <li className="text-[11px] text-gray-300 mb-1">• {children}</li>,
          h1: ({ children }) => <h1 className="text-xs font-bold text-white mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xs font-bold text-orange-300 mb-1 mt-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-[11px] font-semibold text-white mb-1 mt-2">{children}</h3>,
        }}>
        {data.roadmap || data}
      </ReactMarkdown>
    </div>
  );

  return null;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="mt-2 text-[10px] text-gray-600 hover:text-gray-300 transition-colors flex items-center gap-1"
    >
      {copied ? '✓ Copied' : '⎘ Copy'}
    </button>
  );
}

function Section({ title, items, color }: { title: string; items: string[]; color: string }) {
  const colorMap: Record<string, string> = {
    green: 'text-green-400 bg-green-500/8 border-green-500/15',
    yellow: 'text-yellow-400 bg-yellow-500/8 border-yellow-500/15',
    red: 'text-red-400 bg-red-500/8 border-red-500/15',
  };
  return (
    <div className={`border rounded-lg p-3 ${colorMap[color] || colorMap.green}`}>
      <p className={`text-[11px] font-semibold mb-2 ${colorMap[color]?.split(' ')[0]}`}>{title}</p>
      {items?.map((item: string, i: number) => <p key={i} className="text-[11px] text-gray-300 mb-1">• {item}</p>)}
    </div>
  );
}
