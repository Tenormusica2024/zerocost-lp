import { NextResponse } from "next/server";

// デプロイ環境変数の診断エンドポイント（一時的）
export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return NextResponse.json({
    has_supabase_url: !!supabaseUrl,
    supabase_url_prefix: supabaseUrl?.slice(0, 30) ?? null,
    has_service_key: !!serviceKey,
    service_key_length: serviceKey?.length ?? 0,
    service_key_prefix: serviceKey?.slice(0, 20) ?? null,
    node_env: process.env.NODE_ENV,
  });
}
