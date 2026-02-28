"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import { getSupabaseAdmin } from "@/app/lib/supabase/admin";

const ROUTER_BASE = process.env.NEXT_PUBLIC_ROUTER_BASE!;

// ユーザーの zc-key を取得するヘルパー
async function getZcKey(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("zerocost_keys")
    .select("zc_key")
    .eq("email", user.email)
    .single();
  return data?.zc_key ?? null;
}

// プロバイダーキーを登録する
// Next.js 16 App Router: form action は void を返す必要があるため戻り値なし
export async function addProvider(formData: FormData): Promise<void> {
  const provider = formData.get("provider") as string;
  const apiKey = formData.get("api_key") as string;

  if (!provider || !apiKey) return;

  const zcKey = await getZcKey();
  if (!zcKey) return;

  const res = await fetch(`${ROUTER_BASE}/v1/keys/providers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${zcKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ provider, api_key: apiKey }),
  });

  if (!res.ok) return;

  revalidatePath("/dashboard/providers");
}

// プロバイダーキーを削除する
// Next.js 16 App Router: form action は void を返す必要があるため戻り値なし
export async function deleteProvider(provider: string): Promise<void> {
  const zcKey = await getZcKey();
  if (!zcKey) return;

  const res = await fetch(`${ROUTER_BASE}/v1/keys/providers/${provider}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${zcKey}` },
  });

  if (!res.ok) return;

  revalidatePath("/dashboard/providers");
}
