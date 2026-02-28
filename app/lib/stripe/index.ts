import Stripe from "stripe";

// Stripe クライアント（遅延初期化・dev hot reload でも同一インスタンスを再利用）
declare global {
  // eslint-disable-next-line no-var
  var _stripe: Stripe | undefined;
}

export function getStripe(): Stripe {
  if (globalThis._stripe) return globalThis._stripe;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY must be set.");
  }

  globalThis._stripe = new Stripe(secretKey, {
    apiVersion: "2026-02-25.clover",
  });

  return globalThis._stripe;
}
