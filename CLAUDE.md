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
| stripe | ^17 | Stripe Node.js SDK |
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
    stripe/
      checkout/
        route.ts           # POST /api/stripe/checkout: Stripe Checkout Session 作成 → URL返却
      webhook/
        route.ts           # POST /api/stripe/webhook: Webhook署名検証 → plan更新・zc-key発行
  upgrade/
    [plan]/
      page.tsx             # /upgrade/basic|pro: メール入力 → Checkout Session → Stripe Checkout
    success/
      page.tsx             # /upgrade/success: 支払い完了ページ（アニメーションあり）
  dashboard/
    layout.tsx             # サイドバー付きダッシュボードレイアウト（i18n対応）
    page.tsx               # ダッシュボードトップ（使用量・プラン・APIキー概要）
    api-keys/
      page.tsx             # APIキー管理（表示・再発行）
    providers/
      page.tsx             # プロバイダーキー登録（Groq/Cerebras/HuggingFace）
      actions.ts           # addProvider / deleteProvider Server Actions
    usage/
      page.tsx             # 使用量詳細（月次グラフ・リセット日）
  lib/
    supabase/
      admin.ts             # Supabase admin クライアント（遅延初期化パターン）
      server.ts            # Supabase SSR クライアント（createServerClient）
    locale.ts              # クライアント向けロケール定義（DASHBOARD_MESSAGES等）
    server-locale.ts       # サーバー向けロケール取得（next/headers依存。localeと分離必須）
    stripe.ts              # Stripe クライアント（遅延初期化・getStripe()）
  components/
    LocaleToggle.tsx       # 言語切り替えボタン（Cookie設定 → ページリロード）
sql/
  create_zerocost_keys.sql # テーブル定義（参考用）
supabase/
  migrations/
    20260228000000_create_zerocost_keys.sql  # zerocost_keys テーブル作成（適用済み）
    20260228100000_add_stripe_columns.sql    # stripe_customer_id / stripe_subscription_id / subscription_status 追加（適用済み）
```

## 環境変数

### Vercel 本番環境（設定済み）

| 変数名 | 説明 | 設定方法 |
|--------|------|---------|
| `SUPABASE_URL` | `https://hzofpqlhrlveqnjsoaae.supabase.co` | Vercel REST API で設定（⚠️ echo禁止） |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role JWT | Vercel REST API で設定（⚠️ echo禁止） |
| `NEXT_PUBLIC_ROUTER_BASE` | zerocost-router の Base URL（`https://zerocost-router.dragonrondo.workers.dev`） | Vercel REST API で設定 |
| `STRIPE_SECRET_KEY` | Stripe シークレットキー（`sk_test_...` or `sk_live_...`） | Vercel REST API で設定 |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook 署名シークレット（`whsec_...`） | Vercel REST API で設定 |
| `NEXT_PUBLIC_APP_URL` | `https://zerocost-lp.vercel.app` | Vercel Dashboard or CLI（success_url / cancel_url の組み立てに使用） |

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
2. Supabase で重複チェック（同一メールのアクティブなキーが既にあれば **200 + 既存キーを返して終了**。冪等性設計）
3. `POST https://zerocost-router.dragonrondo.workers.dev/v1/keys` → zc-key 取得
4. Supabase `zerocost_keys` テーブルに INSERT

**注意:** DB INSERT に失敗してもキーは返す（ユーザー体験優先・コンソールにエラーログ）

### `POST /api/stripe/checkout`

LP の Pricing ボタン → `/upgrade/[plan]` のフォーム送信先。Stripe Checkout Session を作成して URL を返す。

**リクエスト:**
```json
{ "email": "user@example.com", "plan": "basic" }
```

**レスポンス（成功）:**
```json
{ "url": "https://checkout.stripe.com/c/pay/cs_..." }
```

**フロー:**
1. `plan` が `basic` / `pro` か検証
2. メール形式バリデーション
3. 既存 Stripe Customer 検索 → なければ新規作成
4. `stripe.checkout.sessions.create()` で Checkout Session 作成（mode: subscription, currency: jpy, locale: ja）
5. `session.url` を返却 → クライアントが `window.location.href` でリダイレクト

**重複購入防止:** 同じプランで既に active な subscription があれば 409 を返す。

### `POST /api/stripe/webhook`

Stripe からの Webhook を受け取り、plan 更新・zc-key 発行を行う。

**⚠️ raw body が必要:** `request.text()` を使う（`request.json()` だと署名検証が失敗する）

**処理イベント:**
- `checkout.session.completed` → zerocost_keys を upsert（plan / stripe_customer_id / stripe_subscription_id / subscription_status 更新・zc_key 未保有の場合は新規発行）
- `customer.subscription.deleted` → plan を `free` に戻す・subscription_status を `canceled` に更新

## Supabase 設定

- **プロジェクト:** `hzofpqlhrlveqnjsoaae` （ai-model-tracker プロジェクトを共用）
- **テーブル:** `zerocost_keys`
- **RLS:** 有効（service_role のみ全操作許可）

### テーブルスキーマ

```sql
CREATE TABLE zerocost_keys (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email                   text        NOT NULL,
  zc_key                  text        UNIQUE NOT NULL,
  plan                    text        NOT NULL DEFAULT 'free',  -- 'free' / 'basic' / 'pro'
  status                  text        NOT NULL DEFAULT 'active',
  stripe_customer_id      text        UNIQUE,                   -- Stripe Customer ID
  stripe_subscription_id  text        UNIQUE,                   -- Stripe Subscription ID
  subscription_status     text        NOT NULL DEFAULT 'none',  -- 'none' / 'active' / 'canceled'
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);
CREATE INDEX zerocost_keys_email_idx ON zerocost_keys (email);
CREATE INDEX zerocost_keys_stripe_customer_idx ON zerocost_keys (stripe_customer_id);
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
# ⚠️ bash から実行すると出力なしで失敗する場合あり → 学んだ教訓参照
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

## Stripe 連携

### プラン・料金

| プラン | 金額 | requests/月 | Stripe Product |
|--------|------|------------|----------------|
| Basic  | ¥500 | 10,000     | zerocost Basic |
| Pro    | ¥1,500 | 100,000  | zerocost Pro   |

**注意:** JPY は小数なし。`unit_amount` は整数（¥500 → `500`）。

### Webhook 設定（本番）

- **エンドポイント:** `https://zerocost-lp.vercel.app/api/stripe/webhook`
- **登録イベント:**
  - `checkout.session.completed`
  - `customer.subscription.deleted`
- Stripe Dashboard → Developers → Webhooks から確認・管理

### テスト

```bash
# Stripe CLI でローカル転送
stripe listen --forward-to localhost:3000/api/stripe/webhook

# テストカード
# 成功: 4242 4242 4242 4242 / 任意の未来の有効期限 / 任意のCVC
# 要認証: 4000 0025 0000 3155
# 失敗: 4000 0000 0000 9995
```

### 冪等性・安全設計

- `stripe_subscription_id` に UNIQUE 制約 → 重複 INSERT 防止
- 同一プランの active subscription がある場合は Checkout Session 作成前に 409 返却
- Webhook は `stripe.webhooks.constructEvent()` で署名検証必須

## 学んだ教訓

- **PowerShell `echo` + `vercel env add` = BOM汚染**: `\ufeff` が env var の先頭に混入し、Supabase URL が無効になる。Vercel REST API 経由で設定することで回避できる。
- **Supabase クライアントの遅延初期化**: `createClient()` をモジュールレベルで実行すると Next.js ビルド時（env var が未設定）にエラーになる。`getSupabaseAdmin()` 関数内で初回呼び出し時に初期化する遅延パターンを使う。
- **Vercel CLI の bash 非互換**: `npx vercel` を bash から実行すると出力なし・実行されないことがある。GitHub push での自動デプロイを基本とする。
- **locale.ts と server-locale.ts の分離**: `next/headers` を使う関数（Cookie読み取り等）を `locale.ts` に混在させると Turbopack がクライアントバンドルに含めようとしてビルドエラーになる。サーバー専用の関数は `server-locale.ts` に分離する。
- **Stripe Webhook は `request.text()` で raw body 取得**: `request.json()` で先に body を消費すると `stripe.webhooks.constructEvent()` の署名検証が失敗する。
- **Stripe 重複チェックはプランキーベースで**: `price_data` を毎回動的生成する場合、amount_total での比較は額面が同じ別プランと区別できない。`session.metadata.plan` でプランを識別する。
