# zerocost-lp — Claude Code Instructions

## プロジェクト概要

zerocost-router のランディングページ。メールアドレスを入力すると zc-key が発行され、Supabase に保存される。

- **本番URL:** https://zerocost-lp.vercel.app
- **GitHub:** https://github.com/Tenormusica2024/zerocost-lp
- **ローカルパス:** `D:\antigravity_projects\zerocost-lp`

## 技術スタック

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js App Router | 16.1.6 | フレームワーク |
| React | 19.2.3 | UI |
| Tailwind CSS | v4 | スタイリング |
| TypeScript | ^5 | 型定義 |
| @supabase/supabase-js | ^2.98.0 | DBクライアント |
| Vercel | - | ホスティング |
| Supabase | - | PostgreSQL DB（zerocost_keysテーブル） |

## ディレクトリ構成

```
app/
  layout.tsx               # Bricolage Grotesque + DM Sans フォント設定・メタデータ
  globals.css              # CSS変数・フォント割り当て（Tailwind v4 @theme）
  page.tsx                 # LP本体（7セクション: Navbar/Hero/Features/Pricing/Signup/FAQ/Footer）
  api/
    register/
      route.ts             # POST /api/register: メール → zc-key発行 → Supabase保存
  lib/
    supabase/
      admin.ts             # Supabase admin クライアント（遅延初期化パターン）
sql/
  create_zerocost_keys.sql # テーブル定義（参考用）
supabase/
  migrations/
    20260228000000_create_zerocost_keys.sql  # Supabase CLI用マイグレーション（適用済み）
```

## 環境変数

### Vercel 本番環境（設定済み）

| 変数名 | 説明 | 設定方法 |
|--------|------|---------|
| `SUPABASE_URL` | `https://hzofpqlhrlveqnjsoaae.supabase.co` | Vercel REST API で設定（⚠️ echo禁止） |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role JWT | Vercel REST API で設定（⚠️ echo禁止） |
| `NEXT_PUBLIC_APP_URL` | `https://zerocost-lp.vercel.app` | Vercel Dashboard or CLI |

### ローカル開発

```bash
# .env.local を作成（.env.local.example を参照）
cp .env.local.example .env.local
# SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を実際の値に置き換える
```

## APIエンドポイント

### `POST /api/register`

メールアドレスを受け取り、zerocost-router から zc-key を発行して Supabase に保存する。

**リクエスト:**
```json
{ "email": "user@example.com" }
```

**レスポンス（成功）:**
```json
{ "key": "zc-xxxxxxxxxxxxxxxxxxxx" }
```

**フロー:**
1. メール形式バリデーション
2. Supabase で重複チェック（同一メールのキーが既にあれば 409）
3. `POST https://zerocost-router.dragonrondo.workers.dev/v1/keys` → zc-key 取得
4. Supabase `zerocost_keys` テーブルに INSERT

**注意:** DB INSERT に失敗してもキーは返す（ユーザー体験優先・コンソールにエラーログ）

## Supabase 設定

- **プロジェクト:** `hzofpqlhrlveqnjsoaae` （ai-model-tracker プロジェクトを共用）
- **テーブル:** `zerocost_keys`
- **RLS:** 有効（service_role のみ全操作許可）

### テーブルスキーマ

```sql
CREATE TABLE zerocost_keys (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text        NOT NULL,
  zc_key      text        UNIQUE NOT NULL,
  plan        text        NOT NULL DEFAULT 'free',  -- 'free' / 'basic' / 'pro'
  status      text        NOT NULL DEFAULT 'active',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
CREATE INDEX zerocost_keys_email_idx ON zerocost_keys (email);
```

### Supabase CLIでのマイグレーション操作

```bash
# リンク確認（既に linked 済み）
supabase status

# マイグレーション適用状況確認
supabase db push --dry-run

# 新規マイグレーション作成
supabase migration new <name>
```

## デプロイ

**GitHub push → Vercel 自動デプロイ**（連携済み）

```bash
git add .
git commit -m "feat: ..."
git push origin master
# Vercel が自動でビルド・デプロイ（約1〜2分）
```

### 手動デプロイ（必要な場合）

```bash
cd "D:\antigravity_projects\zerocost-lp"
npx vercel --prod --yes
```

### ビルド確認

```bash
cd "D:\antigravity_projects\zerocost-lp"
npx next build
```

## Vercel 環境変数の設定・更新方法

**⚠️ 絶対に `echo '<value>' | vercel env add` を使わない。PowerShell の echo は UTF-8 BOM を付加する。**

### 正しい設定方法（Vercel REST API）

```python
# C:\Users\Tenormusica\scripts\set_vercel_env_api.py を使用
python "C:\Users\Tenormusica\scripts\set_vercel_env_api.py"
```

スクリプト内の定数:
- `TOKEN`: `C:\Users\Tenormusica\AppData\Roaming\com.vercel.cli\Data\auth.json` の `token` フィールド
- `PROJECT_ID`: `prj_tfvFktMG5C2uKbrl8hzDEBtVz6Ck`
- `TEAM_ID`: `team_pMoEpUH3hJFyXfl68GRSkRBA`

### 環境変数の削除

```bash
npx vercel env rm SUPABASE_URL production --yes
npx vercel env rm SUPABASE_SERVICE_ROLE_KEY production --yes
```

### BOM汚染の診断

環境変数が BOM 汚染されているか確認するには `/api/debug` エンドポイントを使う。
（通常は本番コードにないため、診断が必要な場合は一時的に `app/api/debug/route.ts` を作成してデプロイ→確認後に削除する）

```typescript
// app/api/debug/route.ts（診断用・使用後は必ず削除）
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    supabase_url_prefix: process.env.SUPABASE_URL?.slice(0, 30) ?? null,
    service_key_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0,
  });
}
```

## ローカル開発

```bash
cd "D:\antigravity_projects\zerocost-lp"
npx next dev
# → http://localhost:3000
```

zerocost-router は本番 URL（`https://zerocost-router.dragonrondo.workers.dev`）に向いているため、ローカル開発中でも本番ルーターを使用する。

## 関連プロジェクト

| プロジェクト | パス | 役割 |
|-------------|------|------|
| **zerocost-router** | `C:\Users\Tenormusica\zerocost-router` | `POST /v1/keys` で zc-key を発行。このLPが呼び出すルーター本体 |
| **zerocost-llm-tracker** | `C:\Users\Tenormusica\zerocost-llm-tracker` | クォータ追跡Worker。ルーターがService Binding経由で参照 |

## 学んだ教訓

- **PowerShell `echo` + `vercel env add` = BOM汚染**: `\ufeff` が env var の先頭に混入し、Supabase URL が無効になる。Vercel REST API 経由で設定することで回避できる。
- **Supabase クライアントの遅延初期化**: `createClient()` をモジュールレベルで実行すると Next.js ビルド時（env var が未設定）にエラーになる。`getSupabaseAdmin()` 関数内で初回呼び出し時に初期化する遅延パターンを使う。
- **Vercel CLI の bash 非互換**: `npx vercel` を bash から実行すると出力なし・実行されないことがある。GitHub push での自動デプロイを基本とする。
