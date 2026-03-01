import { headers, cookies } from "next/headers";
import { type Locale, LOCALE_COOKIE } from "./locale";

/**
 * サーバーコンポーネント専用: ロケール判定
 * 優先順位: Cookie > Accept-Language ヘッダー > "en"
 * next/headers を使うため Server Component / Route Handler のみで呼び出す
 */
export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const saved = cookieStore.get(LOCALE_COOKIE)?.value;
  if (saved === "ja" || saved === "en") return saved;

  const h = await headers();
  const acceptLang = h.get("accept-language") ?? "";
  return acceptLang.toLowerCase().startsWith("ja") ? "ja" : "en";
}
