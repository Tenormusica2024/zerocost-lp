import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { getSupabaseAdmin } from "@/app/lib/supabase/admin";
import { getServerLocale, DASHBOARD_MESSAGES } from "@/app/lib/locale";
import { LocaleToggle } from "@/app/components/LocaleToggle";

// ログアウト Server Action
async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ユーザーのプランを zerocost_keys テーブルから取得
  const admin = getSupabaseAdmin();
  const { data: keyRow } = await admin
    .from("zerocost_keys")
    .select("plan, status")
    .eq("email", user.email ?? "")
    .single();

  const plan = keyRow?.plan ?? "free";

  const locale = await getServerLocale();
  const m = DASHBOARD_MESSAGES[locale];

  const navItems = [
    {
      href: "/dashboard",
      label: m.nav.overview,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
    },
    {
      href: "/dashboard/api-keys",
      label: m.nav.apiKeys,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      ),
    },
    {
      href: "/dashboard/usage",
      label: m.nav.usage,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      href: "/dashboard/providers",
      label: m.nav.providers,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
        </svg>
      ),
    },
  ];

  const planLabel =
    plan === "pro"
      ? m.sidebar.planPro
      : plan === "basic"
      ? m.sidebar.planBasic
      : m.sidebar.planFree;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* サイドバー */}
      <aside className="w-60 bg-white border-r border-slate-100 flex flex-col shrink-0">
        {/* ロゴ */}
        <div className="px-5 py-5 border-b border-slate-100">
          <a href="/" className="inline-flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">z</span>
            </div>
            <span className="font-semibold text-slate-900 text-sm tracking-tight">
              zerocost
            </span>
          </a>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <span className="text-slate-400">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* ユーザーセクション */}
        <div className="px-3 pb-4 pt-3 border-t border-slate-100 space-y-1">
          {/* プランバッジ */}
          <div className="px-3 py-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                plan === "pro"
                  ? "bg-indigo-50 text-indigo-700"
                  : plan === "basic"
                  ? "bg-sky-50 text-sky-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {planLabel}
            </span>
          </div>

          {/* メールアドレス */}
          <div className="px-3 py-1">
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>

          {/* ログアウト */}
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-500 rounded-md hover:bg-slate-50 hover:text-slate-700 transition-colors text-left cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              {m.sidebar.signOut}
            </button>
          </form>

          {/* 言語トグル */}
          <LocaleToggle currentLocale={locale} />
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
