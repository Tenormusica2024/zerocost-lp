-- zerocost_keys テーブルに user_id カラムを追加
-- Supabase Auth の auth.users(id) と紐付けることで、
-- email 変更・重複メール登録などのエッジケースに対応する

ALTER TABLE zerocost_keys
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 既存レコードの user_id を auth.users の email でバックフィル
-- （OAuth ログイン済みユーザーが対象）
UPDATE zerocost_keys k
SET user_id = u.id
FROM auth.users u
WHERE u.email = k.email
  AND k.user_id IS NULL;

-- user_id でのインデックス（ダッシュボードの検索を高速化）
CREATE INDEX IF NOT EXISTS zerocost_keys_user_id_idx ON zerocost_keys(user_id);
