import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { getSupabaseAdmin } from "@/app/lib/supabase/admin";
import { getServerLocale, DASHBOARD_MESSAGES } from "@/app/lib/locale";

const PLAN_LIMITS: Record<string, { requests: number; label: string }> = {
  free: { requests: 1000, label: "Free" },
  basic: { requests: 10000, label: "Basic" },
  pro: { requests: 100000, label: "Pro" },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = getSupabaseAdmin();
  const { data: keyRow } = await admin
    .from("zerocost_keys")
    .select("zc_key, plan, status")
    .eq("email", user.email ?? "")
    .single();

  const plan = keyRow?.plan ?? "free";
  const zcKey = keyRow?.zc_key ?? null;
  const planInfo = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const maskedKey = zcKey
    ? `${zcKey.slice(0, 8)}${"•".repeat(20)}`
    : null;

  // zerocost-router から使用量を取得（エラー時は null）
  let usageData: { requests_this_month: number; reset_at: string } | null = null;
  if (zcKey) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ROUTER_BASE}/v1/keys/usage`,
        {
          headers: { Authorization: `Bearer ${zcKey}` },
          next: { revalidate: 60 },
        }
      );
      if (res.ok) {
        usageData = await res.json();
      }
    } catch {
      // フェッチ失敗は無視して null のまま
    }
  }

  const usedRequests = usageData?.requests_this_month ?? 0;
  const usagePercent = Math.min(
    Math.round((usedRequests / planInfo.requests) * 100),
    100
  );

  const locale = await getServerLocale();
  const m = DASHBOARD_MESSAGES[locale].overview;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
          {m.title}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {m.welcome(user.email ?? "")}
        </p>
      </div>

      {/* サマリーカード群 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* プランカード */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            {m.currentPlan}
          </p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {planInfo.label}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded font-medium ${
                plan === "pro"
                  ? "bg-indigo-50 text-indigo-700"
                  : plan === "basic"
                  ? "bg-sky-50 text-sky-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {keyRow?.status === "active" ? m.active : m.inactive}
            </span>
          </div>
        </div>

        {/* 使用量カード */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            {m.requestsThisMonth}
          </p>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-slate-900">
              {usedRequests.toLocaleString()}
            </span>
            <span className="text-sm text-slate-400 mb-0.5">
              / {planInfo.requests.toLocaleString()}
            </span>
          </div>
          {/* プログレスバー */}
          <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usagePercent >= 90
                  ? "bg-red-500"
                  : usagePercent >= 70
                  ? "bg-amber-500"
                  : "bg-indigo-500"
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        {/* リセット日カード */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            {m.resetsOn}
          </p>
          <span className="text-2xl font-bold text-slate-900">
            {usageData?.reset_at
              ? new Date(usageData.reset_at).toLocaleDateString(
                  locale === "ja" ? "ja-JP" : "en-US",
                  { month: "short", day: "numeric" }
                )
              : "—"}
          </span>
        </div>
      </div>

      {/* API キープレビュー */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">{m.yourApiKey}</h2>
          <Link
            href="/dashboard/api-keys"
            className="text-xs text-indigo-600 hover:underline font-medium"
          >
            {m.manage}
          </Link>
        </div>
        {maskedKey ? (
          <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3">
            <code className="text-sm font-mono text-slate-600 flex-1">
              {maskedKey}
            </code>
          </div>
        ) : (
          <p className="text-sm text-slate-400">{m.noApiKey}</p>
        )}
      </div>

      {/* クイックスタートガイド */}
      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">
          {m.quickStart}
        </h2>
        <div className="space-y-3 text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
              1
            </span>
            <span>
              {m.step1Pre}
              <Link href="/dashboard/providers" className="text-indigo-600 hover:underline">
                {m.step1Link}
              </Link>
              {m.step1Post}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
              2
            </span>
            <span>
              {m.step2Pre}
              <Link href="/dashboard/api-keys" className="text-indigo-600 hover:underline">
                {m.step2Link}
              </Link>
              {m.step2Post}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
              3
            </span>
            <span>
              {m.step3Pre}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">
                base_url={process.env.NEXT_PUBLIC_ROUTER_BASE}/v1
              </code>
              {m.step3Post}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
