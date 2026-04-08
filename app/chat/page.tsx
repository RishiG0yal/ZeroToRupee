'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import MessageBubble from '@/components/MessageBubble';
import RevenueCalculator from '@/components/RevenueCalculator';
import MarketChart from '@/components/MarketChart';

interface Message { role: 'user' | 'assistant'; content: string; }
type Panel = 'research' | 'trends' | 'roadmap' | 'validate' | 'pitch' | 'canvas' | 'calculator' | 'chart' | null;

const STAGES = ['Discover', 'Validate', 'Build', 'Monetize', 'First ₹'];

const STARTERS = [
  { icon: '💡', text: 'I have an idea but don\'t know how to make money from it' },
  { icon: '💻', text: 'I know how to code — what can I build to earn?' },
  { icon: '🎨', text: 'I can design — how do I get my first client?' },
  { icon: '📚', text: 'I want to sell my college notes or study material' },
];

const TOOLS = [
  { id: 'research', icon: '🔍', label: 'Competitors' },
  { id: 'trends', icon: '📈', label: 'Trends' },
  { id: 'chart', icon: '📊', label: 'Market Chart' },
  { id: 'validate', icon: '✅', label: 'Validate' },
  { id: 'roadmap', icon: '🗺️', label: 'Roadmap' },
  { id: 'pitch', icon: '📣', label: 'Pitch Kit' },
  { id: 'canvas', icon: '🎨', label: 'Canvas' },
  { id: 'calculator', icon: '💰', label: 'Revenue' },
] as const;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('ztr_messages') || '[]'); } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [idea, setIdea] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('ztr_idea') || '' : '');
  const [stage, setStage] = useState(0);
  const [marketContext, setMarketContext] = useState('');
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [panelData, setPanelData] = useState<Record<string, any>>({});
  const [toolLoading, setToolLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => { if (messages.length) localStorage.setItem('ztr_messages', JSON.stringify(messages.slice(-60))); }, [messages]);
  useEffect(() => { if (idea) localStorage.setItem('ztr_idea', idea); }, [idea]);

  useEffect(() => {
    const count = messages.filter(m => m.role === 'user').length;
    if (count >= 8) setStage(4);
    else if (count >= 6) setStage(3);
    else if (count >= 4) setStage(2);
    else if (count >= 2) setStage(1);
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const isFirstIdea = text.length > 30 && !idea;
    if (isFirstIdea) {
      const newIdea = text.slice(0, 200);
      setIdea(newIdea);
      setTimeout(() => {
        fetch('/api/research', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idea: newIdea }) })
          .then(r => r.json()).then(data => { setPanelData(prev => ({ ...prev, research: data })); setMarketContext(prev => prev + '\nCompetitor data: ' + data.summary); });
        fetch('/api/trends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idea: newIdea }) })
          .then(r => r.json()).then(data => { setPanelData(prev => ({ ...prev, trends: data })); setMarketContext(prev => prev + '\nTrends: ' + data.summary); });
      }, 500);
    }

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, context: marketContext }),
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let msg = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        msg += decoder.decode(value);
        setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'assistant', content: msg }; return u; });
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Connection error. Please try again.' }]);
    } finally { setLoading(false); }
  }, [messages, marketContext, idea]);

  const handleUpload = async (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('files', f));
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    setUploadedFiles(prev => [...prev, ...data.files]);
    const fileContext = data.files.map((f: { name: string; content: string }) => `### ${f.name}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n');
    sendMessage(`I've uploaded: ${data.files.map((f: { name: string }) => f.name).join(', ')}\n\n${fileContext}\n\nAnalyze this, tell me what it does, what's missing, and how I can monetize it.`);
  };

  const runTool = async (tool: NonNullable<Panel>) => {
    if (tool === 'calculator' || tool === 'chart') { setActivePanel(tool); return; }
    if (!idea && tool !== 'canvas') return;
    setActivePanel(tool);
    setToolLoading(true);
    try {
      // Extract full context from conversation, not just first idea
      const conversationSummary = messages
        .map(m => `${m.role === 'user' ? 'Student' : 'Coach'}: ${m.content}`)
        .join('\n');
      const body = JSON.stringify({ idea, conversationSummary, trendsData: panelData.trends, competitorData: panelData.research });
      const endpoints: Record<string, string> = { research: '/api/research', trends: '/api/trends', roadmap: '/api/roadmap', validate: '/api/validate', pitch: '/api/pitch', canvas: '/api/canvas' };
      const res = await fetch(endpoints[tool], { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      const data = await res.json();
      setPanelData(prev => ({ ...prev, [tool]: data }));
      if (tool === 'research') setMarketContext(prev => prev + '\n' + data.summary);
      if (tool === 'trends') setMarketContext(prev => prev + '\n' + data.summary);
    } finally { setToolLoading(false); }
  };

  const newChat = () => {
    if (!confirm('Start a new chat?')) return;
    setMessages([]); setIdea(''); setMarketContext(''); setPanelData({});
    setUploadedFiles([]); setActivePanel(null); setStage(0);
    localStorage.removeItem('ztr_messages'); localStorage.removeItem('ztr_idea');
  };

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col border-r border-white/6 bg-[#0d0d16]">
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-white/6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-black text-sm shadow-lg shadow-orange-500/30">₹</div>
            <div>
              <div className="text-sm font-bold tracking-tight">ZeroToRupee</div>
              <div className="text-[10px] text-gray-600">Idea → Income</div>
            </div>
          </div>
          <button onClick={newChat} title="New Chat" className="text-gray-700 hover:text-gray-300 transition-colors text-base">✏️</button>
        </div>

        {/* Stage tracker */}
        <div className="px-4 py-3 border-b border-white/6">
          <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Your Journey</p>
          <div className="space-y-1">
            {STAGES.map((s, i) => (
              <div key={s} className={`flex items-center gap-2 text-xs py-0.5 ${i === stage ? 'text-orange-400 font-semibold' : i < stage ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${i === stage ? 'bg-orange-400' : i < stage ? 'bg-gray-600' : 'bg-gray-800'}`} />
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div className="p-3 flex-1 overflow-y-auto">
          <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2 px-1">Tools</p>
          <div className="space-y-0.5">
            {TOOLS.map(t => (
              <button key={t.id} onClick={() => runTool(t.id)}
                disabled={!idea && t.id !== 'calculator' && t.id !== 'chart'}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all disabled:opacity-20 text-left ${activePanel === t.id ? 'bg-orange-500/15 text-orange-300 border border-orange-500/25' : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'}`}>
                <span className="text-sm">{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Upload */}
        <div className="p-3 border-t border-white/6">
          <input ref={fileInputRef} type="file" multiple accept=".txt,.md,.js,.ts,.py,.jsx,.tsx,.json,.csv" className="hidden" onChange={e => e.target.files && handleUpload(e.target.files)} />
          <button onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all border border-dashed border-white/8">
            <span>📎</span> Upload code / files
          </button>
          {uploadedFiles.map((f, i) => (
            <div key={i} className="mt-1 text-[10px] text-green-500 bg-green-500/8 px-2 py-1 rounded truncate">✓ {f.name}</div>
          ))}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        <ChatArea
          messages={messages} loading={loading} idea={idea} marketContext={marketContext}
          input={input} setInput={setInput} sendMessage={sendMessage}
          textareaRef={textareaRef} bottomRef={bottomRef}
        />
        {activePanel && (
          <ToolPanel panel={activePanel} data={panelData[activePanel]} allData={panelData}
            loading={toolLoading} onClose={() => setActivePanel(null)} />
        )}
      </div>
    </div>
  );
}

function ChatArea({ messages, loading, idea, marketContext, input, setInput, sendMessage, textareaRef, bottomRef }: any) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-6 space-y-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-8 max-w-lg mx-auto text-center">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-black text-2xl mx-auto mb-4 shadow-2xl shadow-orange-500/30">₹</div>
              <h2 className="text-2xl font-black text-white mb-2">What's your idea?</h2>
              <p className="text-gray-500 text-sm">Tell me anything — rough thought, skill you have, problem you noticed. I'll help you make money from it.</p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full">
              {STARTERS.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s.text)}
                  className="flex items-center gap-3 text-left bg-white/3 hover:bg-white/6 border border-white/8 hover:border-orange-500/25 rounded-xl px-4 py-3 text-sm text-gray-300 transition-all group">
                  <span className="text-lg flex-shrink-0">{s.icon}</span>
                  <span className="group-hover:text-white transition-colors">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m: Message, i: number) => <MessageBubble key={i} m={m} />)
        )}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-black text-sm flex-shrink-0 shadow-lg shadow-orange-500/20">₹</div>
            <div className="bg-[#13131f] border border-white/8 rounded-2xl rounded-tl-sm px-5 py-4 flex gap-1.5 items-center">
              <div className="pulse-dot w-1.5 h-1.5 rounded-full bg-orange-400" />
              <div className="pulse-dot w-1.5 h-1.5 rounded-full bg-orange-400" />
              <div className="pulse-dot w-1.5 h-1.5 rounded-full bg-orange-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-6 pb-5 pt-3 border-t border-white/6">
        {idea && !marketContext && (
          <div className="mb-2 flex items-center gap-2 text-[11px] text-orange-400/70">
            <div className="pulse-dot w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
            Analyzing global market...
          </div>
        )}
        {marketContext && (
          <div className="mb-2 text-[11px] text-green-500/70 flex items-center gap-1.5">
            <span>●</span> Market data loaded — responses are data-backed
          </div>
        )}
        <div className="relative bg-[#13131f] border border-white/10 rounded-2xl focus-within:border-orange-500/40 transition-colors shadow-xl">
          <textarea ref={textareaRef} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 140) + 'px'; }}
            placeholder="Describe your idea, ask anything, or share what you've built..."
            rows={1}
            className="w-full bg-transparent text-sm text-white placeholder-gray-600 resize-none outline-none px-5 pt-4 pb-12 max-h-36"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className="text-[10px] text-gray-700">Enter to send</span>
            <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white w-8 h-8 rounded-xl flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/20 font-bold text-sm">
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolPanel({ panel, data, allData, loading, onClose }: { panel: NonNullable<Panel>; data: any; allData: Record<string, any>; loading: boolean; onClose: () => void }) {
  const tool = TOOLS.find(t => t.id === panel);
  return (
    <div className="w-80 flex-shrink-0 border-l border-white/6 flex flex-col bg-[#0d0d16] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
        <span className="text-xs font-semibold text-white">{tool?.icon} {tool?.label}</span>
        <button onClick={onClose} className="text-gray-700 hover:text-white transition-colors text-xs w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/8">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-32 gap-3">
            <div className="flex gap-1.5">
              <div className="pulse-dot w-2 h-2 rounded-full bg-orange-400" />
              <div className="pulse-dot w-2 h-2 rounded-full bg-orange-400" />
              <div className="pulse-dot w-2 h-2 rounded-full bg-orange-400" />
            </div>
            <p className="text-xs text-gray-600">Analyzing...</p>
          </div>
        ) : <PanelContent panel={panel} data={data} allData={allData} />}
      </div>
    </div>
  );
}

function PanelContent({ panel, data, allData }: { panel: NonNullable<Panel>; data: any; allData: Record<string, any> }) {
  const [copied, setCopied] = useState('');
  const copy = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(''), 2000); };

  if (panel === 'calculator') return <RevenueCalculator />;
  if (panel === 'chart') return <MarketChart trendsData={allData.trends} researchData={allData.research} />;
  if (!data) return <p className="text-xs text-gray-700 text-center py-8">No data yet — run this tool first</p>;

  if (panel === 'validate') return (
    <div className="space-y-3">
      <div className="bg-gradient-to-br from-[#13131f] to-[#1a1a2e] border border-white/8 rounded-xl p-5 text-center">
        <div className={`text-5xl font-black mb-1 ${data.score >= 7 ? 'text-green-400' : data.score >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>{data.score}<span className="text-2xl text-gray-600">/10</span></div>
        <div className="text-sm font-semibold text-white">{data.verdict}</div>
      </div>
      <Card title="✅ Strengths" items={data.strengths} color="green" />
      <Card title="⚠️ Weaknesses" items={data.weaknesses} color="yellow" />
      <div className="bg-red-500/8 border border-red-500/15 rounded-xl p-3">
        <p className="text-[11px] font-semibold text-red-400 mb-1">🚨 Biggest Risk</p>
        <p className="text-[11px] text-gray-300 leading-relaxed">{data.biggestRisk}</p>
      </div>
      <div className="bg-orange-500/8 border border-orange-500/15 rounded-xl p-3">
        <p className="text-[11px] font-semibold text-orange-400 mb-1">💡 Recommendation</p>
        <p className="text-[11px] text-gray-300 leading-relaxed">{data.recommendation}</p>
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
        <div key={key} className="bg-white/3 border border-white/8 rounded-xl p-3">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-[11px] font-semibold text-orange-300">{label}</p>
            <button onClick={() => copy(value, key)} className="text-[10px] text-gray-600 hover:text-white transition-colors">{copied === key ? '✓' : 'Copy'}</button>
          </div>
          <p className="text-[11px] text-gray-300 leading-relaxed">{value}</p>
        </div>
      ))}
    </div>
  );

  if (panel === 'canvas') return (
    <div className="space-y-2">
      {[
        { key: 'problem', label: '❗ Problem' }, { key: 'customerSegments', label: '👥 Customers' },
        { key: 'uniqueValue', label: '⭐ Unique Value' }, { key: 'solution', label: '💡 Solution' },
        { key: 'channels', label: '📢 Channels' }, { key: 'revenueStreams', label: '💰 Revenue' },
        { key: 'costStructure', label: '💸 Costs' }, { key: 'keyMetrics', label: '📊 Metrics' },
        { key: 'unfairAdvantage', label: '🛡️ Unfair Advantage' },
      ].map(({ key, label }) => (
        <div key={key} className="bg-white/3 border border-white/8 rounded-xl p-3">
          <p className="text-[11px] font-semibold text-orange-300 mb-1.5">{label}</p>
          {Array.isArray(data[key]) ? data[key].map((item: string, i: number) => <p key={i} className="text-[11px] text-gray-300 mb-0.5">• {item}</p>) : <p className="text-[11px] text-gray-300">{data[key]}</p>}
        </div>
      ))}
    </div>
  );

  if (panel === 'research') return (
    <div className="space-y-3">
      <p className="text-[11px] text-gray-500 leading-relaxed">{data.summary}</p>
      {data.competitors?.map((c: any, i: number) => (
        <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-3">
          <div className="flex justify-between mb-1"><span className="text-xs font-medium text-white truncate">{c.name}</span><span className="text-[10px] text-orange-400 ml-1 flex-shrink-0">{c.source}</span></div>
          <p className="text-[11px] text-gray-500 line-clamp-2">{c.description}</p>
        </div>
      ))}
      {data.gaps?.length > 0 && <Card title="🎯 Gaps to exploit" items={data.gaps} color="green" />}
    </div>
  );

  if (panel === 'trends') return (
    <div className="space-y-3">
      <p className="text-[11px] text-gray-500">{data.summary}</p>
      <div className="bg-white/3 border border-white/8 rounded-xl p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] text-gray-400">Global Interest</span>
          <span className={`text-xs font-bold ${data.trend === 'rising' ? 'text-green-400' : data.trend === 'falling' ? 'text-red-400' : 'text-yellow-400'}`}>
            {data.trend === 'rising' ? '📈 Rising' : data.trend === 'falling' ? '📉 Falling' : '➡️ Stable'}
          </span>
        </div>
        <div className="w-full bg-white/8 rounded-full h-1.5"><div className="bg-gradient-to-r from-orange-500 to-red-500 h-1.5 rounded-full" style={{ width: `${data.interest}%` }} /></div>
        <p className="text-[10px] text-gray-700 mt-1">{data.interest}/100</p>
      </div>
      {data.relatedQueries?.length > 0 && (
        <div className="bg-white/3 border border-white/8 rounded-xl p-3">
          <p className="text-[11px] font-semibold text-white mb-2">Related searches</p>
          <div className="flex flex-wrap gap-1">{data.relatedQueries.map((q: string, i: number) => <span key={i} className="bg-white/6 text-[10px] text-gray-400 px-2 py-0.5 rounded-full">{q}</span>)}</div>
        </div>
      )}
    </div>
  );

  if (panel === 'roadmap') return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-3 text-[11px] text-gray-300 whitespace-pre-wrap leading-relaxed">{data.roadmap || data}</div>
  );

  return null;
}

function Card({ title, items, color }: { title: string; items: string[]; color: string }) {
  const colors: Record<string, string> = { green: 'text-green-400 bg-green-500/8 border-green-500/15', yellow: 'text-yellow-400 bg-yellow-500/8 border-yellow-500/15' };
  return (
    <div className={`border rounded-xl p-3 ${colors[color]}`}>
      <p className={`text-[11px] font-semibold mb-2 ${colors[color].split(' ')[0]}`}>{title}</p>
      {items?.map((item: string, i: number) => <p key={i} className="text-[11px] text-gray-300 mb-0.5">• {item}</p>)}
    </div>
  );
}
