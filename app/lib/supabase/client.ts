import { createBrowserClient } from "@supabase/ssr";

// ブラウザ（Client Component）から使う Supabase クライアント
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
