import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/app/lib/stripe";
import { getSupabaseAdmin } from "@/app/lib/supabase/admin";

const ROUTER_URL =
  process.env.NEXT_PUBLIC_ROUTER_BASE ?? "https://zerocost-router.dragonrondo.workers.dev";

export async function POST(req: NextRequest) {
  const body = await req.text(); // HMAC署名検証のために raw body が必要
  const sig  = req.headers.get("stripe-signature");

  if (!sig) {
    return new Response("Missing stripe-signature header.", { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set.");
    return new Response("Webhook secret not configured.", { status: 500 });
  }

  // 署名検証（改ざん防止）
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature.", { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // 支払い完了: plan 更新 + zc_key 発行（未保有の場合）
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email   = session.metadata?.email;
    const plan    = session.metadata?.plan;

    const VALID_PLANS = ["basic", "pro"] as const;
    if (!email || !plan || !(VALID_PLANS as readonly string[]).includes(plan)) {
      console.error("Webhook: invalid metadata", session.metadata);
      return new Response("ok", { status: 200 }); // Stripe にエラーを返さない
    }

    const customerId     = session.customer     as string;
    const subscriptionId = session.subscription as string;

    // 既存キーの検索
    const { data: existing, error: selectError } = await supabase
      .from("zerocost_keys")
      .select("zc_key")
      .eq("email", email)
      .eq("status", "active")
      .maybeSingle();

    if (selectError) {
      console.error("Supabase select error in webhook:", selectError);
      return new Response("ok", { status: 200 });
    }

    if (existing?.zc_key) {
      // 既存: plan と Stripe 情報を更新
      const { error: updateError } = await supabase
        .from("zerocost_keys")
        .update({
          plan,
          stripe_customer_id:     customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status:    "active",
          updated_at:             new Date().toISOString(),
        })
        .eq("email", email)
        .eq("status", "active");

      if (updateError) {
        console.error("Supabase update error in webhook:", updateError);
      } else {
        console.log(`Webhook: upgraded ${email} to ${plan}`);
      }
    } else {
      // 新規: zerocost-router から zc_key を発行して INSERT
      let zcKey: string;
      try {
        const routerRes = await fetch(`${ROUTER_URL}/v1/keys`, { method: "POST" });
        if (!routerRes.ok) {
          console.error("Router key generation failed:", await routerRes.text());
          return new Response("ok", { status: 200 });
        }
        const routerData = await routerRes.json() as { key: string };
        zcKey = routerData.key;
      } catch (err) {
        console.error("Router request error in webhook:", err);
        return new Response("ok", { status: 200 });
      }

      const { error: insertError } = await supabase
        .from("zerocost_keys")
        .insert({
          email,
          zc_key:                 zcKey,
          plan,
          status:                 "active",
          stripe_customer_id:     customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status:    "active",
        });

      if (insertError) {
        if (insertError.code === "23505") {
          // stripe_subscription_id の UNIQUE 制約違反 → 同一イベントの重複配信。冪等性確保のため無視
          console.log(`Webhook: duplicate subscription ${subscriptionId}, skipped.`);
        } else {
          // その他の INSERT エラー → 課金済みでキー未発行になるため 500 を返して Stripe にリトライさせる
          console.error("Supabase insert error in webhook:", insertError);
          return new Response("Internal server error.", { status: 500 });
        }
      } else {
        console.log(`Webhook: new ${plan} key for ${email}`);
      }
    }
  }

  // サブスクリプションキャンセル: plan を 'free' に戻す
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;

    const { error: updateError } = await supabase
      .from("zerocost_keys")
      .update({
        plan:                "free",
        subscription_status: "canceled",
        updated_at:          new Date().toISOString(),
      })
      .eq("stripe_subscription_id", sub.id);

    if (updateError) {
      console.error("Supabase update error on subscription deleted:", updateError);
    } else {
      console.log(`Webhook: canceled subscription ${sub.id}`);
    }
  }

  return new Response("ok", { status: 200 });
}
