"use client";

import { useState, useEffect } from "react";
import { type Locale, DASHBOARD_MESSAGES } from "./locale";

/** クライアントコンポーネント用: navigator.language からロケールを判定 */
export function useLocale(): Locale {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
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
