import Link from "next/link";

export const metadata = {
  title: "利用規約 | zerocost",
  description: "zerocost サービスの利用規約",
};

export default function TermsPage() {
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
          利用規約
        </h1>
        <p className="text-sm text-slate-400 mb-12">最終更新日: 2026年3月1日</p>

        <div className="prose prose-slate max-w-none space-y-10 text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">第1条（適用）</h2>
            <p className="text-slate-600">
              本利用規約（以下「本規約」）は、zerocost（以下「当サービス」）が提供する
              zerocost-router APIプロキシサービスおよびこれに付随するすべてのサービス（以下「本サービス」）の
              利用条件を定めるものです。ユーザーは本規約に同意した上で本サービスを利用するものとします。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">第2条（サービスの概要）</h2>
            <p className="text-slate-600">
              本サービスは、Groq・Cerebras・HuggingFace等の無料枠LLMプロバイダーへのアクセスを
              OpenAI互換APIエンドポイント経由で提供するAPIプロキシサービスです。
              ユーザーは登録メールアドレスに紐づくAPIキー（zc-key）を取得し、本サービスを利用できます。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">第3条（利用登録）</h2>
            <p className="text-slate-600 mb-2">
              本サービスの利用を希望する方は、有効なメールアドレスを登録することでzc-keyの発行を受けられます。
              以下に該当する方は登録・利用できません。
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 pl-2">
              <li>日本国内の法令に違反する目的での利用を意図する方</li>
              <li>過去に本サービスの利用を停止された方</li>
              <li>その他、当サービスが利用登録を不適切と判断した方</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">第4条（料金・サブスクリプション）</h2>
            <p className="text-slate-600 mb-3">
              本サービスには無料プランと有料プランがあります。有料プランの料金は以下のとおりです。
            </p>
            <div className="bg-slate-50 rounded-lg p-4 mb-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-700 font-medium">
                    <td className="pb-2">プラン</td>
                    <td className="pb-2">料金（税込）</td>
                    <td className="pb-2">月間リクエスト数</td>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  <tr>
                    <td className="py-1">Basic</td>
                    <td className="py-1">¥500/月</td>
                    <td className="py-1">10,000リクエスト</td>
                  </tr>
                  <tr>
                    <td className="py-1">Pro</td>
                    <td className="py-1">¥1,500/月</td>
                    <td className="py-1">100,000リクエスト</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-600">
              有料プランはStripeを通じたクレジットカード決済による月次サブスクリプション制です。
              支払いが完了した月の翌月から、次回請求日の前日までサービスをご利用いただけます。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">第5条（キャンセル・返金ポリシー）</h2>
            <p className="text-slate-600 mb-2">
              有料プランのキャンセルはいつでも可能です。キャンセル後は、現在の請求期間終了時にサブスクリプションが停止されます。
            </p>
            <p className="text-slate-600 mb-2">
              原則として、購入済みのサブスクリプション期間に対する返金は行いません。
              ただし、当サービス側の重大な障害によりサービスが長期間利用不能となった場合は、
              個別にご相談の上、返金または次月への繰り越し等の対応を検討します。
            </p>
            <p className="text-slate-600">
              返金のご要望は <a href="mailto:dragonrondo@gmail.com" className="text-indigo-600 hover:underline">dragonrondo@gmail.com</a> までお問い合わせください。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">第6条（禁止事項）</h2>
            <p className="text-slate-600 mb-2">ユーザーは以下の行為を行ってはなりません。</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 pl-2">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>当サービスのサーバーまたはネットワークに過度な負荷をかける行為</li>
              <li>当サービスの運営を妨害する行為</li>
              <li>他のユーザーの情報を不正に取得・利用する行為</li>
              <li>当サービスが意図しない方法でAPIキーを不正使用・転売する行為</li>
              <li>その他、当サービスが不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">第7条（サービスの変更・停止）</h2>
            <p className="text-slate-600">
              当サービスは、ユーザーへの事前通知なく本サービスの内容を変更または提供を停止することがあります。
              これによってユーザーに生じた損害について、当サービスは一切の責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">第8条（免責事項）</h2>
            <p className="text-slate-600 mb-2">
              当サービスは、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、
              有効性、特定の目的への適合性等を含む）がないことを明示的にも黙示的にも保証しておりません。
            </p>
            <p className="text-slate-600">
              当サービスは、本サービスに起因してユーザーに生じたあらゆる損害について、
              一切の責任を負いません。ただし、当サービスの故意または重大な過失による場合はこの限りではありません。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">第9条（規約の変更）</h2>
            <p className="text-slate-600">
              当サービスは、必要と判断した場合、ユーザーへの通知なく本規約を変更できるものとします。
              変更後の規約は本ページに掲載した時点から効力を生じるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">第10条（準拠法・管轄裁判所）</h2>
            <p className="text-slate-600">
              本規約の解釈にあたっては、日本法を準拠法とします。
              本サービスに関して紛争が生じた場合、当サービスの所在地を管轄する裁判所を
              専属的合意管轄裁判所とします。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">お問い合わせ</h2>
            <p className="text-slate-600">
              本規約に関するお問い合わせは以下までご連絡ください。<br />
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
          <Link href="/privacy" className="hover:text-slate-600 transition-colors">プライバシーポリシー</Link>
        </p>
      </footer>
    </main>
  );
}
