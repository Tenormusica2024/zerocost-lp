import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { getSupabaseAdmin } from "@/app/lib/supabase/admin";

// GET /api/dashboard/key-info
// 認証済みユーザーの zc-key・プラン情報を返す
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const { data: keyRow, error } = await admin
    .from("zerocost_keys")
    .select("zc_key, plan, status")
    .eq("email", user.email ?? "")
    .single();

  if (error || !keyRow) {
    return NextResponse.json(
      { zcKey: null, plan: "free", email: user.email },
      { status: 200 }
    );
  }

  return NextResponse.json({
    zcKey: keyRow.zc_key,
    plan: keyRow.plan ?? "free",
    email: user.email,
    status: keyRow.status,
  });
}
