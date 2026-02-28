import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

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
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 認証失敗時は /login にエラー付きでリダイレクト
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
