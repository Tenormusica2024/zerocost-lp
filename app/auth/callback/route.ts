import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { getSupabaseAdmin } from "@/app/lib/supabase/admin";

// OAuth コールバック処理:
// プロバイダーから返ってきた code をセッションに交換して /dashboard へリダイレクト
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // zerocost_keys.user_id を Supabase Auth の UUID で紐付け
      // （まだ設定されていないレコードのみ更新 — 冪等）
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        const admin = getSupabaseAdmin();
        await admin
          .from("zerocost_keys")
          .update({ user_id: user.id })
          .eq("email", user.email)
          .is("user_id", null);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 認証失敗時は /login にエラー付きでリダイレクト
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
