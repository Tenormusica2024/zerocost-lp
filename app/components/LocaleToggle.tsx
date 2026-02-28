"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocaleCookie } from "@/app/actions/locale";
import type { Locale } from "@/app/lib/locale";

interface LocaleToggleProps {
  currentLocale: Locale;
}

/** ダッシュボード用言語トグルボタン（Cookie + router.refresh） */
export function LocaleToggle({ currentLocale }: LocaleToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = (locale: Locale) => {
    if (locale === currentLocale) return;
    startTransition(async () => {
      await setLocaleCookie(locale);
      router.refresh();
    });
  };

  return (
    <div
      className={`flex items-center gap-1 px-3 py-2 text-xs font-semibold transition-opacity ${
        isPending ? "opacity-50" : ""
      }`}
    >
      <button
        onClick={() => handleToggle("ja")}
        aria-pressed={currentLocale === "ja"}
        className={`px-1 transition-colors ${
          currentLocale === "ja"
            ? "text-slate-700"
            : "text-slate-400 hover:text-slate-600"
        }`}
      >
        JP
      </button>
      <span className="text-slate-200">|</span>
      <button
        onClick={() => handleToggle("en")}
        aria-pressed={currentLocale === "en"}
        className={`px-1 transition-colors ${
          currentLocale === "en"
            ? "text-slate-700"
            : "text-slate-400 hover:text-slate-600"
        }`}
      >
        EN
      </button>
    </div>
  );
}
