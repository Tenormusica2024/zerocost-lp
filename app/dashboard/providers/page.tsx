import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { getSupabaseAdmin } from "@/app/lib/supabase/admin";
import { addProvider, deleteProvider } from "./actions";

const SUPPORTED_PROVIDERS = [
  {
    slug: "groq",
    name: "Groq",
    description: "Free tier: 1,000 RPM / 10,000 TPM",
    docsUrl: "https://console.groq.com/keys",
    placeholder: "gsk_...",
  },
  {
    slug: "cerebras",
    name: "Cerebras",
    description: "Free tier included (rate limits not published)",
    docsUrl: "https://cloud.cerebras.ai",
    placeholder: "csk-...",
  },
  {
    slug: "huggingface",
    name: "HuggingFace",
    description: "Free tier: Serverless Inference API",
    docsUrl: "https://huggingface.co/settings/tokens",
    placeholder: "hf_...",
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
          Providers
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Register your free-tier API keys. zerocost automatically routes
          requests to the best available provider.
        </p>
      </div>

      {/* 登録済みプロバイダー */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">
          Registered providers
        </h2>

        {registeredProviders.length === 0 ? (
          <p className="text-sm text-slate-400">
            No providers registered yet. Add one below to start routing
            requests.
          </p>
        ) : (
          <div className="space-y-3">
            {registeredProviders.map((p) => {
              const info = SUPPORTED_PROVIDERS.find(
                (sp) => sp.slug === p.provider
              );
              // deleteProvider を特定のプロバイダー slug に bind する
              const deleteWithSlug = deleteProvider.bind(null, p.provider);
              return (
                <div
                  key={p.provider}
                  className="flex items-center gap-4 px-4 py-3 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {info?.name ?? p.provider}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {p.masked_key}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-700 font-medium shrink-0">
                    Active
                  </span>
                  <form action={deleteWithSlug}>
                    <button
                      type="submit"
                      className="text-xs text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* プロバイダー追加フォーム */}
      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">
          Add a provider
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Your API keys are stored encrypted and used only for routing your
          requests.
        </p>

        <form action={addProvider} className="space-y-4">
          {/* プロバイダー選択 */}
          <div>
            <label
              htmlFor="provider"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Provider
            </label>
            <select
              id="provider"
              name="provider"
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select a provider...</option>
              {SUPPORTED_PROVIDERS.filter(
                (sp) => !registeredSlugs.has(sp.slug as ProviderSlug)
              ).map((sp) => (
                <option key={sp.slug} value={sp.slug}>
                  {sp.name} — {sp.description}
                </option>
              ))}
            </select>
          </div>

          {/* API キー入力 */}
          <div>
            <label
              htmlFor="api_key"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              API key
            </label>
            <input
              id="api_key"
              name="api_key"
              type="password"
              required
              placeholder="Paste your API key here"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 font-mono placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors cursor-pointer"
          >
            Add provider
          </button>
        </form>

        {/* 各プロバイダーへのリンク */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-xs text-slate-500 mb-3">Get your API keys:</p>
          <div className="flex flex-wrap gap-3">
            {SUPPORTED_PROVIDERS.map((sp) => (
              <a
                key={sp.slug}
                href={sp.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:underline"
              >
                {sp.name} →
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
