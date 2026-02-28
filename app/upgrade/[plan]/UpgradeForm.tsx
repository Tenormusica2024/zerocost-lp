"use client";

import { useState } from "react";
import type { Locale } from "@/app/lib/locale";
import { DASHBOARD_MESSAGES } from "@/app/lib/locale";

interface Props {
  plan: string;
  locale: Locale;
}

export function UpgradeForm({ plan, locale }: Props) {
  const m = DASHBOARD_MESSAGES[locale].upgrade;
  const planInfo = m.plans[plan as "basic" | "pro"];

  const displayName = plan.charAt(0).toUpperCase() + plan.slice(1);

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
        // locale を渡して Stripe の決済画面言語を合わせる
        body: JSON.stringify({ email: email.trim().toLowerCase(), plan, locale }),
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        // 409: 同一プラン重複購入 → locale.ts のメッセージを使う
        if (res.status === 409) throw new Error(m.alreadySubscribed);
        throw new Error(data.error ?? m.errorFallback);
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : m.errorOccurred);
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* プラン概要 */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-sm font-semibold text-indigo-600"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            {displayName}
          </span>
          <span
            className="text-2xl font-extrabold text-slate-900"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            {planInfo.price}
          </span>
        </div>
        <ul className="space-y-2">
          {planInfo.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
              {/* SVG チェックマーク（絵文字禁止のため） */}
              <svg
                className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
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
        {m.emailTitle}
      </h1>
      <p className="text-slate-500 text-sm mb-6">{m.emailSubtitle}</p>

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
          {submitting ? m.submitting : m.submit(displayName)}
        </button>
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
      </form>

      <p className="text-xs text-slate-400 mt-4 text-center">{m.cancelNote}</p>

      <div className="mt-6 text-center">
        <a href="/#pricing" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
          {m.backToPlans}
        </a>
      </div>
    </div>
  );
}
