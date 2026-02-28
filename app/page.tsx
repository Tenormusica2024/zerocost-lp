"use client";

import { useState } from "react";

// ---- 定数定義 ----

const FEATURES = [
  {
    icon: "⇄",
    title: "Auto-Failover",
    description:
      "When Groq hits a rate limit, zerocost silently switches to Cerebras or HuggingFace. Your requests keep flowing — no retries, no error handling needed.",
  },
  {
    icon: "◎",
    title: "OpenAI Compatible",
    description:
      "Drop-in replacement for the OpenAI client. Change one line — the base URL — and every model call works across all providers.",
  },
  {
    icon: "⊞",
    title: "Bring Your Own Keys",
    description:
      "Connect your own Groq, Cerebras, and HuggingFace API keys. Your credentials are encrypted with AES-256-GCM and never logged.",
  },
  {
    icon: "⊡",
    title: "Edge-Native Speed",
    description:
      "Deployed on Cloudflare Workers — sub-50ms routing overhead from 300+ locations worldwide. No cold starts, no server maintenance.",
  },
];

const QUICKSTART_STEPS = [
  {
    step: "01",
    title: "Get your free key",
    description: "Enter your email below. Your zc-key arrives instantly.",
    code: "zc-xxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    step: "02",
    title: "Register your providers",
    description: "Send your Groq, Cerebras, or HuggingFace keys once.",
    code: `curl -X POST https://zerocost-router.dragonrondo.workers.dev/v1/keys/providers \\
  -H "Authorization: Bearer zc-your-key" \\
  -H "Content-Type: application/json" \\
  -d '{"provider_id":"groq","api_key":"gsk_..."}'`,
  },
  {
    step: "03",
    title: "Use as OpenAI API",
    description: "Point your client at zerocost. Done.",
    code: `from openai import OpenAI

client = OpenAI(
  base_url="https://zerocost-router.dragonrondo.workers.dev/v1",
  api_key="zc-your-key",
)

response = client.chat.completions.create(
  model="llama-3.3-70b-versatile",
  messages=[{"role": "user", "content": "Hello!"}],
)`,
  },
];

const PRICING_TIERS = [
  {
    name: "Free",
    price: "¥0",
    period: "forever",
    description: "For personal projects and exploration.",
    features: [
      "1,000 requests / month",
      "3 providers (Groq, Cerebras, HF)",
      "Auto-failover",
      "OpenAI-compatible API",
    ],
    cta: "Get started free",
    ctaStyle: "border",
    badge: null,
    comingSoon: false,
  },
  {
    name: "Basic",
    price: "¥500",
    period: "/ month",
    description: "For developers building apps.",
    features: [
      "5,000 requests / month",
      "5 providers",
      "Auto-failover",
      "OpenAI-compatible API",
      "Priority routing",
    ],
    cta: "Coming soon",
    ctaStyle: "disabled",
    badge: "Coming soon",
    comingSoon: true,
  },
  {
    name: "Pro",
    price: "¥1,500",
    period: "/ month",
    description: "For teams and production workloads.",
    features: [
      "Unlimited requests",
      "All providers",
      "Smart routing (quota-aware)",
      "OpenAI-compatible API",
      "SLA-backed uptime",
      "Usage analytics",
    ],
    cta: "Coming soon",
    ctaStyle: "disabled",
    badge: "Coming soon",
    comingSoon: true,
    highlighted: true,
  },
];

const FAQ_ITEMS = [
  {
    q: "Which models are available?",
    a: "Any model your registered providers support — including Llama 3.3 70B via Groq, Llama 3.1 70B via Cerebras, and a range of HuggingFace Inference models. zerocost doesn't restrict which model ID you pass.",
  },
  {
    q: "Are my API keys safe?",
    a: "Yes. Provider keys are encrypted with AES-256-GCM before storage. zerocost never logs request bodies or response content. Your keys cannot be retrieved in plaintext after registration.",
  },
  {
    q: "What happens when all providers hit rate limits?",
    a: "zerocost returns a clear error rather than silently failing. Rate limit flags reset automatically within 60 seconds, so subsequent requests will route normally.",
  },
  {
    q: "Do I need a credit card?",
    a: "No. The Free tier is completely free, no card required. Basic and Pro plans are in development — you'll be notified when they launch.",
  },
];

// ---- コンポーネント ----

const ROUTER_BASE = "https://zerocost-router.dragonrondo.workers.dev";

interface UsageData {
  plan: string;
  used: number;
  limit: number | null;
  remaining: number | null;
  reset_at: string;
}

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 使用量確認
  const [usageKey, setUsageKey] = useState("");
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [usageFetching, setUsageFetching] = useState(false);
  const [usageError, setUsageError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setApiKey(data.key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckUsage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usageKey.trim()) return;
    setUsageFetching(true);
    setUsageError(null);
    try {
      const res = await fetch(`${ROUTER_BASE}/v1/keys/usage`, {
        headers: { Authorization: `Bearer ${usageKey.trim()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      // APIレスポンスの最低限の形状チェック（型キャスト前の実行時検証）
      if (typeof data.plan !== "string" || typeof data.used !== "number") {
        throw new Error("Unexpected response from server.");
      }
      setUsageData(data as UsageData);
    } catch (err) {
      setUsageError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setUsageFetching(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* ナビゲーションバー */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="font-display text-xl font-700 tracking-tight text-slate-900"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              zerocost
            </span>
            <span className="hidden sm:inline text-slate-400 text-sm">
              — free LLM router
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/Tenormusica2024/zerocost-router"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors"
            >
              GitHub
            </a>
            <a
              href="#get-key"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Get started free
            </a>
          </div>
        </div>
      </nav>

      {/* ヒーローセクション */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        {/* バッジ */}
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            OpenAI-compatible · Groq · Cerebras · HuggingFace
          </span>
        </div>

        {/* 見出し */}
        <h1
          className="text-center text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6 text-slate-900"
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          Route LLMs for free.
          <br />
          <span className="text-indigo-600">Zero cost, zero limits.</span>
        </h1>
        <p className="text-center text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
          One API key. Auto-failover across the fastest free-tier LLM providers.
          Drop-in OpenAI replacement — change one line of code.
        </p>

        {/* 3ステップクイックスタート */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {QUICKSTART_STEPS.map((s) => (
            <div key={s.step} className="group">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 h-full hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-indigo-500 font-mono text-xs font-semibold bg-indigo-100 px-2 py-0.5 rounded">
                    {s.step}
                  </span>
                  <h3
                    className="font-semibold text-slate-900"
                    style={{ fontFamily: "var(--font-bricolage)" }}
                  >
                    {s.title}
                  </h3>
                </div>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                  {s.description}
                </p>
                <pre className="bg-slate-900 text-green-400 text-xs font-mono rounded-lg p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap break-all">
                  {s.code}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* フィーチャーセクション */}
      <section className="bg-slate-50 border-y border-slate-100 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-4"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            Built for developers who don&apos;t want to pay for inference
          </h2>
          <p className="text-center text-slate-500 mb-14 max-w-xl mx-auto">
            Free tiers from Groq, Cerebras, and HuggingFace add up to serious
            throughput — if you can route around the rate limits.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all duration-200"
              >
                <div
                  className="text-indigo-500 text-3xl mb-4 font-mono"
                  aria-hidden
                >
                  {f.icon}
                </div>
                <h3
                  className="text-slate-900 font-semibold text-lg mb-2"
                  style={{ fontFamily: "var(--font-bricolage)" }}
                >
                  {f.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* メール登録セクション */}
      <section id="get-key" className="py-24 max-w-6xl mx-auto px-6">
        <div className="max-w-lg mx-auto text-center">
          <h2
            className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            Get your free API key
          </h2>
          <p className="text-slate-500 mb-10">
            Enter your email. Your{" "}
            <code className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-sm">
              zc-key
            </code>{" "}
            is generated instantly — no credit card, no waitlist.
          </p>

          {apiKey ? (
            /* キー発行済み表示 */
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-left">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-semibold text-slate-700">
                  Your API key is ready
                </span>
              </div>
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 mb-4">
                <code className="flex-1 text-sm text-slate-800 font-mono truncate">
                  {apiKey}
                </code>
                <button
                  onClick={handleCopy}
                  className="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Save this key — it won&apos;t be shown again.
              </p>
            </div>
          ) : (
            /* 登録フォーム */
            <form onSubmit={handleRegister} className="flex flex-col gap-3">
              <div className="flex gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors whitespace-nowrap"
                >
                  {submitting ? "Generating…" : "Get free key"}
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              <p className="text-xs text-slate-400">
                No spam. Used only to identify your key.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* 使用量確認セクション */}
      <section id="usage" className="py-24 max-w-6xl mx-auto px-6">
        <div className="max-w-lg mx-auto text-center">
          <h2
            className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            Check your usage
          </h2>
          <p className="text-slate-500 mb-10">
            Enter your{" "}
            <code className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-sm">
              zc-key
            </code>{" "}
            to see how many requests you&apos;ve used this month.
          </p>

          {usageData ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-left">
              {/* プランバッジ */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-semibold text-slate-700">
                  Monthly usage
                </span>
                <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                  {usageData.plan}
                </span>
              </div>

              {/* カウント表示 */}
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-slate-900">
                  {usageData.used.toLocaleString()} requests used
                </span>
                <span className="text-slate-400">
                  / {usageData.limit?.toLocaleString() ?? "∞"}
                </span>
              </div>

              {/* プログレスバー（proプランは limit=null のため非表示） */}
              {usageData.limit !== null && (
                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-3 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-700 ${
                      usageData.used / usageData.limit > 0.8
                        ? "bg-red-500"
                        : usageData.used / usageData.limit > 0.5
                        ? "bg-amber-400"
                        : "bg-indigo-500"
                    }`}
                    style={{
                      width: `${Math.min(100, (usageData.used / usageData.limit) * 100)}%`,
                    }}
                  />
                </div>
              )}

              {/* 残量 & リセット日 */}
              <div className="flex justify-between text-xs text-slate-400 mb-5">
                <span>
                  {usageData.remaining !== null
                    ? `${usageData.remaining.toLocaleString()} remaining`
                    : "Unlimited"}
                </span>
                <span>
                  Resets{" "}
                  {new Date(usageData.reset_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              {/* 80%超えでアップグレードCTA */}
              {usageData.limit && usageData.used / usageData.limit > 0.8 && (
                <a
                  href="#pricing"
                  className="block w-full text-center py-2.5 mb-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Upgrade your plan →
                </a>
              )}

              <button
                onClick={() => {
                  setUsageData(null);
                  setUsageKey("");
                }}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Check another key
              </button>
            </div>
          ) : (
            <form onSubmit={handleCheckUsage} className="flex flex-col gap-3">
              <div className="flex gap-3">
                <input
                  type="password"
                  value={usageKey}
                  onChange={(e) => setUsageKey(e.target.value)}
                  placeholder="zc-xxxxxxxxxxxxxxxxxxxxxxxx"
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
                />
                <button
                  type="submit"
                  disabled={usageFetching || !usageKey.trim()}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors whitespace-nowrap"
                >
                  {usageFetching ? "Checking…" : "Check"}
                </button>
              </div>
              {usageError && (
                <p className="text-red-500 text-sm text-center">{usageError}</p>
              )}
            </form>
          )}
        </div>
      </section>

      {/* プライシングセクション */}
      <section id="pricing" className="bg-slate-50 border-y border-slate-100 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-4"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            Pricing
          </h2>
          <p className="text-center text-slate-500 mb-14">
            Start free. Scale when you need more.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`bg-white rounded-2xl p-8 border transition-all duration-200 relative flex flex-col ${
                  tier.highlighted
                    ? "border-indigo-300 shadow-lg shadow-indigo-50"
                    : "border-slate-100 hover:border-slate-200"
                }`}
              >
                {/* バッジ */}
                {tier.badge && (
                  <span className="absolute top-4 right-4 text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    {tier.badge}
                  </span>
                )}
                {tier.highlighted && !tier.badge && (
                  <span className="absolute top-4 right-4 text-xs font-semibold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}

                <div className="mb-6">
                  <p
                    className="text-sm font-semibold text-indigo-600 mb-1"
                    style={{ fontFamily: "var(--font-bricolage)" }}
                  >
                    {tier.name}
                  </p>
                  <p
                    className="text-4xl font-extrabold text-slate-900"
                    style={{ fontFamily: "var(--font-bricolage)" }}
                  >
                    {tier.price}
                    <span className="text-lg font-normal text-slate-400">
                      {tier.period}
                    </span>
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    {tier.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-slate-600"
                    >
                      <span className="text-indigo-500 mt-0.5 shrink-0">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {tier.comingSoon ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl text-sm font-semibold bg-slate-100 text-slate-400 cursor-not-allowed"
                  >
                    Coming soon
                  </button>
                ) : (
                  <a
                    href="#get-key"
                    className="block w-full text-center py-3 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                  >
                    {tier.cta}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQセクション */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <h2
          className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-14"
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          FAQ
        </h2>
        <div className="max-w-2xl mx-auto space-y-6">
          {FAQ_ITEMS.map(({ q, a }) => (
            <div key={q} className="border-b border-slate-100 pb-6">
              <p
                className="font-semibold text-slate-900 mb-2"
                style={{ fontFamily: "var(--font-bricolage)" }}
              >
                {q}
              </p>
              <p className="text-slate-500 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 最終CTA */}
      <section className="border-t border-slate-100 py-24 text-center px-6">
        <h2
          className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4"
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          Start routing for free
        </h2>
        <p className="text-slate-500 mb-10 max-w-md mx-auto">
          Get your API key in 10 seconds. No card, no waitlist.
        </p>
        <a
          href="#get-key"
          className="inline-block px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-base"
        >
          Get your free key →
        </a>
      </section>

      {/* フッター */}
      <footer className="border-t border-slate-100 py-8 px-6 text-center text-slate-400 text-sm">
        <p>
          zerocost ·{" "}
          <a
            href="https://github.com/Tenormusica2024/zerocost-router"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-600 transition-colors"
          >
            GitHub
          </a>{" "}
          ·{" "}
          <a
            href="https://zerocost-router.dragonrondo.workers.dev/health"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-600 transition-colors"
          >
            API Status
          </a>
        </p>
      </footer>
    </main>
  );
}
