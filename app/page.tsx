"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/lib/supabase/client";

// ---- ロケール型 ----

type Locale = "ja" | "en";

// ---- 定数 ----

const ROUTER_BASE =
  process.env.NEXT_PUBLIC_ROUTER_BASE ??
  "https://zerocost-router.dragonrondo.workers.dev";

const TRACKER_BASE =
  process.env.NEXT_PUBLIC_TRACKER_BASE ??
  "https://zerocost-llm-tracker.dragonrondo.workers.dev";

// クイックスタートのコードスニペット（ロケール非依存）
const QUICKSTART_CODES = [
  "zc-xxxxxxxxxxxxxxxxxxxxxxxx",
  `curl -X POST https://zerocost-router.dragonrondo.workers.dev/v1/keys/providers \\
  -H "Authorization: Bearer zc-your-key" \\
  -H "Content-Type: application/json" \\
  -d '{"provider_id":"groq","api_key":"gsk_..."}'`,
  `from openai import OpenAI

client = OpenAI(
  base_url="https://zerocost-router.dragonrondo.workers.dev/v1",
  api_key="zc-your-key",
)

response = client.chat.completions.create(
  model="llama-3.3-70b-versatile",
  messages=[{"role": "user", "content": "Hello!"}],
)`,
];

// AIエージェント向けセットアッププロンプト（ロケール別）
const AGENT_PROMPT: Record<Locale, string> = {
  en: `Set up zerocost-router for me.

## What is zerocost-router?
A proxy API that provides an OpenAI-compatible endpoint backed by free-tier LLM providers (Groq, Cerebras, HuggingFace).
Endpoint base URL: https://zerocost-router.dragonrondo.workers.dev/v1

## Setup steps

### Step 1: Issue a zc-key
curl -s -X POST https://zerocost-router.dragonrondo.workers.dev/v1/keys
→ Save the "key" value from the response (e.g. zc-xxxxxxxx...)

### Step 2: Get a free Groq API key
Sign up at https://console.groq.com and generate an API key.

### Step 3: Register the provider key
curl -X POST https://zerocost-router.dragonrondo.workers.dev/v1/keys/providers \\
  -H "Authorization: Bearer <zc-key>" \\
  -H "Content-Type: application/json" \\
  -d '{"provider_id":"groq","api_key":"<groq-api-key>","priority":0}'

### Step 4: Verify it works
curl -X POST https://zerocost-router.dragonrondo.workers.dev/v1/chat/completions \\
  -H "Authorization: Bearer <zc-key>" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hello"}],"max_tokens":50}'

### Step 5: Use with OpenAI SDK
base_url = "https://zerocost-router.dragonrondo.workers.dev/v1"
api_key  = "<zc-key>"
Use these settings in place of the standard OpenAI client configuration.

Once done, let me know the zc-key you received.`,

  ja: `zerocost-routerをセットアップしてください。

## zerocost-routerとは？
Groq・Cerebras・HuggingFaceの無料枠を使ったOpenAI互換プロキシAPIです。
エンドポイントベースURL: https://zerocost-router.dragonrondo.workers.dev/v1

## セットアップ手順

### Step 1: zc-keyを発行する
curl -s -X POST https://zerocost-router.dragonrondo.workers.dev/v1/keys
→ レスポンスの "key" の値を保存してください（例: zc-xxxxxxxx...）

### Step 2: 無料のGroq APIキーを取得する
https://console.groq.com でサインアップしてAPIキーを生成してください。

### Step 3: プロバイダーキーを登録する
curl -X POST https://zerocost-router.dragonrondo.workers.dev/v1/keys/providers \\
  -H "Authorization: Bearer <zc-key>" \\
  -H "Content-Type: application/json" \\
  -d '{"provider_id":"groq","api_key":"<groq-api-key>","priority":0}'

### Step 4: 動作確認する
curl -X POST https://zerocost-router.dragonrondo.workers.dev/v1/chat/completions \\
  -H "Authorization: Bearer <zc-key>" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hello"}],"max_tokens":50}'

### Step 5: OpenAI SDKで使う
base_url = "https://zerocost-router.dragonrondo.workers.dev/v1"
api_key  = "<zc-key>"
標準のOpenAIクライアント設定の代わりにこれらを使ってください。

完了したら、取得したzc-keyを教えてください。`,
};

// ---- 型定義 ----

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface QuickstartStep {
  step: string;
  title: string;
  description: string;
}

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaStyle: string;
  badge: string | null;
  comingSoon: boolean;
  highlighted?: boolean;
}

interface FaqItem {
  q: string;
  a: string;
}

interface Messages {
  tagline: string;
  navCta: string;
  heroBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroSub: string;
  featuresTitle: string;
  featuresSub: string;
  features: Feature[];
  quickstartSteps: QuickstartStep[];
  getKeyTitle: string;
  getKeySub: string;
  keyReadyLabel: string;
  keyReadyWarning: string;
  copiedLabel: string;
  copyLabel: string;
  emailPlaceholder: string;
  submittingLabel: string;
  getKeyBtnLabel: string;
  goToDashboardLabel: string;
  noSpam: string;
  agentTitle: string;
  agentSub: string;
  agentPromptLabel: string;
  agentWorksWith: string;
  usageTitle: string;
  usageSub: string;
  usageMonthly: string;
  usageUnlimited: string;
  usageReqUsed: (n: number) => string;
  usageRemaining: (n: number) => string;
  resetDate: (isoStr: string) => string;
  checkAnotherKey: string;
  checkingLabel: string;
  checkBtnLabel: string;
  upgradeCtaLabel: string;
  throughputTitle: string;
  throughputSub: string;
  throughputSingleLabel: string;
  throughputSingleDesc: string;
  throughputZerocostLabel: string;
  throughputZerocostDesc: string;
  throughputNote: string;
  pricingTitle: string;
  pricingSub: string;
  pricingPopular: string;
  pricingTiers: PricingTier[];
  faqTitle: string;
  faqItems: FaqItem[];
  finalCtaTitle: string;
  finalCtaSub: string;
  finalCtaBtn: string;
  footerApiStatus: string;
  errorFallback: string;
  providersTitle: string;
  providersSub: string;
  providersLive: string;
  providersRpm: string;
  providersRpd: string;
  providersModels: (n: number) => string;
  providersLoading: string;
  providersError: string;
  providersBestLabel: string;
}

// ---- 翻訳テキスト ----

const MESSAGES: Record<Locale, Messages> = {
  en: {
    tagline: "— free LLM router",
    navCta: "Get started free",
    heroBadge: "OpenAI-compatible · Groq · Cerebras · HuggingFace",
    heroTitle1: "Route LLMs for free.",
    heroTitle2: "Zero cost, zero friction.",
    heroSub:
      "One API key. Auto-failover across the fastest free-tier LLM providers. Drop-in OpenAI replacement — change one line of code.",
    featuresTitle: "Built for developers who don't want to pay for LLM APIs",
    featuresSub:
      "Multiple free LLM providers. One endpoint. Automatic failover between them — so rate limits become someone else's problem.",
    features: [
      {
        icon: "⇄",
        title: "Auto-Failover",
        description:
          "When one provider hits a rate limit, zerocost silently switches to the next. Your requests keep flowing — no retries, no error handling needed.",
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
    ],
    quickstartSteps: [
      {
        step: "01",
        title: "Get your free key",
        description: "Enter your email below. Your zc-key arrives instantly.",
      },
      {
        step: "02",
        title: "Register your providers",
        description:
          "Send your Groq, Cerebras, or HuggingFace keys once.",
      },
      {
        step: "03",
        title: "Make your first API call",
        description: "Point your client at zerocost. Done.",
      },
    ],
    getKeyTitle: "Get your free API key",
    getKeySub:
      "Enter your email. Your zc-key is generated instantly — no credit card, no waitlist.",
    keyReadyLabel: "Your API key is ready",
    keyReadyWarning: "Save this key — it won't be shown again.",
    copiedLabel: "Copied!",
    copyLabel: "Copy",
    emailPlaceholder: "you@example.com",
    submittingLabel: "Generating…",
    getKeyBtnLabel: "Get free key",
    goToDashboardLabel: "Go to Dashboard →",
    noSpam: "No spam. Used only to identify your key.",
    agentTitle: "Use with AI agents",
    agentSub:
      "Copy the prompt below and paste it into your AI agent. It will set up zerocost automatically — no manual steps needed.",
    agentPromptLabel: "setup prompt",
    agentWorksWith:
      "Works with any OpenAI-compatible AI agent or coding assistant.",
    usageTitle: "Check your usage",
    usageSub:
      "Enter your zc-key to see how many requests you've used this month.",
    usageMonthly: "Monthly usage",
    usageUnlimited: "Unlimited",
    usageReqUsed: (n) => `${n.toLocaleString()} requests used`,
    usageRemaining: (n) => `${n.toLocaleString()} remaining`,
    resetDate: (isoStr) =>
      `Resets ${new Date(isoStr).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      })}`,
    checkAnotherKey: "Check another key",
    checkingLabel: "Checking…",
    checkBtnLabel: "Check",
    upgradeCtaLabel: "Upgrade your plan →",
    throughputTitle: "One key. Multiple providers. More headroom.",
    throughputSub:
      "Each provider has its own rate limit. zerocost distributes your requests across all of them — so you get the sum, not just one.",
    throughputSingleLabel: "Single provider",
    throughputSingleDesc: "Hits the rate limit on its own",
    throughputZerocostLabel: "zerocost (3 providers)",
    throughputZerocostDesc: "Distributes load — up to 3× capacity",
    throughputNote:
      "Actual limits vary by provider and model. Effective throughput depends on the number of providers you register.",
    pricingTitle: "Pricing",
    pricingSub: "Start free. Scale when you need more.",
    pricingPopular: "Popular",
    pricingTiers: [
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
        ctaStyle: "primary",
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
        cta: "Get Basic",
        ctaStyle: "secondary",
        badge: null,
        comingSoon: false,
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
        cta: "Get Pro",
        ctaStyle: "primary",
        badge: null,
        comingSoon: false,
        highlighted: true,
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
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
        a: "No. The Free tier is completely free, no card required. Basic and Pro plans are billed securely via Stripe.",
      },
    ],
    finalCtaTitle: "Start routing for free",
    finalCtaSub: "Get your API key in 10 seconds. No card, no waitlist.",
    finalCtaBtn: "Get your free key →",
    footerApiStatus: "API Status",
    errorFallback: "Something went wrong.",
    providersTitle: "Live provider status",
    providersSub:
      "Real-time quota data collected every hour from each provider's API.",
    providersLive: "live",
    providersRpm: "RPM",
    providersRpd: "RPD",
    providersModels: (n) => `${n} models`,
    providersLoading: "Fetching live data…",
    providersError: "Could not load provider status.",
    providersBestLabel: "Best right now",
  },

  ja: {
    tagline: "— 無料 LLM ルーター",
    navCta: "無料で始める",
    heroBadge: "OpenAI互換 · Groq · Cerebras · HuggingFace",
    heroTitle1: "LLMルーティングを無料で",
    heroTitle2: "コストゼロ、移行ゼロ",
    heroSub:
      "APIキー1本で、最速の無料LLMプロバイダーに自動フェイルオーバー。OpenAIの完全互換 — コード1行変えるだけ。",
    featuresTitle: "LLM APIにお金をかけたくない開発者のために",
    featuresSub:
      "複数の無料 LLM プロバイダーを1本のエンドポイントで束ねて、レートリミットを自動回避。プロバイダー管理は zerocost に任せられます。",
    features: [
      {
        icon: "⇄",
        title: "自動フェイルオーバー",
        description:
          "プロバイダーがレートリミットに達すると、zerocost は次のプロバイダーに自動で切り替えます。リトライもエラーハンドリングも不要。",
      },
      {
        icon: "◎",
        title: "OpenAI互換",
        description:
          "OpenAIクライアントのドロップイン置き換え。ベースURLを1行変えるだけで、すべてのモデル呼び出しが全プロバイダーで動作します。",
      },
      {
        icon: "⊞",
        title: "自前のキーを使用",
        description:
          "Groq・Cerebras・HuggingFaceのAPIキーを接続できます。資格情報はAES-256-GCMで暗号化され、ログに記録されることはありません。",
      },
      {
        icon: "⊡",
        title: "エッジネイティブな速度",
        description:
          "Cloudflare Workers上にデプロイ — 世界300以上の拠点から50ms未満のルーティングオーバーヘッド。コールドスタートなし、サーバーメンテナンス不要。",
      },
    ],
    quickstartSteps: [
      {
        step: "01",
        title: "無料キーを取得",
        description: "下でメールを入力。zc-keyが即時発行されます。",
      },
      {
        step: "02",
        title: "プロバイダーを登録",
        description:
          "GroqやCerebrasやHuggingFaceのキーを1回送信するだけ。",
      },
      {
        step: "03",
        title: "そのままAPIを呼び出す",
        description: "クライアントのエンドポイントをzerocostに向けるだけ。完了。",
      },
    ],
    getKeyTitle: "無料APIキーを取得",
    getKeySub:
      "メールアドレスを入力するだけ。zc-keyが即時発行されます — クレジットカード不要、ウェイティングリストなし。",
    keyReadyLabel: "APIキーの準備ができました",
    keyReadyWarning: "このキーを保存してください — 再表示されません。",
    copiedLabel: "コピー完了!",
    copyLabel: "コピー",
    emailPlaceholder: "you@example.com",
    submittingLabel: "発行中…",
    getKeyBtnLabel: "無料キーを取得",
    goToDashboardLabel: "ダッシュボードへ →",
    noSpam: "スパムなし。キーの識別にのみ使用します。",
    agentTitle: "AIエージェントで使う",
    agentSub:
      "下のプロンプトをコピーしてAIエージェントに貼り付けてください。zerocostを自動的にセットアップします — 手動作業不要。",
    agentPromptLabel: "setup prompt",
    agentWorksWith:
      "OpenAI互換の任意のAIエージェントやコーディングアシスタントで動作します。",
    usageTitle: "使用量を確認",
    usageSub:
      "zc-keyを入力して、今月の使用リクエスト数を確認できます。",
    usageMonthly: "月間使用量",
    usageUnlimited: "無制限",
    usageReqUsed: (n) => `${n.toLocaleString()} リクエスト使用済み`,
    usageRemaining: (n) => `残り ${n.toLocaleString()}`,
    resetDate: (isoStr) =>
      `${new Date(isoStr).toLocaleDateString("ja-JP", {
        month: "long",
        day: "numeric",
      })}にリセット`,
    checkAnotherKey: "別のキーを確認",
    checkingLabel: "確認中…",
    checkBtnLabel: "確認",
    upgradeCtaLabel: "プランをアップグレード →",
    throughputTitle: "1本のキーで、複数プロバイダーを束ねる。",
    throughputSub:
      "各プロバイダーにはそれぞれレートリミットがあります。zerocost はリクエストを自動で分散するので、1プロバイダーのリミットだけで詰まらなくなります。",
    throughputSingleLabel: "単一プロバイダー",
    throughputSingleDesc: "自力でレートリミットに到達",
    throughputZerocostLabel: "zerocost（3プロバイダー）",
    throughputZerocostDesc: "負荷を分散 — 最大3倍の処理容量",
    throughputNote:
      "実際の制限値はプロバイダー・モデルによって異なります。処理容量は登録したプロバイダー数によって変わります。",
    pricingTitle: "料金プラン",
    pricingSub: "無料から始めて、必要に応じてスケールアップ。",
    pricingPopular: "人気",
    pricingTiers: [
      {
        name: "Free",
        price: "¥0",
        period: "永久",
        description: "個人プロジェクトや試用に。",
        features: [
          "1,000 リクエスト / 月",
          "3プロバイダー (Groq, Cerebras, HF)",
          "自動フェイルオーバー",
          "OpenAI互換API",
        ],
        cta: "無料で始める",
        ctaStyle: "primary",
        badge: null,
        comingSoon: false,
      },
      {
        name: "Basic",
        price: "¥500",
        period: "/ 月",
        description: "アプリを開発する開発者向け。",
        features: [
          "5,000 リクエスト / 月",
          "5プロバイダー",
          "自動フェイルオーバー",
          "OpenAI互換API",
          "優先ルーティング",
        ],
        cta: "Basic を始める",
        ctaStyle: "secondary",
        badge: null,
        comingSoon: false,
      },
      {
        name: "Pro",
        price: "¥1,500",
        period: "/ 月",
        description: "チームや本番ワークロード向け。",
        features: [
          "無制限リクエスト",
          "全プロバイダー",
          "スマートルーティング（クォータ認識）",
          "OpenAI互換API",
          "SLA保証アップタイム",
          "使用量アナリティクス",
        ],
        cta: "Pro を始める",
        ctaStyle: "primary",
        badge: null,
        comingSoon: false,
        highlighted: true,
      },
    ],
    faqTitle: "よくある質問",
    faqItems: [
      {
        q: "利用可能なモデルは？",
        a: "登録したプロバイダーがサポートするモデルはすべて利用可能です — Groq経由のLlama 3.3 70B、Cerebras経由のLlama 3.1 70B、HuggingFaceの各種推論モデルを含みます。zerocostは渡すモデルIDを制限しません。",
      },
      {
        q: "APIキーは安全？",
        a: "はい。プロバイダーキーはAES-256-GCMで暗号化して保存されます。zerocostはリクエストボディやレスポンス内容をログに記録しません。登録後、キーは平文で取得できません。",
      },
      {
        q: "全プロバイダーがレートリミットに達したら？",
        a: "zerocostはサイレントに失敗するのではなく、明確なエラーを返します。レートリミットフラグは60秒以内に自動的にリセットされるため、後続のリクエストは正常にルーティングされます。",
      },
      {
        q: "クレジットカードは必要？",
        a: "不要です。Freeプランは完全無料でカード不要です。BasicとProプランのお支払いはStripeが安全に管理します。",
      },
    ],
    finalCtaTitle: "無料でルーティングを始める",
    finalCtaSub:
      "10秒でAPIキーを取得。クレジットカード不要、ウェイティングリストなし。",
    finalCtaBtn: "無料キーを取得 →",
    footerApiStatus: "API ステータス",
    errorFallback: "エラーが発生しました。",
    providersTitle: "ライブプロバイダーステータス",
    providersSub:
      "各プロバイダーAPIから毎時収集するリアルタイムのクォータデータです。",
    providersLive: "ライブ",
    providersRpm: "RPM",
    providersRpd: "RPD",
    providersModels: (n) => `${n} モデル`,
    providersLoading: "ライブデータを取得中…",
    providersError: "プロバイダーステータスを読み込めませんでした。",
    providersBestLabel: "現在のベスト",
  },
};

// ---- APIレスポンス型 ----

interface TrackerProviderModel {
  modelId: string;
  modelName: string | null;
  requestsPerMinute: number | null;
  requestsPerDay: number | null;
  tokensPerMinute: number | null;
  tokensPerDay: number | null;
  contextWindow: number | null;
}

interface TrackerProvider {
  slug: string;
  name: string;
  models: TrackerProviderModel[];
  lastUpdated: string | null;
}

interface TrackerBest {
  provider: string;
  modelId: string;
  modelName: string | null;
  requestsPerMinute: number | null;
  requestsPerDay: number | null;
  lastUpdated: string;
}

interface UsageData {
  plan: string;
  used: number;
  limit: number | null;
  remaining: number | null;
  reset_at: string;
}

// ---- コンポーネント ----

export default function HomePage() {
  const [locale, setLocale] = useState<Locale>("en");

  // 言語初期化: Cookie → navigator.language の優先順位
  useEffect(() => {
    const match = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("zerocost_locale="));
    const saved = match?.split("=")[1]?.trim();
    if (saved === "ja" || saved === "en") {
      setLocale(saved);
      return;
    }
    if (navigator.language.startsWith("ja")) setLocale("ja");
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // ログイン状態を確認（Navbar の Sign in / Dashboard 表示切り替え用）
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  const m = MESSAGES[locale];

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [agentPromptCopied, setAgentPromptCopied] = useState(false);
  const [usageKey, setUsageKey] = useState("");
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [usageFetching, setUsageFetching] = useState(false);
  const [usageError, setUsageError] = useState<string | null>(null);

  // tracker API から各プロバイダーのリアルタイムクォータデータを取得
  const [trackerProviders, setTrackerProviders] = useState<TrackerProvider[]>([]);
  const [trackerBest, setTrackerBest] = useState<TrackerBest | null>(null);
  const [trackerLoading, setTrackerLoading] = useState(true);
  const [trackerError, setTrackerError] = useState(false);

  useEffect(() => {
    const fetchTrackerData = async () => {
      try {
        const [listRes, bestRes] = await Promise.all([
          fetch(`${TRACKER_BASE}/v1/providers`),
          fetch(`${TRACKER_BASE}/v1/quota/best`),
        ]);
        if (!listRes.ok || !bestRes.ok) throw new Error("fetch failed");

        const listData: { providers: { slug: string; name: string }[] } =
          await listRes.json();
        const bestData: TrackerBest = await bestRes.json();

        // 各プロバイダーの詳細を並列取得
        const detailResults = await Promise.allSettled(
          listData.providers.map((p) =>
            fetch(`${TRACKER_BASE}/v1/providers/${p.slug}`).then((r) =>
              r.json()
            )
          )
        );

        const providers: TrackerProvider[] = detailResults
          .map((r) => (r.status === "fulfilled" ? (r.value as TrackerProvider) : null))
          .filter((p): p is TrackerProvider => p !== null);

        setTrackerProviders(providers);
        setTrackerBest(bestData);
      } catch {
        setTrackerError(true);
      } finally {
        setTrackerLoading(false);
      }
    };

    fetchTrackerData();
  }, []);

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
      if (!res.ok) throw new Error(data.error ?? m.errorFallback);
      setApiKey(data.key);
    } catch (err) {
      setError(err instanceof Error ? err.message : m.errorFallback);
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

  const handleCopyAgentPrompt = async () => {
    await navigator.clipboard.writeText(AGENT_PROMPT[locale]);
    setAgentPromptCopied(true);
    setTimeout(() => setAgentPromptCopied(false), 2000);
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
      if (!res.ok) throw new Error(data.error ?? m.errorFallback);
      // APIレスポンスの最低限の形状チェック（型キャスト前の実行時検証）
      if (typeof data.plan !== "string" || typeof data.used !== "number") {
        throw new Error("Unexpected response from server.");
      }
      setUsageData(data as UsageData);
    } catch (err) {
      setUsageError(err instanceof Error ? err.message : m.errorFallback);
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
              {m.tagline}
            </span>
          </div>
          <div className="flex items-center gap-6">
            {/* 言語切り替えボタン */}
            <div className="flex items-center gap-1 text-sm font-semibold">
              <button
                onClick={() => {
                  setLocale("ja");
                  document.cookie = "zerocost_locale=ja; path=/; max-age=31536000; samesite=lax";
                }}
                className={`px-1.5 transition-colors ${
                  locale === "ja"
                    ? "text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                JP
              </button>
              <span className="text-slate-200">|</span>
              <button
                onClick={() => {
                  setLocale("en");
                  document.cookie = "zerocost_locale=en; path=/; max-age=31536000; samesite=lax";
                }}
                className={`px-1.5 transition-colors ${
                  locale === "en"
                    ? "text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                EN
              </button>
            </div>
            <a
              href="https://github.com/Tenormusica2024"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors"
            >
              GitHub
            </a>
            {/* ログイン状態に応じて Sign in / Dashboard を表示 */}
            {isLoggedIn === null ? null : isLoggedIn ? (
              <a
                href="/dashboard"
                className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
              >
                Dashboard
              </a>
            ) : (
              <a
                href="/login"
                className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
              >
                Sign in
              </a>
            )}
            <a
              href="/login"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {m.navCta}
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
            {m.heroBadge}
          </span>
        </div>

        {/* 見出し */}
        <h1
          className="text-center text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6 text-slate-900"
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          {m.heroTitle1}
          <br />
          <span className="text-indigo-600">{m.heroTitle2}</span>
        </h1>
        <p className="text-center text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
          {m.heroSub}
        </p>

        {/* 3ステップクイックスタート */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {m.quickstartSteps.map((s, i) => (
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
                  {QUICKSTART_CODES[i]}
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
            {m.featuresTitle}
          </h2>
          <p className="text-center text-slate-500 mb-14 max-w-xl mx-auto">
            {m.featuresSub}
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {m.features.map((f) => (
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

      {/* ライブプロバイダーステータスセクション */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h2
              className="text-3xl sm:text-4xl font-bold text-slate-900"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              {m.providersTitle}
            </h2>
            <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {m.providersLive}
            </span>
          </div>
          <p className="text-slate-500 max-w-xl mx-auto">{m.providersSub}</p>
        </div>

        {trackerLoading ? (
          <p className="text-center text-slate-400 text-sm">{m.providersLoading}</p>
        ) : trackerError ? (
          <p className="text-center text-slate-400 text-sm">{m.providersError}</p>
        ) : (
          <div className="space-y-4">
            {/* ベストモデルハイライト */}
            {trackerBest && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex flex-wrap items-center gap-4">
                <span className="text-xs font-semibold bg-indigo-600 text-white px-2.5 py-1 rounded-full shrink-0">
                  {m.providersBestLabel}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-slate-900 text-sm">
                    {trackerBest.modelName ?? trackerBest.modelId}
                  </span>
                  <span className="text-slate-400 text-sm ml-2">
                    via {trackerBest.provider}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-600 font-mono">
                  {trackerBest.requestsPerMinute !== null && (
                    <span>
                      {trackerBest.requestsPerMinute.toLocaleString()} {m.providersRpm}
                    </span>
                  )}
                  {trackerBest.requestsPerDay !== null && (
                    <span>
                      {trackerBest.requestsPerDay.toLocaleString()} {m.providersRpd}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 各プロバイダーカード */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trackerProviders.map((provider) => {
                const isBest = trackerBest?.provider === provider.slug;
                // RPM 降順でベストモデルを選択
                const bestModel = [...provider.models].sort(
                  (a, b) => (b.requestsPerMinute ?? 0) - (a.requestsPerMinute ?? 0)
                )[0];
                return (
                  <div
                    key={provider.slug}
                    className={`bg-white rounded-2xl p-5 border transition-all duration-200 ${
                      isBest
                        ? "border-indigo-200 shadow-sm shadow-indigo-50"
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="font-semibold text-slate-900 text-sm"
                        style={{ fontFamily: "var(--font-bricolage)" }}
                      >
                        {provider.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {m.providersModels(provider.models.length)}
                        </span>
                        {provider.lastUpdated && (
                          <span className="w-2 h-2 rounded-full bg-green-400" title="online" />
                        )}
                      </div>
                    </div>
                    {bestModel && (
                      <div className="space-y-1.5">
                        <p className="text-xs text-slate-500 font-mono truncate">
                          {bestModel.modelName ?? bestModel.modelId}
                        </p>
                        <div className="flex items-center gap-3 text-xs font-mono">
                          {bestModel.requestsPerMinute !== null ? (
                            <span className="text-indigo-600 font-semibold">
                              {bestModel.requestsPerMinute.toLocaleString()} {m.providersRpm}
                            </span>
                          ) : (
                            <span className="text-slate-400">— {m.providersRpm}</span>
                          )}
                          {bestModel.requestsPerDay !== null && (
                            <span className="text-slate-400">
                              {bestModel.requestsPerDay.toLocaleString()} {m.providersRpd}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* メール登録セクション */}
      <section id="get-key" className="py-24 max-w-6xl mx-auto px-6">
        <div className="max-w-lg mx-auto text-center">
          <h2
            className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            {m.getKeyTitle}
          </h2>
          <p className="text-slate-500 mb-10">
            {m.getKeySub.split("zc-key").map((part, i, arr) =>
              i < arr.length - 1 ? (
                <span key={i}>
                  {part}
                  <code className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-sm">
                    zc-key
                  </code>
                </span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </p>

          {isLoggedIn ? (
            /* ログイン済み: ダッシュボードへ誘導 */
            <a
              href="/dashboard/api-keys"
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              {m.goToDashboardLabel}
            </a>
          ) : apiKey ? (
            /* キー発行済み表示 */
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-left">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-semibold text-slate-700">
                  {m.keyReadyLabel}
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
                  {copied ? m.copiedLabel : m.copyLabel}
                </button>
              </div>
              <p className="text-xs text-slate-400">{m.keyReadyWarning}</p>
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
                  placeholder={m.emailPlaceholder}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors whitespace-nowrap"
                >
                  {submitting ? m.submittingLabel : m.getKeyBtnLabel}
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              <p className="text-xs text-slate-400">{m.noSpam}</p>
            </form>
          )}
        </div>
      </section>

      {/* AIエージェント向けセクション */}
      <section id="agent" className="bg-slate-50 border-y border-slate-100 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2
              className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              {m.agentTitle}
            </h2>
            <p className="text-slate-500 mb-10">{m.agentSub}</p>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden text-left">
              {/* ヘッダーバー */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <span className="text-xs font-semibold text-slate-400 font-mono">
                  {m.agentPromptLabel}
                </span>
                <button
                  onClick={handleCopyAgentPrompt}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    agentPromptCopied
                      ? "bg-green-100 text-green-700"
                      : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                  }`}
                >
                  {agentPromptCopied ? m.copiedLabel : m.copyLabel}
                </button>
              </div>
              {/* プロンプト本文 */}
              <pre className="text-xs text-slate-600 font-mono p-5 leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-72 overflow-y-auto">
                {AGENT_PROMPT[locale]}
              </pre>
            </div>

            <p className="text-xs text-slate-400 mt-4">{m.agentWorksWith}</p>
          </div>
        </div>
      </section>

      {/* 使用量確認セクション */}
      <section id="usage" className="py-24 max-w-6xl mx-auto px-6">
        <div className="max-w-lg mx-auto text-center">
          <h2
            className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            {m.usageTitle}
          </h2>
          <p className="text-slate-500 mb-10">
            {m.usageSub.split("zc-key").map((part, i, arr) =>
              i < arr.length - 1 ? (
                <span key={i}>
                  {part}
                  <code className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-sm">
                    zc-key
                  </code>
                </span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </p>

          {usageData ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-left">
              {/* プランバッジ */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-semibold text-slate-700">
                  {m.usageMonthly}
                </span>
                <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                  {usageData.plan}
                </span>
              </div>

              {/* カウント表示 */}
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-slate-900">
                  {m.usageReqUsed(usageData.used)}
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
                    ? m.usageRemaining(usageData.remaining)
                    : m.usageUnlimited}
                </span>
                <span>{m.resetDate(usageData.reset_at)}</span>
              </div>

              {/* 80%超えでアップグレードCTA */}
              {usageData.limit && usageData.used / usageData.limit > 0.8 && (
                <a
                  href="#pricing"
                  className="block w-full text-center py-2.5 mb-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {m.upgradeCtaLabel}
                </a>
              )}

              <button
                onClick={() => {
                  setUsageData(null);
                  setUsageKey("");
                }}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                {m.checkAnotherKey}
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
                  {usageFetching ? m.checkingLabel : m.checkBtnLabel}
                </button>
              </div>
              {usageError && (
                <p className="text-red-500 text-sm text-center">{usageError}</p>
              )}
            </form>
          )}
        </div>
      </section>

      {/* スループット比較セクション */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            {m.throughputTitle}
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">{m.throughputSub}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* 単一プロバイダー */}
          <div className="bg-white rounded-2xl border border-slate-100 p-8">
            <p className="text-sm font-semibold text-slate-500 mb-6">
              {m.throughputSingleLabel}
            </p>
            <div className="space-y-3 mb-6">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Provider A</span>
                  <span>100%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-red-300 rounded-full" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-red-500 font-medium pt-1">
                <span>⚠</span>
                <span>{m.throughputSingleDesc}</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">1×</div>
          </div>

          {/* zerocost（3プロバイダー） */}
          <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-8">
            <p className="text-sm font-semibold text-indigo-600 mb-6">
              {m.throughputZerocostLabel}
            </p>
            <div className="space-y-3 mb-6">
              {(["Provider A", "Provider B", "Provider C"] as const).map(
                (label, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{label}</span>
                      <span>33%</span>
                    </div>
                    <div className="h-3 bg-indigo-100 rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-indigo-400 rounded-full" />
                    </div>
                  </div>
                )
              )}
              <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium pt-1">
                <span>✓</span>
                <span>{m.throughputZerocostDesc}</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-indigo-700">
              up to 3×
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 max-w-md mx-auto">
          {m.throughputNote}
        </p>
      </section>

      {/* プライシングセクション */}
      <section id="pricing" className="bg-slate-50 border-y border-slate-100 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-4"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            {m.pricingTitle}
          </h2>
          <p className="text-center text-slate-500 mb-14">{m.pricingSub}</p>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {m.pricingTiers.map((tier) => (
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
                    {m.pricingPopular}
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
                    {tier.cta}
                  </button>
                ) : (
                  <a
                    href={`/upgrade/${tier.name.toLowerCase()}`}
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
          {m.faqTitle}
        </h2>
        <div className="max-w-2xl mx-auto space-y-6">
          {m.faqItems.map(({ q, a }) => (
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
          {m.finalCtaTitle}
        </h2>
        <p className="text-slate-500 mb-10 max-w-md mx-auto">
          {m.finalCtaSub}
        </p>
        <a
          href="/login"
          className="inline-block px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-base"
        >
          {m.finalCtaBtn}
        </a>
      </section>

      {/* フッター */}
      <footer className="border-t border-slate-100 py-8 px-6 text-center text-slate-400 text-sm">
        <p>
          zerocost ·{" "}
          <a
            href="https://github.com/Tenormusica2024"
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
            {m.footerApiStatus}
          </a>
        </p>
      </footer>
    </main>
  );
}
