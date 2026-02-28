import { headers, cookies } from "next/headers";

export type Locale = "ja" | "en";

/** Cookie のキー名（LP と dashboard で共有） */
export const LOCALE_COOKIE = "zerocost_locale";

/**
 * サーバーコンポーネント用: ロケール判定
 * 優先順位: Cookie > Accept-Language ヘッダー > "en"
 */
export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const saved = cookieStore.get(LOCALE_COOKIE)?.value;
  if (saved === "ja" || saved === "en") return saved;

  const h = await headers();
  const acceptLang = h.get("accept-language") ?? "";
  return acceptLang.toLowerCase().startsWith("ja") ? "ja" : "en";
}

// ---- 翻訳テーブル ----

export const DASHBOARD_MESSAGES = {
  ja: {
    nav: {
      overview: "概要",
      apiKeys: "APIキー",
      usage: "使用量",
      providers: "プロバイダー",
    },
    sidebar: {
      planFree: "Free プラン",
      planBasic: "Basic プラン",
      planPro: "Pro プラン",
      signOut: "ログアウト",
    },
    overview: {
      title: "概要",
      welcome: (email: string) => `おかえりなさい、${email}`,
      currentPlan: "現在のプラン",
      active: "有効",
      inactive: "無効",
      requestsThisMonth: "今月のリクエスト数",
      resetsOn: "リセット日",
      yourApiKey: "APIキー",
      manage: "管理",
      noApiKey: "APIキーが見つかりません。",
      quickStart: "クイックスタート",
      // step テキストはリンク埋め込みのため、各パーツを個別提供
      step1Pre: "",
      step1Link: "プロバイダー",
      step1Post: "でGroq、Cerebras、HuggingFaceのAPIキーを登録",
      step2Pre: "",
      step2Link: "APIキー",
      step2Post: "からzerocostのAPIキーをコピー",
      step3Pre: "",
      step3Post: "をOpenAIクライアントに設定",
    },
    apiKeys: {
      title: "APIキー",
      subtitle: "zerocost APIを呼び出す際のBearerトークンとして使用してください",
      secretKey: "シークレットAPIキー",
      secretKeyDesc: "このキーは秘密にしてください。共有したりバージョン管理にコミットしないでください。",
      active: "有効",
      hideKey: "非表示",
      showKey: "表示",
      copyToClipboard: "コピー",
      noApiKey: "APIキーが見つかりません。サポートにお問い合わせください。",
      howToUse: "使い方",
      regenerateKey: "キーの再発行",
      regenerateDesc: "現在のキーを無効にして新しいキーを発行します",
      comingSoon: "近日公開",
      regenerate: "再発行",
    },
    usage: {
      title: "使用量",
      subtitle: "アカウントの月間APIリクエスト使用量",
      requestsThisMonth: "今月のリクエスト数",
      usedPct: (pct: number) => `${pct}% 使用`,
      remaining: "残り",
      today: "今日",
      resetsOn: "リセット日",
      yourPlan: "プラン",
      requestsPerMonth: (n: string) => `${n}リクエスト / 月`,
      upgradeSoon: "アップグレードは近日公開",
      noUsageData:
        "使用量データが利用できません。最初のAPI呼び出しを行うと統計が表示されます。",
    },
    providers: {
      title: "プロバイダー設定",
      subtitle:
        "各プロバイダーの無料APIキーを登録すると、zerocostが自動でリクエストを振り分けます。登録するほど使える量が増えます。",
      registered: "登録済み",
      getKey: "キーを取得 →",
      deleteKey: "削除",
      pasteHere: (placeholder: string) => `ここに貼り付け（${placeholder}）`,
      register: "登録",
      cliTitle: "エンジニア向け: CLIでまとめて設定する",
      cliDesc: "ターミナルから対話形式でプロバイダーキーを一括設定できます:",
      cliNote: "※ CLIは現在開発中です。近日公開予定。",
    },
    providerData: {
      groq: {
        description: "無料枠: 毎分1,000リクエスト / 10,000トークン",
        steps: [
          "上のボタンでGroqコンソールを開く（新しいタブ）",
          "「Create API Key」でキーを発行",
          "コピーして下のフォームに貼り付け",
        ],
      },
      cerebras: {
        description: "無料枠あり（レート制限は非公開）",
        steps: [
          "上のボタンでCerebrasクラウドを開く（新しいタブ）",
          "API Keysメニューからキーを発行",
          "コピーして下のフォームに貼り付け",
        ],
      },
      huggingface: {
        description: "無料枠: Serverless Inference API",
        steps: [
          "上のボタンでHuggingFaceを開く（新しいタブ）",
          "「New token」でトークンを発行（Read権限でOK）",
          "コピーして下のフォームに貼り付け",
        ],
      },
    },
    upgrade: {
      emailTitle: "メールアドレスを入力",
      emailSubtitle: "Stripe の安全な決済ページへリダイレクトします。クレジットカード情報はこのサイトには入力しません。",
      submit: (name: string) => `${name} プランで続ける →`,
      submitting: "移動中…",
      cancelNote: "30日以内はいつでもキャンセル可能。クレジットカードは Stripe が安全に管理します。",
      backToPlans: "← プラン一覧に戻る",
      errorFallback: "チェックアウトの作成に失敗しました。",
      errorOccurred: "エラーが発生しました。",
      alreadySubscribed: "このメールアドレスはすでに同じプランに加入済みです。ダッシュボードからプランをご確認ください。",
      plans: {
        basic: {
          price: "¥500 / 月",
          features: ["5,000 リクエスト / 月", "5 プロバイダー", "自動フェイルオーバー", "OpenAI 互換 API", "優先ルーティング"],
        },
        pro: {
          price: "¥1,500 / 月",
          features: ["無制限リクエスト", "全プロバイダー", "スマートルーティング（クォータ認識）", "OpenAI 互換 API", "SLA 保証アップタイム", "使用量アナリティクス"],
        },
      },
    },
    success: {
      title: "お支払いが完了しました",
      body: "プランのアップグレードが完了しました。ダッシュボードから zc-key とプラン情報をご確認ください。",
      toDashboard: "ダッシュボードへ →",
      toHome: "トップページへ戻る",
      portalNote: "キャンセル・変更は Stripe カスタマーポータルからいつでも可能です。",
    },
  },

  en: {
    nav: {
      overview: "Overview",
      apiKeys: "API Keys",
      usage: "Usage",
      providers: "Providers",
    },
    sidebar: {
      planFree: "Free plan",
      planBasic: "Basic plan",
      planPro: "Pro plan",
      signOut: "Sign out",
    },
    overview: {
      title: "Overview",
      welcome: (email: string) => `Welcome back, ${email}`,
      currentPlan: "Current plan",
      active: "Active",
      inactive: "Inactive",
      requestsThisMonth: "Requests this month",
      resetsOn: "Resets on",
      yourApiKey: "Your API key",
      manage: "Manage",
      noApiKey: "No API key found.",
      quickStart: "Quick start",
      step1Pre: "Go to ",
      step1Link: "Providers",
      step1Post: " and register your Groq, Cerebras, or HuggingFace API keys",
      step2Pre: "Copy your zerocost API key from ",
      step2Link: "API Keys",
      step2Post: "",
      step3Pre: "Set ",
      step3Post: " in your OpenAI client",
    },
    apiKeys: {
      title: "API Keys",
      subtitle: "Use this key as your Bearer token when calling the zerocost API",
      secretKey: "Secret API key",
      secretKeyDesc: "Keep this secret. Do not share or commit to version control.",
      active: "Active",
      hideKey: "Hide key",
      showKey: "Show key",
      copyToClipboard: "Copy to clipboard",
      noApiKey: "No API key found. Please contact support.",
      howToUse: "How to use",
      regenerateKey: "Regenerate key",
      regenerateDesc: "Invalidates your current key and issues a new one",
      comingSoon: "Coming soon",
      regenerate: "Regenerate",
    },
    usage: {
      title: "Usage",
      subtitle: "Monthly API request usage for your account",
      requestsThisMonth: "Requests this month",
      usedPct: (pct: number) => `${pct}% used`,
      remaining: "Remaining",
      today: "Today",
      resetsOn: "Resets on",
      yourPlan: "Your plan",
      requestsPerMonth: (n: string) => `${n} requests / month`,
      upgradeSoon: "Upgrade coming soon",
      noUsageData:
        "Usage data is unavailable. Stats will appear once you make your first API call.",
    },
    providers: {
      title: "Providers",
      subtitle:
        "Register free API keys for each provider and zerocost will automatically route your requests. More providers = more capacity.",
      registered: "Registered",
      getKey: "Get key →",
      deleteKey: "Remove",
      pasteHere: (placeholder: string) => `Paste here (${placeholder})`,
      register: "Register",
      cliTitle: "For engineers: configure via CLI",
      cliDesc: "Set up all provider keys interactively from your terminal:",
      cliNote: "※ CLI is currently under development. Coming soon.",
    },
    providerData: {
      groq: {
        description: "Free tier: 1,000 req/min, 10,000 tokens/min",
        steps: [
          "Open Groq console with the button above (new tab)",
          'Click "Create API Key" to generate a key',
          "Copy and paste into the form below",
        ],
      },
      cerebras: {
        description: "Free tier available (rate limits undisclosed)",
        steps: [
          "Open Cerebras Cloud with the button above (new tab)",
          "Generate a key from the API Keys menu",
          "Copy and paste into the form below",
        ],
      },
      huggingface: {
        description: "Free tier: Serverless Inference API",
        steps: [
          "Open HuggingFace with the button above (new tab)",
          'Create a "New token" (Read permission is enough)',
          "Copy and paste into the form below",
        ],
      },
    },
    upgrade: {
      emailTitle: "Enter your email",
      emailSubtitle: "You'll be redirected to Stripe's secure checkout. We never store your card details.",
      submit: (name: string) => `Continue with ${name} →`,
      submitting: "Redirecting…",
      cancelNote: "Cancel anytime within 30 days. Your card is securely managed by Stripe.",
      backToPlans: "← Back to plans",
      errorFallback: "Failed to create checkout session.",
      errorOccurred: "An error occurred.",
      alreadySubscribed: "This email already has the same plan active. Check your plan in the dashboard.",
      plans: {
        basic: {
          price: "¥500 / month",
          features: ["5,000 requests / month", "5 providers", "Automatic failover", "OpenAI-compatible API", "Priority routing"],
        },
        pro: {
          price: "¥1,500 / month",
          features: ["Unlimited requests", "All providers", "Smart routing (quota-aware)", "OpenAI-compatible API", "SLA uptime guarantee", "Usage analytics"],
        },
      },
    },
    success: {
      title: "Payment complete",
      body: "Your plan has been upgraded. Check your zc-key and plan details in the dashboard.",
      toDashboard: "Go to dashboard →",
      toHome: "Back to home",
      portalNote: "Cancel or change anytime via the Stripe customer portal.",
    },
  },
} as const;

export type DashboardMessages = (typeof DASHBOARD_MESSAGES)["en"];
