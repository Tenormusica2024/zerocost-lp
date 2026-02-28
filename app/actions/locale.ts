"use server";

import { cookies } from "next/headers";
import type { Locale } from "@/app/lib/locale";

/** ダッシュボードのトグルから Cookie に言語設定を保存 */
export async function setLocaleCookie(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set("zerocost_locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1年
    sameSite: "lax",
  });
}
