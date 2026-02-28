import Link from "next/link";
import { getServerLocale, DASHBOARD_MESSAGES } from "@/app/lib/locale";

export default async function UpgradeSuccessPage() {
  const locale = await getServerLocale();
  const m = DASHBOARD_MESSAGES[locale].success;

  return (
    <main className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center px-6 py-24">
      <style>{`
        @keyframes circle-pop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          80%  { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes check-draw {
          to { stroke-dashoffset: 0; }
        }
        .animate-circle-pop {
          animation: circle-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-check-draw {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: check-draw 0.4s ease-out 0.35s forwards;
        }
      `}</style>

      {/* ロゴ */}
      <a
        href="/"
        className="text-xl font-extrabold tracking-tight text-slate-900 mb-12"
        style={{ fontFamily: "var(--font-bricolage)" }}
      >
        zerocost
      </a>

      <div className="w-full max-w-md text-center">
        {/* 完了アイコン（circle pop + checkmark stroke draw） */}
        <div className="w-16 h-16 mx-auto mb-6">
          <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="26"
              cy="26"
              r="26"
              fill="#dcfce7"
              className="animate-circle-pop"
            />
            <path
              d="M14 27l9 9 16-17"
              stroke="#16a34a"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-check-draw"
            />
          </svg>
        </div>

        <h1
          className="text-2xl font-bold text-slate-900 mb-3"
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          {m.title}
        </h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">{m.body}</p>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700
                       text-white font-semibold rounded-xl text-sm transition-colors text-center"
          >
            {m.toDashboard}
          </Link>
          <Link
            href="/"
            className="block w-full py-3 border border-slate-200 hover:border-slate-300
                       text-slate-600 font-semibold rounded-xl text-sm transition-colors text-center"
          >
            {m.toHome}
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-6">{m.portalNote}</p>
      </div>
    </main>
  );
}
