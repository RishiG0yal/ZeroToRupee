'use client';
import { useState } from 'react';

export default function RevenueCalculator() {
  const [price, setPrice] = useState(299);
  const [customers, setCustomers] = useState(10);
  const [growth, setGrowth] = useState(20);
  const [type, setType] = useState<'one-time' | 'monthly'>('monthly');

  const m1 = price * customers;
  const m3 = type === 'monthly'
    ? price * Math.round(customers * (1 + growth / 100) * (1 + growth / 100))
    : m1 * 3;
  const m6 = type === 'monthly'
    ? price * Math.round(customers * Math.pow(1 + growth / 100, 5))
    : m1 * 6;

  const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-[11px] text-gray-400 mb-1 block">Price per customer</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">₹</span>
            <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500/40" />
          </div>
        </div>
        <div>
          <label className="text-[11px] text-gray-400 mb-1 block">Customers (Month 1)</label>
          <input type="number" value={customers} onChange={e => setCustomers(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500/40" />
        </div>
        <div>
          <label className="text-[11px] text-gray-400 mb-1 block">Monthly growth %</label>
          <input type="number" value={growth} onChange={e => setGrowth(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500/40" />
        </div>
        <div className="flex gap-2">
          {(['one-time', 'monthly'] as const).map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${type === t ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
              {t === 'one-time' ? 'One-time' : 'Recurring'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {[
          { label: 'Month 1', value: m1, highlight: false },
          { label: 'Month 3', value: m3, highlight: false },
          { label: 'Month 6', value: m6, highlight: true },
        ].map(({ label, value, highlight }) => (
          <div key={label} className={`flex justify-between items-center px-3 py-2.5 rounded-lg border ${highlight ? 'bg-orange-500/10 border-orange-500/25' : 'bg-white/4 border-white/8'}`}>
            <span className="text-xs text-gray-400">{label}</span>
            <span className={`text-sm font-bold ${highlight ? 'text-orange-300' : 'text-white'}`}>{fmt(value)}</span>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-gray-600 text-center">Assumes {growth}% monthly customer growth</p>
    </div>
  );
}
