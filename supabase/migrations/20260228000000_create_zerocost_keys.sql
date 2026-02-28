-- zerocost_keys テーブル
-- zerocost-router の無料プラン登録者に発行する API キーを管理する
-- ai-model-tracker Supabase プロジェクトに追加する

CREATE TABLE IF NOT EXISTS zerocost_keys (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text        NOT NULL,
  zc_key      text        UNIQUE NOT NULL,
  plan        text        NOT NULL DEFAULT 'free',
  status      text        NOT NULL DEFAULT 'active',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- email での検索を高速化（重複チェックに使用）
CREATE INDEX IF NOT EXISTS zerocost_keys_email_idx
  ON zerocost_keys (email);

-- RLS を有効化（service_role キーのみ操作可能にする）
ALTER TABLE zerocost_keys ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー: service_role はすべての操作を許可
CREATE POLICY "service_role_all" ON zerocost_keys
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
