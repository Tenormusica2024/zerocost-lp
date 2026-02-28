"use client";

import { useState, useEffect } from "react";
import { type Locale, DASHBOARD_MESSAGES, LOCALE_COOKIE } from "./locale";

/** Cookie から言語設定を読む（ブラウザ用） */
function readLocaleCookie(): Locale | null {
  const match = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith(`${LOCALE_COOKIE}=`));
  const val = match?.split("=")[1]?.trim();
  return val === "ja" || val === "en" ? val : null;
}

/**
 * クライアントコンポーネント用: ロケール判定
 * 優先順位: Cookie > navigator.language > "en"
 */
export function useLocale(): Locale {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const saved = readLocaleCookie();
    if (saved) {
      setLocale(saved);
      return;
    }
    if (navigator.language.toLowerCase().startsWith("ja")) {
      setLocale("ja");
    }
  }, []);

  return locale;
}

/** クライアントコンポーネント用: ロケールと翻訳メッセージを返す */
export function useDashboardMessages() {
  const locale = useLocale();
  return { locale, m: DASHBOARD_MESSAGES[locale] };
}
