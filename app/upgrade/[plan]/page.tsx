"use client";

import { notFound, useParams } from "next/navigation";
import { useState } from "react";

// 有効なプランと表示情報
const PLAN_INFO: Record<string, { displayName: string; price: string; features: string[] }> = {
  basic: {
    displayName: "Basic",
    price: "¥500 / 月",
    features: [
      "5,000 リクエスト / 月",
      "5 プロバイダー",
      "自動フェイルオーバー",
      "OpenAI 互換 API",
      "優先ルーティング",
    ],
  },
  pro: {
    displayName: "Pro",
    price: "¥1,500 / 月",
    features: [
      "無制限リクエスト",
      "全プロバイダー",
      "スマートルーティング（クォータ認識）",
      "OpenAI 互換 API",
      "SLA 保証アップタイム",
      "使用量アナリティクス",
    ],
  },
};

export default function UpgradePage() {
  const params = useParams();
  const plan = typeof params.plan === "string" ? params.plan.toLowerCase() : "";

  if (!PLAN_INFO[plan]) {
    notFound();
  }

  const info = PLAN_INFO[plan];

  const [email, setEmail]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), plan }),
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "チェックアウトの作成に失敗しました。");
      }

      // Stripe Checkout へリダイレクト
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました。");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center px-6 py-24">
      {/* ロゴ */}
      <a
        href="/"
        className="text-xl font-extrabold tracking-tight text-slate-900 mb-12"
        style={{ fontFamily: "var(--font-bricolage)" }}
      >
        zerocost
      </a>

      <div className="w-full max-w-md">
        {/* プラン概要 */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span
              className="text-sm font-semibold text-indigo-600"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              {info.displayName}
            </span>
            <span
              className="text-2xl font-extrabold text-slate-900"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              {info.price}
            </span>
          </div>
          <ul className="space-y-2">
            {info.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="text-indigo-500 shrink-0">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* メール入力フォーム */}
        <h1
          className="text-2xl font-bold text-slate-900 mb-2"
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          メールアドレスを入力
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          Stripe の安全な決済ページへリダイレクトします。クレジットカード情報はこのサイトには入力しません。
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900
                       placeholder:text-slate-400 focus:outline-none focus:border-indigo-400
                       focus:ring-2 focus:ring-indigo-100 transition-all"
          />
          <button
            type="submit"
            disabled={submitting || !email.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60
                       text-white font-semibold rounded-xl text-sm transition-colors"
          >
            {submitting ? "移動中…" : `${info.displayName} プランで続ける →`}
          </button>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
        </form>

        <p className="text-xs text-slate-400 mt-4 text-center">
          30日以内はいつでもキャンセル可能。クレジットカードは Stripe が安全に管理します。
        </p>

        <div className="mt-6 text-center">
          <a href="/#pricing" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            ← プラン一覧に戻る
          </a>
        </div>
      </div>
    </main>
  );
}
