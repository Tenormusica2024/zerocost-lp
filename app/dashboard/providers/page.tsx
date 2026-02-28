import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { getSupabaseAdmin } from "@/app/lib/supabase/admin";
import { addProvider, deleteProvider } from "./actions";

const SUPPORTED_PROVIDERS = [
  {
    slug: "groq",
    name: "Groq",
    description: "無料枠: 毎分1,000リクエスト / 10,000トークン",
    keyPageUrl: "https://console.groq.com/keys",
    placeholder: "gsk_...",
    steps: [
      "上のボタンでGroqコンソールを開く（新しいタブ）",
      "「Create API Key」でキーを発行",
      "コピーして下のフォームに貼り付け",
    ],
  },
  {
    slug: "cerebras",
    name: "Cerebras",
    description: "無料枠あり（レート制限は非公開）",
    keyPageUrl: "https://cloud.cerebras.ai",
    placeholder: "csk-...",
    steps: [
      "上のボタンでCerebrasクラウドを開く（新しいタブ）",
      "API Keys メニューからキーを発行",
      "コピーして下のフォームに貼り付け",
    ],
  },
  {
    slug: "huggingface",
    name: "HuggingFace",
    description: "無料枠: Serverless Inference API",
    keyPageUrl: "https://huggingface.co/settings/tokens",
    placeholder: "hf_...",
    steps: [
      "上のボタンでHuggingFaceを開く（新しいタブ）",
      "「New token」でトークンを発行（Read権限でOK）",
      "コピーして下のフォームに貼り付け",
    ],
  },
] as const;

type ProviderSlug = (typeof SUPPORTED_PROVIDERS)[number]["slug"];

interface RegisteredProvider {
  provider: string;
  masked_key: string;
  registered_at: string;
}

export default async function ProvidersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = getSupabaseAdmin();
  const { data: keyRow } = await admin
    .from("zerocost_keys")
    .select("zc_key")
    .eq("email", user.email ?? "")
    .single();

  const zcKey = keyRow?.zc_key ?? null;

  // 登録済みプロバイダーを zerocost-router から取得
  let registeredProviders: RegisteredProvider[] = [];
  if (zcKey) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ROUTER_BASE}/v1/keys/providers`,
        {
          headers: { Authorization: `Bearer ${zcKey}` },
          next: { revalidate: 0 },
        }
      );
      if (res.ok) {
        const data = await res.json();
        registeredProviders = data.providers ?? [];
      }
    } catch {
      // フェッチ失敗は無視
    }
  }

  const registeredSlugs = new Set(
    registeredProviders.map((p) => p.provider)
  );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
          プロバイダー設定
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          各プロバイダーの無料 API キーを登録すると、zerocost が自動でリクエストを振り分けます。
          登録するほど使える量が増えます。
        </p>
      </div>

      {/* プロバイダーカード一覧 */}
      <div className="space-y-4">
        {SUPPORTED_PROVIDERS.map((sp) => {
          const registered = registeredProviders.find(
            (p) => p.provider === sp.slug
          );
          const isRegistered = registeredSlugs.has(sp.slug as ProviderSlug);

          return (
            <div
              key={sp.slug}
              className="bg-white rounded-xl border border-slate-100 overflow-hidden"
            >
              {/* カードヘッダー */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-900">
                      {sp.name}
                    </h2>
                    {isRegistered && (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-700 font-medium">
                        登録済み
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {sp.description}
                  </p>
                </div>
                {/* API キー取得ページへのリンク（常に表示） */}
                <a
                  href={sp.keyPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
                >
                  キーを取得 →
                </a>
              </div>

              {/* 登録済みの場合: キー情報 + 削除ボタン */}
              {isRegistered && registered && (
                <div className="px-6 py-4 flex items-center justify-between">
                  <p className="text-xs text-slate-400 font-mono">
                    {registered.masked_key}
                  </p>
                  <form action={deleteProvider.bind(null, sp.slug)}>
                    <button
                      type="submit"
                      className="text-xs text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                    >
                      削除
                    </button>
                  </form>
                </div>
              )}

              {/* 未登録の場合: 手順 + 入力フォーム */}
              {!isRegistered && (
                <div className="px-6 py-4">
                  {/* 取得手順 */}
                  <ol className="text-xs text-slate-500 space-y-1 mb-4 list-decimal list-inside">
                    {sp.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>

                  {/* キー入力フォーム */}
                  <form action={addProvider} className="flex gap-2">
                    <input type="hidden" name="provider" value={sp.slug} />
                    <input
                      name="api_key"
                      type="password"
                      required
                      placeholder={`ここに貼り付け（${sp.placeholder}）`}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="shrink-0 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors cursor-pointer"
                    >
                      登録
                    </button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CLI 案内（折りたたみ） */}
      <details className="mt-8 group">
        <summary className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer select-none list-none flex items-center gap-1">
          <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
          エンジニア向け: CLI でまとめて設定する
        </summary>
        <div className="mt-3 bg-slate-50 rounded-lg p-4 border border-slate-100">
          <p className="text-xs text-slate-500 mb-2">
            ターミナルから対話形式でプロバイダーキーを一括設定できます:
          </p>
          <code className="block text-xs font-mono text-slate-700 bg-white border border-slate-200 rounded px-3 py-2">
            npx zerocost setup
          </code>
          <p className="text-xs text-slate-400 mt-2">
            ※ CLI は現在開発中です。近日公開予定。
          </p>
        </div>
      </details>
    </div>
  );
}
