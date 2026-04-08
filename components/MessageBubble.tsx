'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';

interface Message { role: 'user' | 'assistant'; content: string; }

export default function MessageBubble({ m }: { m: Message }) {
  const [copied, setCopied] = useState(false);

  if (m.role === 'user') return (
    <div className="flex justify-end gap-3">
      <div className="max-w-[70%] bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/20 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-white">
        {m.content.length < 300 ? m.content : m.content.slice(0, 300) + '...'}
      </div>
    </div>
  );

  return (
    <div className="flex gap-3 group">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-black text-sm flex-shrink-0 mt-0.5 shadow-lg shadow-orange-500/20">₹</div>
      <div className="flex-1 min-w-0">
        <div className="bg-[#13131f] border border-white/8 rounded-2xl rounded-tl-sm px-5 py-4 text-sm text-gray-100 leading-relaxed shadow-xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
            p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
            strong: ({ children }) => <strong className="text-orange-300 font-semibold">{children}</strong>,
            ul: ({ children }) => <ul className="my-3 space-y-2">{children}</ul>,
            ol: ({ children }) => <ol className="my-3 space-y-2 list-decimal list-inside">{children}</ol>,
            li: ({ node, ...props }) => {
              const isOrdered = node?.parent?.type === 'element' && (node.parent as any).tagName === 'ol';
              return isOrdered
                ? <li className="text-gray-200" {...props} />
                : <li className="flex gap-2.5 items-start"><span className="text-orange-400 flex-shrink-0 mt-0.5">▸</span><span>{(props as any).children}</span></li>;
            },
            code: ({ children, className }) => {
              const isBlock = className?.includes('language-');
              return isBlock
                ? <code className="block bg-black/40 border border-white/8 rounded-lg px-4 py-3 text-orange-200 text-xs font-mono my-3 overflow-x-auto whitespace-pre">{children}</code>
                : <code className="bg-white/10 px-1.5 py-0.5 rounded text-orange-200 text-xs font-mono">{children}</code>;
            },
            pre: ({ children }) => <pre className="my-3">{children}</pre>,
            h1: ({ children }) => <h1 className="text-base font-bold text-white mb-3 mt-4 first:mt-0">{children}</h1>,
            h2: ({ children }) => <h2 className="text-sm font-bold text-white mb-2 mt-3 first:mt-0">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-semibold text-orange-300 mb-2 mt-3 first:mt-0">{children}</h3>,
            blockquote: ({ children }) => <blockquote className="border-l-2 border-orange-500 pl-4 text-gray-300 italic my-3">{children}</blockquote>,
            hr: () => <hr className="border-white/10 my-4" />,
          }}>
            {m.content}
          </ReactMarkdown>
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(m.content); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="mt-1.5 ml-1 text-[10px] text-gray-700 hover:text-gray-400 transition-colors opacity-0 group-hover:opacity-100"
        >
          {copied ? '✓ copied' : '⎘ copy'}
        </button>
      </div>
    </div>
  );
}
