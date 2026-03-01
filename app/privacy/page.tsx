import Link from "next/link";

export const metadata = {
  title: "プライバシーポリシー | zerocost",
  description: "zerocost サービスのプライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* ヘッダー */}
      <header className="border-b border-slate-100 px-6 py-4">
        <Link
          href="/"
          className="text-lg font-extrabold tracking-tight text-slate-900"
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          zerocost
        </Link>
      </header>

      {/* コンテンツ */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1
          className="text-3xl font-bold text-slate-900 mb-2"
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          プライバシーポリシー
        </h1>
        <p className="text-sm text-slate-400 mb-12">最終更新日: 2026年3月1日</p>

        <div className="prose prose-slate max-w-none space-y-10 text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">1. はじめに</h2>
            <p className="text-slate-600">
              zerocost（以下「当サービス」）は、ユーザーのプライバシーを尊重し、
              個人情報の保護に努めます。本プライバシーポリシーは、当サービスが収集する情報、
              その利用目的、および第三者との共有方法について説明するものです。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">2. 収集する情報</h2>
            <p className="text-slate-600 mb-3">当サービスは以下の情報を収集します。</p>

            <h3 className="text-sm font-semibold text-slate-800 mb-2">2-1. ユーザーが提供する情報</h3>
            <ul className="list-disc list-inside text-slate-600 space-y-1 pl-2 mb-4">
              <li>メールアドレス（APIキー発行・アカウント管理に使用）</li>
              <li>LLMプロバイダーのAPIキー（Groq・Cerebras・HuggingFace等）</li>
              <li>クレジットカード情報（Stripeが直接処理。当サービスのサーバーには保存されません）</li>
            </ul>

            <h3 className="text-sm font-semibold text-slate-800 mb-2">2-2. 自動的に収集される情報</h3>
            <ul className="list-disc list-inside text-slate-600 space-y-1 pl-2">
              <li>APIリクエストのログ（利用量の計測・クォータ管理に使用）</li>
              <li>IPアドレス（不正利用の防止に使用）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">3. 情報の利用目的</h2>
            <p className="text-slate-600 mb-2">収集した情報は以下の目的で使用します。</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 pl-2">
              <li>本サービスの提供・運営（APIキーの発行・管理・認証）</li>
              <li>利用量の計測およびクォータ管理</li>
              <li>有料プランの請求処理</li>
              <li>サービスに関する重要なお知らせの送信</li>
              <li>不正利用の検知・防止</li>
              <li>サービスの改善・新機能開発</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">4. 第三者サービスへの情報提供</h2>
            <p className="text-slate-600 mb-3">
              当サービスは以下の第三者サービスを利用しており、必要な範囲でデータを共有します。
            </p>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="font-medium text-slate-800 mb-1">Supabase</p>
                <p className="text-slate-600">
                  データベースサービス。メールアドレス・APIキー・プラン情報を安全に保管します。
                  <br />
                  <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">プライバシーポリシー</a>
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="font-medium text-slate-800 mb-1">Stripe</p>
                <p className="text-slate-600">
                  決済処理サービス。クレジットカード情報はStripeが直接処理し、当サービスのサーバーには保存されません。
                  <br />
                  <a href="https://stripe.com/jp/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">プライバシーポリシー</a>
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="font-medium text-slate-800 mb-1">Vercel</p>
                <p className="text-slate-600">
                  ホスティングサービス。Webアプリケーションの配信に使用します。
                  <br />
                  <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">プライバシーポリシー</a>
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="font-medium text-slate-800 mb-1">LLMプロバイダー（Groq・Cerebras・HuggingFace等）</p>
                <p className="text-slate-600">
                  ユーザーが送信するAPIリクエストは、選択されたプロバイダーに転送されます。
                  各プロバイダーのプライバシーポリシーが適用されます。
                </p>
              </div>
            </div>

            <p className="text-slate-600 mt-4">
              上記以外の第三者に個人情報を提供することは、法令に基づく場合を除き行いません。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">5. データの保管・セキュリティ</h2>
            <p className="text-slate-600 mb-2">
              収集した個人情報は、Supabase（PostgreSQL）に安全に保管されます。
              アクセスはサービスロールキーによる認証が必要であり、Row Level Security（RLS）により保護されています。
            </p>
            <p className="text-slate-600">
              ユーザーが登録したLLMプロバイダーのAPIキーは、当サービスのサーバー（Cloudflare Workers）上で処理されます。
              APIキーの取り扱いには十分なセキュリティ対策を講じていますが、インターネット上でのデータ送信には
              固有のリスクが伴う点をご了承ください。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">6. Cookieについて</h2>
            <p className="text-slate-600">
              当サービスは、ダッシュボードの表示言語設定のためにCookieを使用する場合があります。
              ブラウザの設定でCookieを無効にすることは可能ですが、一部機能が正常に動作しない場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">7. ユーザーの権利</h2>
            <p className="text-slate-600 mb-2">ユーザーは以下の権利を有します。</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 pl-2">
              <li>保有する個人情報の開示請求</li>
              <li>誤った個人情報の訂正請求</li>
              <li>個人情報の削除請求（アカウント退会）</li>
            </ul>
            <p className="text-slate-600 mt-3">
              これらのご要望は <a href="mailto:dragonrondo@gmail.com" className="text-indigo-600 hover:underline">dragonrondo@gmail.com</a> までお問い合わせください。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">8. 未成年者の利用</h2>
            <p className="text-slate-600">
              本サービスは13歳未満の方を対象としていません。
              13歳未満の方の個人情報を収集したことが判明した場合、速やかに削除します。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">9. プライバシーポリシーの変更</h2>
            <p className="text-slate-600">
              当サービスは、必要に応じて本プライバシーポリシーを変更する場合があります。
              変更後のポリシーは本ページに掲載した時点で効力を生じます。
              重要な変更がある場合は、サービス内または登録メールアドレス宛にお知らせします。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">10. お問い合わせ</h2>
            <p className="text-slate-600">
              本プライバシーポリシーに関するお問い合わせは以下までご連絡ください。<br />
              メール: <a href="mailto:dragonrondo@gmail.com" className="text-indigo-600 hover:underline">dragonrondo@gmail.com</a>
            </p>
          </section>

        </div>
      </div>

      {/* フッター */}
      <footer className="border-t border-slate-100 py-8 px-6 text-center text-slate-400 text-sm">
        <p>
          <Link href="/" className="hover:text-slate-600 transition-colors">zerocost</Link>
          {" · "}
          <Link href="/terms" className="hover:text-slate-600 transition-colors">利用規約</Link>
        </p>
      </footer>
    </main>
  );
}
