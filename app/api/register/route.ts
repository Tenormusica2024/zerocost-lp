import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/lib/supabase/admin";

const ROUTER_URL = "https://zerocost-router.dragonrondo.workers.dev";

export async function POST(req: NextRequest) {
  let email: string;

  try {
    const body = await req.json();
    email = (body.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // メールアドレスの基本バリデーション
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  // 既存の有効なキーがあればそのまま返す
  const { data: existing } = await supabaseAdmin
    .from("zerocost_keys")
    .select("zc_key")
    .eq("email", email)
    .eq("status", "active")
    .single();

  if (existing?.zc_key) {
    return NextResponse.json({ key: existing.zc_key });
  }

  // zerocost-router の /v1/keys エンドポイントに新規キーを発行依頼
  let zcKey: string;
  try {
    const routerRes = await fetch(`${ROUTER_URL}/v1/keys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Secret": process.env.ROUTER_ADMIN_SECRET ?? "",
      },
      body: JSON.stringify({ email }),
    });

    if (!routerRes.ok) {
      const text = await routerRes.text();
      console.error("Router key generation failed:", routerRes.status, text);
      return NextResponse.json(
        { error: "Key generation failed. Please try again later." },
        { status: 502 }
      );
    }

    const routerData = await routerRes.json();
    zcKey = routerData.key ?? routerData.zc_key;

    if (!zcKey) {
      console.error("Router returned no key:", routerData);
      return NextResponse.json(
        { error: "Key generation failed. Please try again later." },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("Router request error:", err);
    return NextResponse.json(
      { error: "Service temporarily unavailable." },
      { status: 503 }
    );
  }

  // Supabase に email + key を保存
  const { error: dbError } = await supabaseAdmin.from("zerocost_keys").insert({
    email,
    zc_key: zcKey,
    plan: "free",
    status: "active",
  });

  if (dbError) {
    console.error("Supabase insert error:", dbError);
    // DB保存失敗でもキー自体は有効なので返す（冪等）
  }

  return NextResponse.json({ key: zcKey });
}
