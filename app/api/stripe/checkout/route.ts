import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/app/lib/stripe";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://zerocost-lp.vercel.app";

// プランごとの Stripe 価格設定（日本円・月額）
const PLAN_PRICE: Record<string, { unit_amount: number; name: string }> = {
  basic: { unit_amount: 500,  name: "zerocost Basic" },
  pro:   { unit_amount: 1500, name: "zerocost Pro"   },
};

export async function POST(req: NextRequest) {
  let email: string;
  let plan: string;
  let stripeLocale: "ja" | "en";

  try {
    const body = await req.json();
    email = (body.email ?? "").trim().toLowerCase();
    plan  = (body.plan  ?? "").trim().toLowerCase();
    // フロントエンドから locale を受け取り Stripe 決済画面の言語に反映（未指定時は ja）
    stripeLocale = body.locale === "en" ? "en" : "ja";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // email バリデーション
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  // plan バリデーション
  if (!PLAN_PRICE[plan]) {
    return NextResponse.json({ error: "Invalid plan. Must be 'basic' or 'pro'." }, { status: 400 });
  }

  const stripe = getStripe();

  // 既存 Stripe Customer を検索し、なければ新規作成
  let customerId: string;
  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: { source: "zerocost-lp" },
      });
      customerId = customer.id;
    }
  } catch (err) {
    console.error("Stripe customer error:", err);
    return NextResponse.json(
      { error: "Payment service temporarily unavailable." },
      { status: 502 }
    );
  }

  // 既存アクティブサブスクリプションの確認（同一プランへの二重課金防止）
  // 別プランへのアップグレード（例: Basic → Pro）は通過させる
  try {
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
      expand: ["data.items.data.price"],
    });
    if (subs.data.length > 0) {
      const existingAmount = subs.data[0].items.data[0]?.price?.unit_amount;
      const requestedAmount = PLAN_PRICE[plan].unit_amount;
      // 同一金額（同一プラン）への重複購入のみブロック
      if (existingAmount === requestedAmount) {
        const alreadyMsg =
          stripeLocale === "ja"
            ? "このメールアドレスはすでに同じプランに加入済みです。ダッシュボードからプランをご確認ください。"
            : "This email already has the same plan active. Check your plan in the dashboard.";
        return NextResponse.json({ error: alreadyMsg }, { status: 409 });
      }
    }
  } catch (err) {
    console.error("Stripe subscriptions list error:", err);
    return NextResponse.json(
      { error: "Payment service temporarily unavailable." },
      { status: 502 }
    );
  }

  // Checkout Session 作成（月次サブスクリプション）
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      locale: stripeLocale,
      line_items: [
        {
          price_data: {
            currency: "jpy",
            unit_amount: PLAN_PRICE[plan].unit_amount,
            recurring: { interval: "month" },
            product_data: { name: PLAN_PRICE[plan].name },
          },
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${APP_URL}/#pricing`,
      metadata: { email, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout session error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 502 }
    );
  }
}
