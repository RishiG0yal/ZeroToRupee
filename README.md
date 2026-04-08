# ZeroToRupee 🚀

**AI-powered income coach for Indian students — turn your idea into ₹ income.**

> Built for students who have an idea but don't know how to make money from it. ZeroToRupee gives real market data, competitor analysis, and a week-by-week action plan to your first rupee.

---

## What It Does

Most AI tools give generic advice. ZeroToRupee is different — every response is:
- Specific to **your exact idea**
- Grounded in **real market data** (Google Trends + competitor scraping)
- Focused on **India** — ₹ pricing, Indian platforms, Indian student constraints

### The 6-Stage Journey
```
Idea → Sharpen → Validate → Build → Monetize → First ₹
```
The AI knows which stage you're at and moves you forward every message.

---

## Features

| Tool | What it does |
|------|-------------|
| 💬 **AI Chat** | Conversational income coach powered by Groq Llama 70B. Streams responses in real-time. |
| 🔍 **Competitor Analysis** | Scrapes DuckDuckGo to find who's built similar things, what failed, and the gap you exploit. |
| 📈 **Trend Data** | Google Trends data for India — is your idea rising or dying? |
| 📊 **Market Chart** | Visual bar charts of India interest + competitor strength. |
| ✅ **Idea Validator** | Score out of 10 with strengths, weaknesses, biggest risk, and recommendation. |
| 🗺️ **Income Roadmap** | Week-by-week plan to your first paying customer. |
| 📣 **Pitch Kit** | Cold DM, landing page headline, Instagram caption, elevator pitch — all copyable. |
| 🎨 **Business Canvas** | Full lean canvas auto-generated with ₹ pricing. |
| 💰 **Revenue Calculator** | Input pricing + customers = ₹ projections at Month 1, 3, 6. |
| 📎 **File Upload** | Upload your code or docs — AI reads and gives monetization advice specific to what you built. |

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **AI**: Groq API — Llama 3.3 70B Versatile (fast, free tier available)
- **Market Data**: Google Trends API (unofficial), DuckDuckGo scraping
- **Charts**: Recharts
- **Markdown**: react-markdown + remark-gfm
- **Deploy**: Vercel

---

## Getting Started

### Prerequisites
- Node.js 18+
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/zerotorupee.git
cd zerotorupee
npm install
```

### Environment Setup

Create a `.env.local` file in the root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment (Vercel)

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add environment variable: `GROQ_API_KEY`
4. Deploy — done

---

## Project Structure

```
zerotorupee/
├── app/
│   ├── page.tsx              # Landing page
│   ├── chat/page.tsx         # Main app
│   ├── layout.tsx
│   └── api/
│       ├── chat/             # Groq streaming chat
│       ├── research/         # DuckDuckGo competitor scraper
│       ├── trends/           # Google Trends India
│       ├── roadmap/          # Week-by-week income plan
│       ├── validate/         # Idea scoring
│       ├── pitch/            # Marketing copy generator
│       ├── canvas/           # Lean business canvas
│       └── upload/           # File reader
├── components/
│   ├── MarketChart.tsx       # Recharts visualizations
│   └── RevenueCalculator.tsx # ₹ projection calculator
└── lib/
    ├── groq.ts               # Groq client + system prompt
    ├── scraper.ts            # DuckDuckGo scraper
    └── trends.ts             # Google Trends wrapper
```

---

## How The AI Works

The system prompt is engineered to:
- Never give generic advice
- Always reference real Indian platforms (Razorpay, Instamojo, Topmate, WhatsApp, Instagram)
- Give specific ₹ numbers, not vague pricing advice
- Include investment guidance (what to spend, what not to waste money on)
- Write actual code when asked, then explain how to monetize it
- End every response with one specific action the student can do today

When market data is loaded (auto-triggered on first message), it's injected into the AI context so every response references real competitor and trend data.

---

## License

MIT
