'use client';
import { useState, useRef, useEffect } from 'react';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  messages: Message[];
  loading: boolean;
  onSend: (text: string) => void;
  marketContext: string | null;
}

export default function Chat({ messages, loading, onSend, marketContext }: Props) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
            <div className="text-5xl">₹</div>
            <p className="text-lg font-semibold text-white">What&apos;s your idea?</p>
            <p className="text-sm text-gray-400 max-w-xs">Tell me anything — rough thought, half-baked plan, or a problem you noticed. I&apos;ll help you turn it into income.</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`fade-in flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xs font-bold mr-2 mt-1 flex-shrink-0">₹</div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-orange-500/20 border border-orange-500/30 text-white rounded-tr-sm'
                : 'bg-white/5 border border-white/10 text-gray-100 rounded-tl-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="fade-in flex justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">₹</div>
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
              <div className="pulse-dot w-2 h-2 rounded-full bg-orange-400"></div>
              <div className="pulse-dot w-2 h-2 rounded-full bg-orange-400"></div>
              <div className="pulse-dot w-2 h-2 rounded-full bg-orange-400"></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Market context badge */}
      {marketContext && (
        <div className="mx-4 mb-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-400 truncate">
          📊 {marketContext}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2 items-end bg-white/5 border border-white/10 rounded-2xl px-4 py-2 focus-within:border-orange-500/50 transition-colors">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Describe your idea..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 resize-none outline-none max-h-32 py-1"
            style={{ height: 'auto' }}
            onInput={e => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 128) + 'px';
            }}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity flex-shrink-0"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
