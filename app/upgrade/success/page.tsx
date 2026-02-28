import Link from "next/link";

export default function UpgradeSuccessPage() {
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

      <div className="w-full max-w-md text-center">
        {/* 完了アイコン */}
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <span className="text-green-600 text-2xl font-bold">✓</span>
        </div>

        <h1
          className="text-2xl font-bold text-slate-900 mb-3"
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          お支払いが完了しました
        </h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          プランのアップグレードが完了しました。
          <br />
          ダッシュボードから zc-key とプラン情報をご確認ください。
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700
                       text-white font-semibold rounded-xl text-sm transition-colors text-center"
          >
            ダッシュボードへ →
          </Link>
          <Link
            href="/"
            className="block w-full py-3 border border-slate-200 hover:border-slate-300
                       text-slate-600 font-semibold rounded-xl text-sm transition-colors text-center"
          >
            トップページへ戻る
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-6">
          キャンセル・変更は Stripe カスタマーポータルからいつでも可能です。
        </p>
      </div>
    </main>
  );
}
