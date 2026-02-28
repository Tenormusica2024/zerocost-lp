import { notFound } from "next/navigation";
import { getServerLocale } from "@/app/lib/locale";
import { UpgradeForm } from "./UpgradeForm";

const VALID_PLANS = ["basic", "pro"] as const;

export default async function UpgradePage({
  params,
}: {
  params: Promise<{ plan: string }>;
}) {
  const { plan } = await params;
  const normalizedPlan = plan.toLowerCase();

  // Server Component なので notFound() が正しく機能する
  if (!VALID_PLANS.includes(normalizedPlan as (typeof VALID_PLANS)[number])) {
    notFound();
  }

  const locale = await getServerLocale();

  return (
    <main className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center px-6 py-24">
      {/* ロゴ */}
      <a
        href="/"
        className="text-xl font-extrabold tracking-tight text-slate-900 mb-12"
        style={{ fontFamily: "var(--font-bricolage)" }}
      >
        zerocost
      </a>

      <UpgradeForm plan={normalizedPlan} locale={locale} />
    </main>
  );
}
