import Link from 'next/link';

const features = [
  { icon: '🔍', title: 'Competitor Autopsy', desc: 'See who built it, what they got wrong, and the exact gap you exploit.' },
  { icon: '📈', title: 'Live Trend Data', desc: 'Real Google Trends data for India. Know if your idea is rising or dying.' },
  { icon: '✅', title: 'Idea Validator', desc: 'Get a score out of 10 with strengths, risks, and a clear recommendation.' },
  { icon: '🗺️', title: 'Income Roadmap', desc: 'Week-by-week plan to your first ₹. Specific actions, not generic advice.' },
  { icon: '📣', title: 'Pitch Kit', desc: 'Cold DM, Instagram caption, elevator pitch — ready to copy and send.' },
  { icon: '💰', title: 'Revenue Calculator', desc: 'See your ₹ projections at Month 1, 3, and 6 based on your pricing.' },
  { icon: '🎨', title: 'Business Canvas', desc: 'Full lean canvas auto-generated for your idea with ₹ pricing built in.' },
  { icon: '📎', title: 'Upload Your Code', desc: 'Share what you\'ve built. Get monetization advice specific to your project.' },
];

const steps = [
  { step: '01', title: 'Share your idea', desc: 'Even a rough thought. "I want to sell notes" is enough to start.' },
  { step: '02', title: 'AI analyzes the market', desc: 'Competitors, trends, gaps — all pulled automatically in the background.' },
  { step: '03', title: 'Get your income plan', desc: 'Specific steps, ₹ numbers, platforms, and your first customer strategy.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/8 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-black text-sm">₹</div>
          <span className="font-bold text-sm">ZeroToRupee</span>
        </div>
        <Link href="/chat" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
          Start Free →
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-xs text-orange-300 mb-6">
          🇮🇳 Built for Indian students
        </div>
        <h1 className="text-5xl font-black mb-6 leading-tight">
          Turn your idea into
          <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent"> ₹ income</span>
        </h1>
        <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
          AI-powered income coach that gives you real market data, competitor gaps, and a week-by-week plan to your first rupee.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/chat" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3.5 rounded-xl font-bold text-base hover:opacity-90 transition-opacity">
            Start for free — no signup
          </Link>
          <Link href="/chat" className="bg-white/5 border border-white/10 text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-white/10 transition-colors">
            See how it works →
          </Link>
        </div>
        <p className="text-xs text-gray-600 mt-4">No credit card. No account. Just your idea.</p>
      </section>

      {/* Social proof strip */}
      <div className="border-y border-white/8 py-4 bg-white/2">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap justify-center gap-8 text-center">
          {[['₹0', 'to start'], ['2 min', 'to first plan'], ['8 tools', 'in one place'], ['India', 'focused']].map(([val, label]) => (
            <div key={label}>
              <div className="text-xl font-black text-orange-400">{val}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map(s => (
            <div key={s.step} className="bg-white/3 border border-white/8 rounded-2xl p-6">
              <div className="text-3xl font-black text-orange-500/30 mb-3">{s.step}</div>
              <h3 className="font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 py-8 pb-16">
        <h2 className="text-2xl font-bold text-center mb-10">Everything you need to go from idea to income</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(f => (
            <div key={f.title} className="bg-white/3 border border-white/8 rounded-xl p-4 hover:border-orange-500/30 transition-colors">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-sm text-white mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-20 text-center">
        <div className="bg-gradient-to-br from-orange-500/10 to-red-600/10 border border-orange-500/20 rounded-2xl p-10">
          <h2 className="text-3xl font-black mb-3">Your idea is worth something.</h2>
          <p className="text-gray-400 mb-6">Most students never start. You're already here.</p>
          <Link href="/chat" className="inline-block bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3.5 rounded-xl font-bold text-base hover:opacity-90 transition-opacity">
            Turn my idea into income →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 py-6 text-center text-xs text-gray-600">
        ZeroToRupee — Built for Indian students who want to make their first ₹
      </footer>
    </div>
  );
}
