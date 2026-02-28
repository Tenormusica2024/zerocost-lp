import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { getSupabaseAdmin } from "@/app/lib/supabase/admin";

interface UsageData {
  requests_this_month: number;
  requests_limit: number;
  reset_at: string;
  requests_today?: number;
}

const PLAN_LIMITS: Record<string, number> = {
  free: 1000,
  basic: 10000,
  pro: 100000,
};

export default async function UsagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = getSupabaseAdmin();
  const { data: keyRow } = await admin
    .from("zerocost_keys")
    .select("zc_key, plan")
    .eq("email", user.email ?? "")
    .single();

  const zcKey = keyRow?.zc_key ?? null;
  const plan = keyRow?.plan ?? "free";
  const planLimit = PLAN_LIMITS[plan] ?? 1000;

  let usage: UsageData | null = null;
  if (zcKey) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ROUTER_BASE}/v1/keys/usage`,
        {
          headers: { Authorization: `Bearer ${zcKey}` },
          next: { revalidate: 60 },
        }
      );
      if (res.ok) usage = await res.json();
    } catch {
      // フェッチ失敗は無視
    }
  }

  const used = usage?.requests_this_month ?? 0;
  const limit = usage?.requests_limit ?? planLimit;
  const usagePercent = Math.min(Math.round((used / limit) * 100), 100);
  const remaining = Math.max(limit - used, 0);

  const resetDate = usage?.reset_at
    ? new Date(usage.reset_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
          Usage
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monthly API request usage for your account
        </p>
      </div>

      {/* 使用量メインカード */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 mb-4">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
              Requests this month
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {used.toLocaleString()}
              </span>
              <span className="text-base text-slate-400">
                / {limit.toLocaleString()}
              </span>
            </div>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium ${
              usagePercent >= 90
                ? "bg-red-50 text-red-700"
                : usagePercent >= 70
                ? "bg-amber-50 text-amber-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {usagePercent}% used
          </span>
        </div>

        {/* プログレスバー */}
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
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

      {/* 統計グリッド */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="text-xs text-slate-500 mb-1">Remaining</p>
          <p className="text-xl font-bold text-slate-900">
            {remaining.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="text-xs text-slate-500 mb-1">Today</p>
          <p className="text-xl font-bold text-slate-900">
            {usage?.requests_today?.toLocaleString() ?? "—"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="text-xs text-slate-500 mb-1">Resets on</p>
          <p className="text-base font-bold text-slate-900">
            {resetDate ?? "—"}
          </p>
        </div>
      </div>

      {/* プラン情報 */}
      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Your plan</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {limit.toLocaleString()} requests / month
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-2.5 py-1 rounded font-medium ${
                plan === "pro"
                  ? "bg-indigo-50 text-indigo-700"
                  : plan === "basic"
                  ? "bg-sky-50 text-sky-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {plan === "pro" ? "Pro" : plan === "basic" ? "Basic" : "Free"}
            </span>
            {plan === "free" && (
              <span className="text-xs text-slate-400">
                Upgrade coming soon
              </span>
            )}
          </div>
        </div>
      </div>

      {/* データ未取得の場合の注記 */}
      {!usage && zcKey && (
        <p className="mt-4 text-xs text-slate-400 text-center">
          Usage data is unavailable. Stats will appear once you make your first
          API call.
        </p>
      )}
    </div>
  );
}
